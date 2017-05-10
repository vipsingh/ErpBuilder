const _ = require('lodash');
const Promise = require('bluebird'),
  EventEmitter = require('events'),
  ModelRepo  = require('./modelrepo'),
  Field = require('../schema/modelField'),
  Errors = require('../errors'),
  Utils = require('../utils');

class BaseRepo extends ModelRepo{
  constructor(name, fields, op = {}){
    super(name,fields,op);
    this.is_primary = true;
    this.is_child_member = false;//child member of other object entity

    this.validate_config = {};//model level validation functions
    ///field config
    this.field_number = null;
    this.field_image = null;
    this.field_serial = null;
    ///***********

    this.sessionParams = {UserId: 1, UserRoleCodes: ['SA'], UserType: 1, BaseCurrencyId: 1};//require('../currentContext').getSession();
    this.custom_functions ={};
    this.custom_events = new EventEmitter();
    //** before_insert, validate, on_save on_submit on_reject on_delete

    //* Access Role Mapping => in database
  }

  _init_(){

  }

  /*Predefined filter for this object*/
  _get_pre_filter_(){
    var pre_filter = {};
    if(this._extend_with_ && this._extend_with_.name && this._extend_with_.init_by){
      var d = Object.assign({}, this._extend_with_.init_by);
      pre_filter = d;
    }
    return pre_filter;
  }

  /*bind model to json for deliver over http*/
  bind_model_json(id){
    var that = this;
    if(id)
      id = Number(id);
    if(id){
      return new Promise((resolve, reject)=>{
        that.get_single(id).then(function(m_js) {
          let m_x = that.new_object_json();
          _.each(_.keys(m_js), function(pr) {
            if(!_.has(m_x, pr))
              m_js = _.omit(m_js, [pr]);
          });
          resolve(m_js);
        }).catch(function(err) {
          reject(err);
        });
      });
    }
    else {
      return new Promise((resolve, reject)=>{
        let m = that.new_object_json();
        resolve(m);
      });
    }
  }

  /*Fetch schema of object.
  */
  get_schema(){
    try{
      var that = this;
      var m_fields = this.get_fields();
      function buildSchema(fields) {
        var m_schema = {};
        _.each(_.keys(fields), function (prop) {
            m_schema[prop] = fields[prop].toJson();
            if(m_schema[prop].ref_object){
              let ref_obj = new that.StackApp.ObjectRepo[fields[prop].ref_object]();
              m_schema[prop].fields = buildSchema(ref_obj.get_fields());
            }
        });
        m_schema = _.omit(m_schema,['id']);
        return m_schema;
      }

      var schema = buildSchema(m_fields);
      return {name:this.name, text: this.text,
        view_type:'form', field_title:this.field_title,
        fields: schema };
    }
    catch(ex){
      throw new Errors.InternalServerError('Error in creating schema['+this.name+']. '+ex.message);
    }
  }



  /*get single record*/
  get_single(id, op = {fields: null}){
    return new Promise((resolve, reject)=>{
      var that = this;
      var fields = this.get_fields(), related_fields = [];
      _.map(fields,(fl)=>{
        if(fl.type == 'one_to_many' || fl.type == 'one_to_one'){
          related_fields.push([fl.name, fl.type, fl.ref_object]);
        }
      });
      let qry_op = {};
      if(op.fields){
        let f_arr = op.fields.split(',');
        qry_op.select = [...f_arr];
      }
      this.build_object_db_query((qry)=>{
        return qry.where(that.db_model_name + ".id","=",id);
      }, qry_op).then((rds)=>{
        //related
        let cnt = 0;
        _.each(related_fields,(f)=>{
          //let ref_m_name = (new this.StackApp.ObjectRepo[f[2]]()).db_model_name;
          let ref_obj = new that.StackApp.ObjectRepo[f[2]]();
          ref_obj.build_object_db_query((q1)=>{
            return q1.where(`${ref_obj.db_model_name}.${this.db_model_name}_id`,"=",id);
          }).then((rds_1)=>{
            if(f[1] == 'one_to_one'){
              rds[0][f[0]] = (rds_1.length > 0)? rds_1[0]: {};
            }
            else
              rds[0][f[0]] = rds_1;
            cnt++;
            if(cnt === related_fields.length)
              resolve(rds[0]);
          });
        });
        //resolve(rds[0]);
      }).catch(err => reject(err));
    });
  }

  /*get all data based on criteria*/
  get_list(op = {where: {}, orderBy:{}}){
    op.orderBy = op.orderBy || {field: this.field_title, dir: 'ASC'};
    return new Promise((resolve, reject)=>{
      let that = this, pre_filter = this._get_pre_filter_(), related = [];
      this.build_object_db_query((qry)=>{
        if(Object.keys(pre_filter).length > 0){
          op.where = Object.assign({}, op.where, pre_filter);
        }
        let where_raw = Utils.dataFilter.buildFilterKnexQuery(op.where, {search: op.search, fields:that.search_fields}, this);
        return qry.where(where_raw).orderBy(op.orderBy.field, op.orderBy.dir);
      }).then((rds)=>{
        resolve(rds);
      }).catch(err => reject(err));
    });
  }

  /*get all data with only simple fields(for dropdown or small list)*/
  get_simple_list(op = {where: {}}){
    op.orderBy = op.orderBy || {field: this.field_title, dir: 'ASC'};
    return new Promise((resolve, reject)=>{
      var that = this, pre_filter = this._get_pre_filter_();
      this.build_object_db_query((qry)=>{
        if(Object.keys(pre_filter).length > 0){
          op.where = Object.assign({}, op.where, pre_filter);
        }
        let where_raw = Utils.dataFilter.buildFilterKnexQuery(op.where, {search: op.search, fields:that.search_fields}, this);
        return qry.where(where_raw).orderBy(op.orderBy.field, op.orderBy.dir);
      }, {select: [that.db_model_name + '.id', that.db_model_name + '.' + that.field_title]}).then((lst)=>{
        let lst_res = _.map(lst, function(val){
          return {id: val.id, title: val[that.field_title]};
        });
        resolve(lst_res);
      }).catch(err => reject(err));
    });
  }

  /*save record*/
  save(model){
    var that = this;
    return new Promise((resolve, reject)=>{
      try{
        var obj_model = that.build_object_model(model);
        //this.custom_events.emit('before_save', obj_model);
        var smp_model = that.simplified_object_model(obj_model);
        if(this.validate(obj_model)){
          that.StackApp.ObjectModel._bookshelf.transaction(function(trnx) {
            //Header Model save **************
            var base_model = {};
            _.each(_.keys(obj_model), function(flds) {
              if(obj_model[flds].ref_object){
              }
              else{
                base_model[flds] = obj_model[flds].value;
              }
            });
            base_model = _.omit(base_model,['created_at','updated_at']);
            if(!base_model.id){
              base_model = _.omit(base_model,['id']);
              base_model.created_by = 1;//current user
            }
            base_model.updated_by = 1;//current user
            // if(base_model.status && !base_model.id)
            //   base_model.status = that.status.Open;
            //**************
            /**
            +++ TODO Timestamp check for concurrency. +++
            */
            var t_obj = new that.StackApp.ObjectModel[that.db_model_name](base_model);
            return t_obj.save(null,{transacting: trnx}).tap(function(b_model) {
              //Related model save.
              let child_obj_to_save = [];
              _.each(_.keys(obj_model), function(flds) {
                if(obj_model[flds].isObjectListType && obj_model[flds].ref_object){
                  child_obj_to_save.push({name: obj_model[flds].ref_object, ref_field: that.db_model_name +'_id', data: smp_model[obj_model[flds].name]});
                }
                else if(!obj_model[flds].isObjectListType && obj_model[flds].ref_object){
                  child_obj_to_save.push({name: obj_model[flds].ref_object, ref_field: that.db_model_name +'_id', data: [smp_model[obj_model[flds].name]]});
                }
              });
              //call other model to save in this transaction
              return Promise.map(child_obj_to_save, function(ref_o_inf) {
                return Promise.map(ref_o_inf.data, function(info) {
                  // Some validation could take place here.
                  var pi_info ={};
                  pi_info[ref_o_inf.ref_field] = b_model.id;
                  info = _.omit(info,['created_at','updated_at']);
                  if(!info.id || Number(info.id) <= 0){
                    info = _.omit(info,['id']);
                    info.created_by = 1;//current user
                  }
                  info.updated_by = 1;//current user
                  return new that.StackApp.ObjectModel[ref_o_inf.name](info).save(pi_info, {transacting: trnx});
                });
              });

            });
          }).then(function(h_model) {
            resolve(h_model.id);
          }).catch(function(err) {
            console.error(err);
            reject(err);
          });
        }
      }
      catch(exmain){
        reject(exmain);
      }
    });
  }

  /*validate object before saving*/
  validate(obj_model) {
    //https://github.com/chriso/validator.js
    var that = this;
    function validator(md) {
      _.each(_.keys(md), function (prop) {
        if(md[prop].isObjectListType){
          that.validate_field(md[prop]);
          _.each(md[prop].value, function(arr_val) {
            validator(arr_val);
          });
        }
        else if(!md[prop].isObjectListType && md[prop].ref_object){
          validator(md[prop].value);
        }
        else{
          if(prop != 'id')
            that.validate_field(md[prop]);
        }
      });
    }
    validator(obj_model);
    return true;
  }

  /*validate field(used in validate function)$internal*/
  validate_field(field) {
    if(field.required && !field.value)
      throw new Errors.ValidationError("[" + field.text + "] is required.");
    if(!field.nullable && field.value === null)
      throw new Errors.ValidationError("[" + field.text + "]  can not be null.");
  }

  /*build model object from json*/
  build_object_model(json_model) {
      var that = this;
      function buildObject(fields, b_model) {
          _.each(_.keys(fields), function (prop) {
              let d_o = fields[prop]();
              d_o.name = prop;
              d_o.value = b_model[prop];
              b_model[prop] = d_o;
              if (d_o.isObjectListType && d_o.ref_object) {
                  let ref_obj = new that.StackApp.ObjectRepo[d_o.ref_object]();
                  _.each(b_model[d_o.name].value, function (md) {
                      buildObject(ref_obj.fields, md);
                  });
              }
              else if(!d_o.isObjectListType && d_o.ref_object){
                let ref_obj = new that.StackApp.ObjectRepo[d_o.ref_object]();
                buildObject(ref_obj.fields, b_model[d_o.name].value);
              }
              d_o.$this = b_model;
              d_o.$root = rt_model;
          });

      }
      var rt_model = Object.assign({}, json_model);
      var flds = {};
      if(this._extend_with_ && this._extend_with_.name){
        let ext_model_obj = new that.StackApp.ObjectRepo[this._extend_with_.name]();
        var ext_fields = ext_model_obj.fields;
        flds = Object.assign(flds, ext_fields);
      }
      flds = Object.assign(flds, this.fields);
      buildObject(flds, rt_model);
      if(this._extend_with_ && this._extend_with_.init_by){
        _.each(_.keys(this._extend_with_.init_by), function(ext_prop) {
          rt_model[ext_prop].value = that._extend_with_.init_by[ext_prop];
        });
      }
      return rt_model;
  }

  /*build json from model object*/
  simplified_object_model(build_model){
    var _js_obj ={};
    function simplified(md, js_obj) {
      _.each(_.keys(md), function (prop) {
        if(md[prop] && md[prop].isObjectListType){
          js_obj[prop] = [];
          _.each(md[prop].value, function(arr_val) {
            let t_d ={};
            simplified(arr_val, t_d);
            js_obj[prop].push(t_d);
          });
        }
        else if(md[prop] && !md[prop].isObjectListType && md[prop].ref_object){
          let t_d ={};
          simplified(md[prop].value, t_d);
          js_obj[prop] = t_d;
        }
        else{
          if(_.isObject(md[prop]))
            js_obj[prop] = md[prop].value;
          else
            js_obj[prop] = md[prop];
        }
      });
    }
    simplified(build_model, _js_obj);
    return _js_obj;
  }

  /*execute custom function defined in object file in app*/
  execute_custom_func(fun_name, args) {
      if (this.custom_functions[fun_name])
          return this.custom_functions[fun_name].call(this, args);
      else
          return null;
  }

  /*execute before initialising view*/
  on_view_init(){

  }

}
BaseRepo.clientScripts = [];
BaseRepo.clientFunctions = [];//custom function on client
BaseRepo.custom_actions = [];//define actions button on page

// CustomerModel.custom_actions.push({
//   type: 'server_action',//client_action, url_action, wf_action, window_action
//   id: 'act_send_mail',
//   func: 'send_mail',
//   wf: {//for workflow action
//     transition: 'tr_1'
//   }
// });
//window_action => call any window on client. ex: any browser report, new entry, object view

module.exports = BaseRepo;

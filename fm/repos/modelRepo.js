
const _ = require('lodash');
const Promise = require('bluebird'),
  Field = require('../schema/modelField'),
  Errors = require('../errors');

class ModelRepo{
  constructor(name, fields, op = {}){
    this.name = name;
    this._extend_with_ = op._extend_with_ ||  null;//{name:'', init_by:{}}
    this.db_model_name = this.name;
    var m_fields ={
      id: Field.KeyField('Id'),
      created_at: Field.DateTimeField('CreatedAt',{read_only:true, hidden: true}),
      updated_at: Field.DateTimeField('UpdatedAt', {read_only:true, hidden: true}),
      created_by: Field.IntegerField('CreatedBy', {read_only:true, hidden: true}),
      updated_by: Field.IntegerField('UpdatedBy', {read_only:true, hidden: true})
    };
    // created_by: Field.LinkField('CreatedBy', 'User', {read_only:true, hidden: true}),
    // updated_by: Field.LinkField('UpdatedBy', 'User', {read_only:true, hidden: true})

    if(this._extend_with_ && this._extend_with_.name){
      this.fields = fields;
      this.db_model_name = this._extend_with_.name;
    }
    else{
      this.fields =_.assignIn(m_fields, fields);
    }
    this.is_primary = false;
    this.is_child_member = true;
    this.text = '';

    this.StackApp = require('../stackApp').getDefault();
  }

  /*called on bookshelf model building operation.
    usefull when you want to modify bookshelf model config.*/
  _schema_building_(modelConfig){

  }

  /*for inserting initial data in model*/
  _build_data_(knex){
    return new Promise((resolve)=>{resolve(true);});
  }

  /*get all fields structure*/
  get_fields(){
    var that = this, d ={};
    var flds = {};
    if(this._extend_with_ && this._extend_with_.name){
      let ext_model_obj = new that.StackApp.ObjectRepo[this._extend_with_.name]();
      flds = Object.assign(flds, ext_model_obj.fields);
    }
    flds = Object.assign(flds, this.fields)
    _.each(_.keys(flds), function(prop) {
      d[prop] = flds[prop]();
      d[prop].name = prop;
    });
    if(this._extend_with_ && this._extend_with_.init_by){
      _.each(_.keys(this._extend_with_.init_by), function(ext_prop) {
        d[ext_prop].default_value = that._extend_with_.init_by[ext_prop];
      });
    }
    return d;
  }

  /*get json structure for new object*/
  new_object_json(){
    var model = {},that = this,
      fields = this.get_fields();
    _.each(_.keys(fields), function (prop) {
        model[prop] = null;
        if(fields[prop].default_value)
          model[prop] = fields[prop].default_value;
        if(fields[prop].isObjectListType){
          model[prop] = [];
        }
        else if(fields[prop].type=='one_to_one'){
          let ref_obj = new that.StackApp.ObjectRepo[fields[prop].ref_object]();
          model[prop] = ref_obj.new_object_json();
        }
    });
    if(this._extend_with_ && this._extend_with_.init_by){
      _.each(_.keys(this._extend_with_.init_by), function(ext_prop) {
        model[ext_prop] = that._extend_with_.init_by[ext_prop];
      });
    }
    return model;
  }

  /*build object data*/
  build_object_db_query(cb_query, op = {select: "*"}){
    var fields = this.get_fields();
    let select_link_flds = [], idx = 0;
    _.map(fields,(fl)=>{
      if(fl.type == 'link'){
        select_link_flds.push([fl.link_object,  "_" + idx, fl.name]);
        idx++;
      }
    });
    let s_flds = _.map(select_link_flds,(f)=>{ return `${f[1]}.${(new this.StackApp.ObjectRepo[f[0]]()).field_title} as ${f[2]}__name`; });
    let qry = this.StackApp._knex.from(this.db_model_name);
    if(_.isArray(op.select)){
      qry = qry.select(op.select);
    }
    else{
      qry = qry.select(`${this.db_model_name}.*`, ...s_flds);
    }
    _.each(select_link_flds, (f)=>{
      let ref_m_name = (new this.StackApp.ObjectRepo[f[0]]()).db_model_name;
      qry = qry.leftJoin(`${ref_m_name} as ${f[1]}`, `${this.db_model_name}.${f[2]}_id`, `${f[1]}.id`);
    });
    if(cb_query){
      qry = cb_query(qry);
    }
    return qry.map((row)=>{
      let r = Object.assign({}, row);
      _.each(select_link_flds, (l_f)=>{
        if(r.hasOwnProperty(l_f[2]+"_id")){
          r[l_f[2]] = {id: r[l_f[2]+"_id"], title: r[l_f[2]+"__name"]};
          delete r[l_f[2]+"__name"];
          delete r[l_f[2]+"_id"];
        }
      });
      return r;
    });
  }
}
ModelRepo.fieldChangeScripts = [];

module.exports = ModelRepo;

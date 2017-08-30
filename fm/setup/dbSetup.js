/*eslint no-console: */
const _ = require('lodash'),
  chalk = require('chalk'),
  Promise = require('bluebird'),
  readDir = require('../utils/readDirectory');

function Loader() {
  var arr_asso_defn = [];
  this.dbSetup = function (knex, callback) {
    loadModel(function(merr, models) {
      if(merr){
        callback(merr);
      }
      else{
        try{
          var schema = knex.schema;
          _.each(models, function (a_model) {
            var model_inst = new a_model.model();
            if (!model_inst._abstract_ && !model_inst._extend_with_) {
              schema = schema.raw("drop table if exists \""+a_model.name+"\" CASCADE");// postgres specific
              schema = createTable(models, schema, a_model.name, model_inst);
              console.log('Table Script Created :: '+a_model.name);
            }
          });
          _.each(arr_asso_defn, function (cb) {
            if(cb.type == 'link'){
              schema = schema.table(cb.table, function(table) {
                table.integer(cb.field+"_id").references(cb.ref_table + '.id');
              });
            }
            else{
              schema = schema.table(cb.ref_table, function(table) {
                table.integer(cb.table+"_id").references(cb.table + '.id');
              });
            }
            console.log('Reference Script Created :: '+cb.table + ' / '+ cb.ref_table);
          });
          schema.then(function(cc) {
            console.log(chalk.green('DB tables created.'));
            console.log(chalk.blue('DB data build started.'));
            //**building data*********************
            let fun_arr =[];
            _.each(models, function (a_model) {
              fun_arr.push(new a_model.model());
            });
            Promise.reduce(fun_arr, function(arres, fc) {
                return fc._build_data_(knex).then(function(d){
                  arres.push(d);
                  return arres;
                });
            }, []).then(function(arres){
              console.log(chalk.green('DB Setup Success.'));
              callback(null, knex);
            }).catch((exr)=>{
              console.error("DB Setup: Data build fail. " + chalk.red(exr.message));
              callback(exr);
            });
            //*********************************
          }).catch(function (e) {
            console.error("DB Setup: " + chalk.red(e.message));
            callback(e);
           });
        }catch(ex1){
          console.error("DB Setup: " + chalk.red(ex1.message));
          callback(ex1);
        }
      }
    });
  };

  function createTable(all_models, schema, name, model){
    var fields = buildModelField(model);
    var extending_this = _.filter(all_models, {_extend_with_ : name});
    _.each(_.keys(fields), function (field_key) {
      var field = fields[field_key];
      if (field.ref_object) {
        let model_info = _.find(all_models, {name : field.ref_object});
        arr_asso_defn.push({ type:field.type, table: model.name, ref_table: (model_info._extend_with_ || model_info.name), field: field_key });
      }
    });
    if(extending_this && extending_this.length > 0){
      _.each(extending_this, function(ext_model) {
        var model_inst = new ext_model.model();
        var fields_1 = buildModelField(model_inst);
        _.each(_.keys(fields_1), function (field_key) {
          var field = fields_1[field_key];
          if (field.ref_object) {
            let model_info = _.find(all_models, {name : field.ref_object});
            arr_asso_defn.push({ type:field.type, table: name, ref_table: (model_info._extend_with_ || model_info.name), field: field_key });
          }
        });
      });
    }
    return schema.createTable(model.name, function (table) {
        table.increments('id').primary();
        let fields_to_gen = [];
        _.each(_.keys(fields), function (field_key) {
          if(field_key == 'id' || field_key == 'created_at' || field_key == 'updated_at')return;
          var field = fields[field_key];
          if (!field.ref_object) {
            genKnexFieldCommand(field_key, field, table);
            fields_to_gen.push(field_key);
          }
        });

        if(extending_this && extending_this.length > 0){
          _.each(extending_this, function(ext_model) {
            var model_inst = new ext_model.model();
            var fields_1 = buildModelField(model_inst);
            _.each(_.keys(fields_1), function (field_key) {
              if(field_key == 'id' || field_key == 'created_at' || field_key == 'updated_at')return;
              var field = fields_1[field_key];
              if (!field.ref_object) {
                if(fields_to_gen.indexOf(field_key) < 0)
                  genKnexFieldCommand(field_key, field, table, true);
              }
            });
          });
        }
        table.timestamps();
    });
  }

  function genKnexFieldCommand(field_key, field, table, isExtendedTable){
    var fd;
    if (field.field_type == 'string'){
      fd = table.string(field_key);
    }
    else if (field.field_type == 'decimal'){
      fd = table.decimal(field_key);
    }
    else if (field.field_type == 'int'){
      fd = table.integer(field_key);
    }
    else if (field.field_type == 'boolean'){
      fd = table.boolean(field_key);
    }
    else if (field.field_type == 'date'){
      fd = table.date(field_key);
    }
    else if (field.field_type == 'datetime'){
      fd = table.dateTime(field_key);
    }
    else if (field.field_type == 'text'){
      fd = table.text(field_key);
    }
    //if(!field.nullable && !isExtendedTable)
      //fd.notNullable();
  }

  function buildModelField(model_inst) {
    var d ={};
    _.each(_.keys(model_inst.fields), function(prop) {
      d[prop] = model_inst.fields[prop]();
      d[prop].name = prop;
    });
    return d;
  }

  function loadModel(callback){
    readDir.readDirectory('./_apps').then(function(modules_dirs) {
      var models = [];
      try{
        _.each(_.keys(modules_dirs), function(m_dir_prop) {
          if(_.isObject(modules_dirs[m_dir_prop])){
            _.each(_.keys(modules_dirs[m_dir_prop].objects), function(m_object_prop){
              var m_models = require("../../" + modules_dirs[m_dir_prop].objects[m_object_prop]);
              _.each(_.keys(m_models), function (model_key) {
                  models.push({model:m_models[model_key]});
              });
            });
          }
        });

        _.each(models, function(mdl) {
          var model_inst = new mdl.model();
          mdl.name = model_inst.name;
          if(model_inst._extend_with_ && model_inst._extend_with_.name){
            mdl._extend_with_ = model_inst._extend_with_.name;
          }
        });
        callback(null, models);
      }catch(ex){
        callback(ex);
      }
    }).catch(function(err) {
      callback(err);
    });
  }

}
var dbL = new Loader();

module.exports = dbL.dbSetup;
/*

TODO****
validation for field name :: not allowed name : [id, name, title, created_at, updated_at, created_by, updated_by]

Create tables
SysModule => all modules information
  SysModuleRole => module related roles
SysObjectDefn => which contains all object information(id, refId(object name), name, baseModule)
*/

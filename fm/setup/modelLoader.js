/*eslint no-console: */
var _ = require('lodash'), chalk = require('chalk'),
  readDir = require('../utils/readDirectory');

var bookshelf,
  ObjectModels = {},
  dB = {},
  ObjectStructure = {};
var currContext ={at:''};
function Loader() {
  this.modelSetup = function(knex, callback){
    try{
      //var _dB = {}, _ObjectModels = {};
      bookshelf = require('bookshelf')(knex);
      dB._bookshelf = bookshelf;
      //fetching all objects from apps folder
      currContext.at = 'Reading directories';
      loadModel(function(merr, models) {
        if(merr){
          console.error('error at :: '+ currContext.at);
          callback(merr);
        }
        else{
          try{
            _.each(models, function (a_model) {
              a_model.model.prototype._app_module = a_model.app_module;
              currContext.at = 'Creating Model Instance:'+a_model.name;
              var model_inst = new a_model.model();
              ObjectStructure[a_model.app_module].objects.push({name: a_model.name, text: model_inst.text, is_primary: model_inst.is_primary, is_child_member: model_inst.is_child_member});
              if (model_inst.name != '') {
                  if (!model_inst._abstract_) {
                    ObjectModels[model_inst.name] = a_model.model;
                    console.log('Model Loaded :: '+chalk.green(a_model.name));
                  }
                  if (!model_inst._abstract_ && !model_inst._extend_with_) {
                    dB[model_inst.name] = bookshelf.Model.extend(getDefaultModelConfig(model_inst));
                    console.log('DB Model Loaded :: '+chalk.green(a_model.name));
                  }
              }
            });
            //Load referenced models
            _.each(models, function (a_model) {
              var model_inst = new a_model.model();
              if (model_inst.name != '') {
                  if (!model_inst._abstract_ && !model_inst._extend_with_) {
                    var cnf = extendModelConfig(models, model_inst, a_model.name);
                    if (model_inst._schema_building_)
                        model_inst._schema_building_(cnf);
                    if(cnf){
                      dB[model_inst.name] = dB[model_inst.name].extend(cnf);
                      console.log('Model Reference Extended :: '+ chalk.green(a_model.name));
                    }
                  }
              }
            });
            callback(null, { models : ObjectModels, dbModels: dB, objectStructure: ObjectStructure });
          }
          catch(ex1){
            console.error('error at :: '+ currContext.at);
            callback(ex1);
          }
        }
      });
    }catch(ex2){
      console.error('error at'+ currContext.at);
      callback(ex2);
    }
  };

  function extendModelConfig(all_models, model, model_key){
    var cnf={},
        fields = buildModelField(model);
    buildRefFields(fields, cnf);
    var extending_this = _.filter(all_models, {_extend_with_ : model.name});
    if(extending_this && extending_this.length > 0){
      _.each(extending_this, function(ext_model) {
        var model_inst = new ext_model.model();
        var fields_1 = buildModelField(model_inst);
        buildRefFields(fields_1, cnf);
      });
    }
    if(_.keys(cnf).length > 0)
      return cnf;
    else
      return null;
  }

  function buildRefFields(fields, conf){
    _.each(_.keys(fields), function (field_key) {
      var field = fields[field_key];
      if (field.type == 'one_to_many') {
        conf[field_key] = function() {
          return this.hasMany(dB[field.ref_object]);
        };
      }
      else if (field.type == 'one_to_one') {
        conf[field_key] = function() {
          return this.hasOne(dB[field.ref_object]);
        };
      }
      // else if (field.type == 'link') {
      //   conf[field_key] = function() {
      //     return this.belongsTo(dB[field.link_object], field_key + '_id');
      //   };
      // }
    });
  }

  function getDefaultModelConfig(model_inst){
    var tab_name = model_inst.name;
    // if(model_inst._extend_with_ && model_inst._extend_with_.name)
    //   tab_name = model_inst._extend_with_.name;
    var d = {
        tableName: tab_name,
        hasTimestamps: true,
        // Bookshelf `initialize` - declare a constructor-like method for model creation
        initialize: function initialize() {
          //this.on('creating', this.creating, this);
        },
        validate: function validate() {
          //Low level Validation Logic
          //use validator = require('validator'), module
          //return validation.validateSchema(this.tableName, this.toJSON());
        },
        creating: function creating(newObj, attr, options) {
          // if (!this.get('created_by')) {
          //     this.set('created_by', this.contextUser(options));
          // }
        }
    };
    // if(tab_name == 'Partner'){
    //   d.user__name = function(){
    //     return this.get('user');
    //   };
      
    // }
    return d;
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
          ObjectStructure[m_dir_prop] = {objects:[], tools:[], reports:[]};
          if(_.isObject(modules_dirs[m_dir_prop])){
            _.each(_.keys(modules_dirs[m_dir_prop].objects), function(m_object_prop){
              var m_models = require("../../" + modules_dirs[m_dir_prop].objects[m_object_prop]);
              _.each(_.keys(m_models), function (model_key) {
                  models.push({model:m_models[model_key], app_module: m_dir_prop});
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

module.exports = function(knex, callback){
  var i = new Loader();
  i.modelSetup(knex, callback);
  //return { models : ObjectModels, dbModels: dB }
};

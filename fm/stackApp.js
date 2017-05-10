const Promise = require('bluebird'),
      _ = require('lodash'),
      ModelLoader = require('./setup/modelLoader'),
      DbSetup = require('./setup/dbSetup'),
      Errors = require('./errors'),
      config = require('../config.json');

const knex = require('knex')({
          client: 'pg',
          connection: config.profiles[0].string
      });
var _default = {};
function StackApp(){
  this.Modules = {};
  this.ObjectRepo = {};
  this.ObjectModel = {};
  this.ObjectsStructure = {};
  this._knex = null;
  this.init = function(){
    var first_time = false;
    var that = this;
    return new Promise(function (resolve, reject) {
      if(first_time){
        DbSetup(knex, function(err, dt){
          debugger;
          if(err)
            reject(err)
          else {
            setModels.call(that, resolve,reject);
          }
        });
      }
      else {
        setModels.call(that, resolve,reject);
      }

    });
  }

  var setModels  = function(resolve, reject){
    var that = this;
    try{
      ModelLoader(knex, function(err, minfo){
        if(err){
          reject(err);
        }
        else {
          that._knex= knex;
          that.ObjectRepo = minfo.models;
          that.ObjectModel = minfo.dbModels;
          that.ObjectsStructure = minfo.objectStructure;
          that.Modules = new Modules();
          resolve('success');
        }
      });
    }
    catch(ex){
      reject(ex);
    }
  };

}

function Modules(){
  var _m = require('../_apps/modules');
  this.all = function(){
    var md =[];
    _.each(_.keys(_m), function(p){
      md.push({name:p, text: _m[p].text});
    });
    return md;
  }
}
exports.App = StackApp;

exports.setDefault = function(def) {
  _default = def;
}

exports.getDefault=function() {
  return _default;
}

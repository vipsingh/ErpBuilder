"use strict"
const _ = require('lodash'),
  StackApp = require('../stackApp');

exports.getModules = function () {
  let sApp = StackApp.getDefault();
  return sApp.Modules.all();
};

exports.getAllObjects = function (app_module) {
  let sApp = StackApp.getDefault();
  let app_module_struc = _.pick(sApp.ObjectsStructure, [app_module]);
  if(app_module_struc){
    app_module_struc[app_module].objects = _.filter(app_module_struc[app_module].objects,{is_primary: true});
    return app_module_struc[app_module];
  }
  return null;
};

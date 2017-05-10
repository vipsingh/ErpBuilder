var express = require('express'),
  router = express.Router(),
  Errors = require('../fm/errors'),
  appStructure = require('../fm/app/structure');

router.get('/getModules', function (req, res) {
  try{
    res.send(appStructure.getModules());
  }catch(ex){
    Errors.handleAPIError(ex, req, res);
  }
});

router.get('/getAllObjects/:app_module', function (req, res) {
  try{
    res.send(appStructure.getAllObjects(req.params.app_module));
  }catch(ex){
    Errors.handleAPIError(ex, req, res);
  }
});

router.get('/xyz', function (req, res) {
  try{
    debugger;

    res.send({});
  }catch(ex){
    Errors.handleAPIError(ex, req, res);
  }

});

module.exports = router;

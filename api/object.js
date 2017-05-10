var express = require('express'),
  router = express.Router(),
  _ = require('lodash'),
  StackApp = require('../fm/stackApp'),
  Errors = require('../fm/errors');

function getObjectRepo(name) {
  var stackApp = StackApp.getDefault();
  //we can set current context here
  return new stackApp.ObjectRepo[name]();
}
router.get('/:objectname/schema', function (req, res) {
  try{
    var repo = getObjectRepo(req.params.objectname);
    var sch = repo.get_schema();
    res.send(sch);
  }catch(ex){
    Errors.handleAPIError(ex, req, res);
  }
});

router.get('/:objectname/model', function (req, res) {
  try{
    var repo = getObjectRepo(req.params.objectname);
    repo.bind_model_json(req.query.id).then(function(data) {
      res.send(data);
    }).catch(function (err) {
      Errors.handleAPIError(err, req, res);
    });
  }catch(ex){
    Errors.handleAPIError(ex, req, res);
  }
});

router.post('/:objectname/list', function (req, res) {
  try{
    var repo = getObjectRepo(req.params.objectname);
    repo.get_list(req.body).then(function(lst) {
      res.send({data: lst, totalCount: lst.length});
    }).catch(function (err) {
      Errors.handleAPIError(err, req, res);
    });
  }catch(ex){
    Errors.handleAPIError(ex, req, res);
  }
});

router.post('/:objectname/save', function (req, res) {
  try{
    debugger;
    var repo = getObjectRepo(req.params.objectname);
    // var model = {name:'adawq 22', type:1,
    //     creditlimit:432.7,
    //     contacts:[{city: 'Moby Dick', state: null}],
    //     setting:{customerRef: 'ref2'}
    // };//req.body;
    var model = req.body;
    // var model = {id: 2, name:'p12',
    //     creditlimit:125.7,
    //     contacts:[{id: 3, city: 'Canterbury Tales x', state: 'state1'},{id: 4, city: 'Moby Dickt', state: null}, {id: 11, city: 'Moby Dick xx', state: null}, {id: null, city: 'xcv Dick xx', state: null}],
    //     setting:{id: 1, customerRef: 'ref1', supplierRef: 'ref2'}
    // }
    repo.save(model).then((id)=>{
      res.send({id:id});
    }).catch((err)=>{
      Errors.handleAPIError(err, req, res);
    });
  }catch(ex){
    Errors.handleAPIError(ex, req, res);
  }
});

router.get('/:objectname/simplelist', function (req, res) {
  //for dropdown or other simple list of object
  try{
    var repo = getObjectRepo(req.params.objectname);
    let fl = {}, complete = true;
    if(req.query.query && req.query.query != ''){
      if(req.query.query.startsWith('#')){
        fl = {id: Number(req.query.query.substring(1))};
        complete = false;
      }
    }
    repo.get_simple_list({where: fl}).then(function(lst) {
      res.send({data: lst, complete: complete});
    }).catch(function (err) {
      Errors.handleAPIError(err, req, res);
    });
  }catch(ex){
    Errors.handleAPIError(ex, req, res);
  }
});

router.get('/:objectname/single/:id', function (req, res) {
  try{
    var repo = getObjectRepo(req.params.objectname);
    repo.get_single(req.params.id, req.query).then(function(dt) {
      res.send(dt);
    }).catch(function (err) {
      Errors.handleAPIError(err, req, res);
    });
  }catch(ex){
    Errors.handleAPIError(ex, req, res);
  }
});

/**
Call custom function
*/
router.post('/:objectname/executeFunction/:id', function (req, res) {
    try {
      var repo = getObjectRepo(req.params.objectname);
        if (repo) {
            var result = repo.execute_custom_func(req.params.id, req.body);
            if (result == null)
                res.send(null);
            else if (result.then) {
                result.then(function (dt) {
                    res.send(dt);
                }).catch(function (errr) { Errors.handleAPIError(errr, req, res); });
            }
            else
                res.send(result);
        }
        else
            throw new Error("Error in loading repo.");
    }
    catch (ex) {
        Errors.handleAPIError(ex, req, res);
    }
});

router.get('/temp', function (req, res) {
    var stackApp = StackApp.getDefault();
    var repo = new stackApp.ObjectRepo.Partner();
    repo.get_simple_list().then(function(lst) {
      res.send(lst);
    }).catch(function (err) {
      Errors.handleAPIError(err, req, res);
    });
});

module.exports = router;

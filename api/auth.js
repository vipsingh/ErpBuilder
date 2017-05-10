const express = require('express'),
  router = express.Router(),
  _ = require('lodash'),
  StackApp = require('../fm/stackApp'),
  Errors = require('../fm/errors');

router.get('/login', function (req, res) {
  try{
    
    res.send({});
  }catch(ex){
    Errors.handleAPIError(ex, req, res);
  }
});

module.exports = router;

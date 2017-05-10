var express = require('express'),
  router = express.Router(),
  Errors = require('../fm/errors'),
  path = require('path');
const content_path = path.join(__topDirName, 'content');

router.get('/object/:name/:id', function (req, res) {
  try{
    let img_path = path.join(content_path, 'default', 'images', 'person_default_base.png');  
    if(req.params.id == 3){
        Errors.handleAPIError(new Error('No Image'), req, res);
    }
    else
        res.sendFile(img_path);
  }catch(ex){
    Errors.handleAPIError(ex, req, res);
  }
});

router.get('/object/fallback', function (req, res) {
  console.log('x');
  try{
    let img_path = path.join(content_path, 'default', 'images', 'no_image_base.png');  
    res.sendFile(img_path);
  }catch(ex){
    Errors.handleAPIError(ex, req, res);
  }
});

module.exports = router;
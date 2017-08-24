var express = require('express');
var router = express.Router();
var test = require('../fm/testt');
/* GET home page. */
router.get('/', function (req, res) {
    //res.render('shell', { title: 'Express' });
    res.send({});
});

router.get('/test', function (req, res) {
    test.test().then((rds)=>{
        res.send(rds);
    }).catch((err)=>{
        res.send(err);
    });

    
});


module.exports = router;


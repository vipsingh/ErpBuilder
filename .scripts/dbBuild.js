const config = require('../config.json');
const knex = require('knex')({
    client: 'pg',
    connection: config.profiles[0].string
});
require('app-module-path').addPath(__dirname.replace('\.scripts', ''));
const DbSetup = require('../fm/setup/dbSetup');
const BuildData = require('./buildData');

DbSetup(knex, function(err, dt){
  if(err){
    console.log(err);
    process.exit(0);
  }
  else {
    BuildData(knex).then((d)=>{
      console.log('DB SETUP DONE!!');
    }).catch((err)=>{
      console.log(err);
    }).finally(()=>process.exit(0));
    //process.exit(0);
  }
});

//Build DataBase
//Create default tables. ex. sys_client_info(db_uqid, client_info, licence_info)
//Give a unique id to db.
//Create content folder structure for db.
//Build client specific files if required.
  //ex. create react component according to defined layout of object.
//insert into  public."Partner" values(1,1,1,'Local XV', true,1,200,null,null, null,null, 1)

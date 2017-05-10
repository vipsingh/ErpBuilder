const _ = require('lodash'),
    Promise = require('bluebird'),
    EntityRepo = require('../../../fm/repos').EntityRepo,
    Field = require('../../../fm/schema/modelField');

class UserModel extends EntityRepo{
  constructor(){
    super("User",{
              type: Field.SelectField('Type', [{id:1, value: 'Internal'}, {id:2, value: 'External'}], { required: true})
          },
          {}
        );
    this.text = "User";
  }

  _build_data_(knex){
    var that = this;
    return new Promise((resolve, reject)=>{
      knex(that.db_model_name).insert({name:'Admin', type: 1, active: true}).then((m)=>{
        resolve(true);
      }).catch((err)=>{reject(err);});
    });
  }
}

module.exports = {
  UserModel: UserModel
};

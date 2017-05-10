const _ = require('lodash'),
    EntityRepo = require('../../../fm/repos').EntityRepo,
    Field = require('../../../fm/schema/modelField');

class Customer extends EntityRepo{
  constructor(){
    super("Customer",{
            customerRef : Field.StringField('CustomerRef')
          },
          {
            _extend_with_ : {name:'Partner', init_by:{type:1}}
          }
        );
    this.text = "Customer";
    this.custom_functions = {
      send_mail: function(id) {
        return 'xyz' + id;
      }
    };
  }
}

//CustomerType

module.exports = {
  Customer
};

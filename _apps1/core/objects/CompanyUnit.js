const _ = require('lodash'),    
    EntityRepo = require('fm/repos').EntityRepo,
    Field = require('fm/schema/modelField');

class CompanyUnit extends EntityRepo{
  constructor(){
    super("CompanyUnit",{
              name: Field.StringField('Name', { required: true }),
              addressLine1: Field.StringField('Address Line1', { required: true }),
              addressLine2: Field.StringField('Address Line2'),
              city: Field.StringField('City', { required: true }),
              state: Field.StringField('State', { required: true }),
              country: Field.StringField('Country', { required: true }),
              pin: Field.StringField('Pin', { required: true }),
              establishDate: Field.DateField('Establish Date')
          },
          {}
        );
    this.text = "CompanyUnit";
  }
}

module.exports = {
  CompanyUnit
};

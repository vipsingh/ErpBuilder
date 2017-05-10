const _ = require('lodash'),
    EntityRepo = require('../../../fm/repos').EntityRepo,
    ModelRepo = require('../../../fm/repos').ModelRepo,
    Field = require('../../../fm/schema/modelField');

class PartnerModel extends EntityRepo{
  constructor(){
    super("Partner",
          {
              partnerType : Field.SelectField('Partner Type', [{value:1, text: 'Customer'}, {value:2, text: 'Supplier'}, {value:2, text: 'Employee'}], { required: true,read_only:true }),
              type : Field.SelectField('Type', [{value:1, text: 'Individual'}, {value:2, text: 'Company'}]),
              company : Field.StringField('Company', { required: false }),
              website : Field.StringField('Website', { required: false }),
              email : Field.StringField('Email', { required: false }),
              addressLine1: Field.StringField('City', { required: true }),
              city : Field.StringField('City', { required: true }),
              state : Field.StringField('State', { required: false }),
              contacts: Field.OneToManyField('Contacts', 'PartnerContact'),
              user: Field.LinkField('User', 'User'),
              currency: Field.LinkField('Currency', 'Currency'),
              note : Field.StringField('Note', { required: false })
          },
          {}
        );
    this.text = "Partner";
  }
  _schema_building_(modelConfig){
    super._schema_building_(modelConfig);
  }
}

class PartnerContactModel extends ModelRepo{
  constructor(){
    super("PartnerContact",{
              name : Field.StringField('Name', { required: true }),
              position : Field.StringField('Job Position', { required: false }),
              email : Field.StringField('Email', { required: false }),
              mobile : Field.StringField('Mobile', { required: false }),
              note : Field.StringField('Note', { required: false })
          },
          {}
    );
    this.text = "Contact";
  }
}

module.exports = {
  PartnerModel: PartnerModel,
  PartnerContactModel: PartnerContactModel
};

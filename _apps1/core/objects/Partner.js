const _ = require('lodash'),
    EntityRepo = require('../../../fm/repos').EntityRepo,
    ModelRepo = require('../../../fm/repos').ModelRepo,
    Field = require('../../../fm/schema/modelField');

class PartnerModel extends EntityRepo{
  constructor(){
    super("Partner",
          {
              type : Field.SelectField('Type', [{value:1, text: 'Customer'}, {value:2, text: 'Supplier'}, {value:2, text: 'Employee'}], { required: true,read_only:true }),
              creditlimit: Field.DecimalField( 'Credit Limit', { required: false }),
              contacts: Field.OneToManyField('Contacts', 'PartnerContact'),
              setting: Field.OneToOneField('Setting', 'PartnerSetting'),
              user: Field.LinkField('User', 'User'),
              remarks: Field.StringField('Remarks', {computed:"'hello ' + $root.name"}),
              //username: Field.StringField('User Name', {dep:{on:"user", expr: "name"}})

              // remarks1: Field.StringField('Remarks1'),
              // remarks2: Field.StringField('Remarks1'),
              // remarks3: Field.StringField('Remarks1'),
              // remarks4: Field.StringField('Remarks1'),
              // remarks5: Field.StringField('Remarks1'),
              // remarks6: Field.StringField('Remarks1'),
              // remarks7: Field.StringField('Remarks1'),
              // remarks8: Field.StringField('Remarks1'),
              // remarks9: Field.StringField('Remarks1'),
              // remarks10: Field.StringField('Remarks1'),
              // remarks11: Field.StringField('Remarks1'),
              // remarks12: Field.StringField('Remarks1'),
              // remarks13: Field.StringField('Remarks1'),
              // remarks14: Field.StringField('Remarks1'),
              // remarks15: Field.StringField('Remarks1'),
              // remarks16: Field.StringField('Remarks1'),
              // remarks17: Field.StringField('Remarks1'),
              // remarks18: Field.StringField('Remarks1'),
              // remarks19: Field.StringField('Remarks1'),
              // remarks20: Field.StringField('Remarks1'),
              // remarks21: Field.StringField('Remarks1'),
              // remarks22: Field.StringField('Remarks1'),
              // remarks23: Field.StringField('Remarks1'),
              // remarks24: Field.StringField('Remarks1'),
              // remarks25: Field.StringField('Remarks1'),
              // remarks26: Field.StringField('Remarks1'),
              // remarks27: Field.StringField('Remarks1'),
              // remarks28: Field.StringField('Remarks1'),
              // remarks29: Field.StringField('Remarks1'),
              // remarks30: Field.StringField('Remarks1'),
              // user1: Field.LinkField('User1', 'User'),
              // user2: Field.LinkField('User2', 'User'),
              // user3: Field.LinkField('User3', 'User')
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
              city : Field.StringField('City', { required: true }),
              state : Field.StringField('State', { required: false })
          },
          {}
    );
    this.text = "Contact";
  }
}

class PartnerSettingModel extends ModelRepo{
  constructor(){
    super("PartnerSetting",{
              customerRef : Field.StringField('Customer Ref', { required: true }),
              supplierRef : Field.StringField('Supplier Ref', { required: false })
          },
          {}
        );
    this.text = "Setting";
  }
}

module.exports = {
  PartnerModel: PartnerModel,
  PartnerContactModel: PartnerContactModel,
  PartnerSettingModel: PartnerSettingModel
};
// var Section = function(name, fls, op) {
//
// }
// var page={
//   customerRef : Field.StringField('Customer Ref', { required: true }),
//   supplierRef : Field.StringField('Supplier Ref', { required: false }),
//   section1: Section('Section 1', {
//     city : Field.StringField('City', { required: true }),
//     state : Field.StringField('State', { required: false })
//   }),
// }

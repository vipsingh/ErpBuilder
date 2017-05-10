const _ = require('lodash'),
    EntityRepo = require('../../../fm/repos').EntityRepo,
    ModelRepo = require('../../../fm/repos').ModelRepo,
    Field = require('../../../fm/schema/modelField');

class Product extends EntityRepo{
  constructor(){
    super("Product",
          {
              type : Field.SelectField('Type', [{value:1, text: 'Item'}, {value:2, text: 'Service'}], { required: true}),
              category: Field.StringField('Category'),
              refNo: Field.StringField('Ref No'),
              description: Field.StringField('Description'),
              brand: Field.StringField('Brand'),
              rate: Field.DecimalField( 'Rate', { required: true }),
              uom: Field.StringField('UOM', { required: true }),
              isSalesProduct: Field.BooleanField("IsSalesProduct", {default_value: true})
          },
          {}
        );
    this.text = "Product";
  }

}

module.exports = {
  Product
};

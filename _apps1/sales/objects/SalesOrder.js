const _ = require('lodash'),
    DocumentRepo = require('../../../fm/repos').DocumentRepo,
    ModelRepo = require('../../../fm/repos').ModelRepo,
    Field = require('../../../fm/schema/modelField');

class SalesOrder extends  DocumentRepo{
  constructor(){
    super("SalesOrder",{
              customer: Field.LinkField("Customer", "Customer",{required: true}),
              customerRef: Field.StringField('Customer Ref', { required: true }),
              items: Field.OneToManyField('Items', 'SalesOrderItem', {required: true}),
              note: Field.TextField('Note', { })
          },
          {}
    );
    this.text = "Sales Order";
    this.autoNumberConfig.prefix = 'SO';
  }
}

class SalesOrderItem extends  ModelRepo{
  constructor(){
    super("SalesOrderItem",{
              item: Field.LinkField("Product", "Product",{required: true}),
              uom: Field.StringField('Uom', {read_only: true, dep:{on:"item", expr: "uom"}}),
              qty: Field.DecimalField('Qty', {required: true}),
              price: Field.DecimalField('Price', {required: true}),
              amount: Field.DecimalField('Amount', {computed:"$this.qty * $this.price"})
          },
          {}
    );
    this.text = "SalesOrderItem";
  }
}

module.exports = {
  SalesOrder,
  SalesOrderItem
};

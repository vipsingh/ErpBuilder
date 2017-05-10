const _ = require('lodash'),
    EntityRepo = require('../../../fm/repos').EntityRepo,
    Field = require('../../../fm/schema/modelField');

class Currency extends EntityRepo{
  constructor(){
    super("Currency",{
              shortName: Field.StringField('ShortName', { required: true }),
              symbol: Field.StringField('Symbol', { required: true }),
              fracName: Field.StringField('FracName', { required: true }),
              decimalPos: Field.IntegerField('DecimalPos', { required: true, default_value: 2 })
          },
          {}
        );
    this.text = "Currency";
  }

}

//CurrencyRate

module.exports = {
  Currency
};

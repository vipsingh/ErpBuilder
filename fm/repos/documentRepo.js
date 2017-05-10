const _ = require('lodash'),
    BaseRepo = require('./BaseRepo');
const Promise = require('bluebird'),
  EventEmitter = require('events'),
  Field = require('../schema/modelField'),
  Errors = require('../errors');

class DocumentRepo extends BaseRepo{
  constructor(name, fields, op = {allowFromRefDoc: true, autoSubmit: false}){
    var other_flds ={
            name:Field.StringField('Name', {read_only: true, unique: true }),
            nature: Field.IntegerField('Doc Nature'),
            //companyUnit: Field.LinkField('Company Unit', 'CompanyUnit', {required:true}),
            docDate: Field.DateField('DocDate',{ required: true }),
            status: Field.IntegerField('Status', { required: true, default_value: 1 }),
            docStatus: Field.IntegerField('DocStatus', { hidden:true, auto: true, default_value: 1 }),
            currencyId: Field.LinkField('Currency', 'Currency', { required: true, default_value: 1 }),
            currencyRate: Field.DecimalField('CurrencyRate', { required: true, default_value: 1.0, decimal_place: 6 })
          };

    if(op.allowFromRefDoc){
      other_flds.refDocName = Field.StringField('RefDocName', {hidden:true });
      other_flds.refDocNo = Field.IntegerField('RefDocNo', {hidden:true });
    }
    fields = Object.assign(other_flds, fields);
    super(name,fields, op);

    this.field_title = op.field_title || 'name';//can use expression
    this.field_subtitle1 = op.field_subtitle1 ||null;
    this.search_fields = [this.field_title];//data will be searched on the bases of these fields.
    if(this.field_subtitle1){
      this.search_fields.push(this.field_subtitle1);
    }
    this.sort_field = {name: this.field_title, is_desc: false};

    this.autoSubmit = op.autoSubmit;
    this.autoNumberConfig = {
      prefix: '',//string or field value or expr or function(model)
      length: 0
    };

    this.field_status = 'status';
    this.STATUS_OPTION = {
      NEW: 1,
      INPROCESS: 2,
      SUBMITTED: 3,
      REJECTED: 9,
      CLOSED: 10
    };

  }

  submit(){

  }

  approve(){

  }

  reject(){

  }

  onFinalApprove(){

  }

  save(model){
    var that = this;
    return new Promise((resolve, reject)=>{
      if(!model.name){
        that.generateName().then((sr)=>{
          model.name = sr;
          super.save(model).then(d => resolve(d)).catch(err => reject(err));
        }).catch(err => reject(err));
      }
      else{
        super.save(model).then(d => resolve(d)).catch(err => reject(err));
      }
    });
  }

  generateName(){
    var that = this;
    return new Promise((resolve, reject)=>{
      let p_fix = that.autoNumberConfig.prefix;
      that.StackApp._knex(that.db_model_name).max('name').where('name','like',p_fix+'%').then((d)=>{
        if(d[0].max){
          let r = d[0].max.replace(p_fix,'');
          let n = Number(r)+1;
          resolve(p_fix + n);
        }
        else{
          resolve(p_fix + '1');
        }
      }).catch((err)=>{console.log(err); reject({message:'Error in generating SlNo.'});});
    });

  }
}

DocumentRepo.docSettingSchema ={
  fields:{

  }
  //define definable setting for document.
  //this will create a document specific setting table in database. {object_name}_Setting
  //it can be nature wise
};

module.exports = DocumentRepo;

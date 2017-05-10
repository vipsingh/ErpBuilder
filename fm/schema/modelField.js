"use strict"

class Field{
  constructor(text, op = {}){
    op = op || {};
    this.type = '';
    this.field_type = 'string';
    this.name = '';
    this.text = text;
    this._value = null;
    this.default_value = undefined;
    this.isObjectListType = false;
    this.read_only = false;
    this.hidden = false;
    this.required = false;
    this.unique = false;
    this.db_store = true;
    this.nullable = true;
    this.validations = {};
    this.computed = null;
    this.dep = {};
    this.uiOp = null;

    this.default_value =  op.default_value || this.default_value;
    this.read_only = (op.read_only === undefined) ? this.read_only :op.read_only;
    this.hidden = (op.hidden === undefined) ? this.hidden :op.hidden;
    this.required = (op.required === undefined) ? this.required :op.required;
    this.unique = (op.unique === undefined) ? this.unique :op.unique;
    this.db_store = (op.db_store === undefined) ? this.db_store :op.db_store;
    this.validations = (op.validations === undefined)? {} :op.validations;
    this.computed = (op.computed === undefined)? null :op.computed;
    this.dep = (op.dep === undefined)? {} :op.dep;
    this.ui_op = (op.ui_op === undefined)? null :op.ui_op;//{renderType:''}

    if(this.required){      
      this.nullable = false;
    }
    this.nullable = (op.nullable === undefined) ? this.nullable :op.nullable;

    if(this.computed && !op.db_store)
      this.db_store = false;

    this.$this = null;
    this.$root = null;
  }
  _init_(){

  }
  toJson(){
    var jsn ={type: this.type, field_type:this.field_type, name: this.name, text: this.text, read_only: this.read_only, hidden: this.hidden, required: this.required, unique: this.unique};
    if(this.computed)
      jsn.computed = this.computed;
    if(this.dep && this.dep.on)
      jsn.dep = this.dep;
    if(this.uiOp)
      jsn.uiOp = this.uiOp;
    jsn.validations=this.validations;
    jsn.default_value = this.default_value;
    return jsn;
  }
  get value() {
      return this._value;
  }
  set value(value) {
      this._value = value;
  }

}

class KeyField extends Field{
  constructor(text, op){
    super(text, op);
    this.nullable = false;
    this.field_type = 'int';
    this.read_only = true;
    this.type = 'key';
    this._init_();
  }
}

class StringField extends Field{
  constructor(text, op){
    super(text, op);
    this.type = 'string';
    this._init_();
  }
}

class DecimalField extends Field{
  constructor(text, op){
    super(text, op);
    this.field_type = 'decimal';
    this.type = 'decimal';
    this.decimal_place = (op && op.decimal_place)?op.decimal_place:3;
    this._init_();
  }
  get value() {
      return this._value;//format value to decimal place
  }
  set value(value) {
      this._value = value;
  }
  toJson(){
    var jsn = super.toJson();
    jsn.decimal_place = this.decimal_place;
    return jsn;
  }
}

class MonetaryField extends Field{
  constructor(text, op){
    super(text, op);
    this.field_type = 'decimal';
    this.type = 'monetary';
    this.decimal_place = (op && op.decimal_place)?op.decimal_place:3;//base currency decimal
    this.currency_id = (op && op.currency_id)?op.currency_id:1;//base currency
    this._init_();
  }
  get value() {
      return this._value;//format value to decimal place
  }
  set value(value) {
      this._value = value;
  }
  toJson(){
    var jsn = super.toJson();
    jsn.decimal_place = this.decimal_place;
    jsn.currency_id = this.currency_id;
    return jsn;
  }
}

class BooleanField extends Field{
  constructor(text, op){
    super(text, op);
    this.type = this.field_type = 'boolean';
    this._init_();
  }
}

class TextField extends Field{
  constructor(text, op){
    super(text, op);
    this.type = this.field_type = 'text';
    this._init_();
  }
}

class DateTimeField extends Field{
  constructor(text, op){
    super(text, op);
    this.type = this.field_type = 'datetime';
    this._init_();
  }
}

class DateField extends Field{
  constructor(text, op){
    super(text, op);
    this.type = this.field_type = 'date';
    this._init_();
  }
}

class IntegerField extends Field{
  constructor(text, op){
    super(text, op);
    this.type = this.field_type = 'int';
    this._init_();
  }
}

class LinkField extends Field{
  constructor(text, link_object, op = {}){
    super(text, op);
    this.field_type = 'int';
    this.type = 'link';
    this.link_object = this.ref_object = link_object;
    this.data_filter = op.data_filter;
    this._init_();
  }
  toJson(){
    var jsn = super.toJson();
    jsn.link_object = this.link_object;
    if(this.data_filter)
      jsn.data_filter = this.data_filter;
    return jsn;
  }
}

class SelectField extends Field{
  constructor(text, list_values, op){
    super(text, op);
    this.field_type = 'int';
    this.type = 'select';
    this.list_values = list_values;
    this._init_();
  }
  toJson(){
    var jsn = super.toJson();
    jsn.list_values = this.list_values;
    return jsn;
  }
}

class OneToManyField extends Field{
  constructor(text, ref_object, op){
    super(text, op);
    this.field_type = 'listobject';
    this.type = 'one_to_many';
    this.ref_object = ref_object;
    this.isObjectListType = true;
    this.allowAdd = true;//expr
    this._init_();
  }
  toJson(){
    var jsn = super.toJson();
    jsn.ref_object = this.ref_object;
    jsn.isObjectListType= this.isObjectListType;
    jsn.allowAdd = this.allowAdd;
    return jsn;
  }
}

class OneToOneField extends Field{
  constructor(text, ref_object, op){
    super(text, op);
    this.field_type = 'object';
    this.type = 'one_to_one';
    this.ref_object = ref_object;
    this._init_();
  }
  toJson(){
    var jsn = super.toJson();
    jsn.ref_object = this.ref_object;
    return jsn;
  }
}

module.exports = {
    KeyField : function(text, op){return function(){return new KeyField(text, op);};},
    StringField: function(text, op){return function(){return new StringField(text, op);};},
    DecimalField: function(text, op){return function(){return new DecimalField(text, op);};},
    MonetaryField: function(text, op){return function(){return new MonetaryField(text, op);};},
    BooleanField: function(text, op){return function(){return new BooleanField(text, op);};},
    TextField: function(text, op){return function(){return new TextField(text, op);};},
    DateTimeField: function(text, op){return function(){return new DateTimeField(text, op);};},
    DateField: function(text, op){return function(){return new DateField(text, op);};},
    IntegerField: function(text, op){return function(){return new IntegerField(text, op);};},
    LinkField: function(text, link_object, op){return function(){return new LinkField(text, link_object, op);};},
    SelectField: function(text,list_values, op){return function(){return new SelectField(text,list_values, op);};},
    OneToManyField: function(text,ref_object, op){return function(){return new OneToManyField(text,ref_object, op);};},
    OneToOneField: function(text,ref_object, op){return function(){return new OneToOneField(text,ref_object, op);};}
};

//"disabled":"$this && $this.ref2 == 'x'"
//"disabled":"$root.creditlimit2 == true"

//remarks: Field.StringField('Remarks', {computed:"'hello ' + $root.name"}),
//username: Field.StringField('User Name', {dep:{on:"user", expr: "name"}})

/*
AutoNumberField => *Only one field allow per object(prefix(ex:SO), suffix(ex:LM), startingNumber(ex:1)) => result:: SO1LM
MultiSelectField
PercentField

*/

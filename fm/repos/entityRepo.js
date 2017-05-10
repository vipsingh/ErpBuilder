"use strict"
const _ = require('lodash'),
    Field = require('../schema/modelField'),
    BaseRepo = require('./BaseRepo');

class EntityRepo extends BaseRepo{
  constructor(name, fields, op={}){
    fields = Object.assign({
      name:Field.StringField('Name', { required: true }),
      active: Field.BooleanField('Active',{default_value: true})}, fields);
    super(name,fields, op);
    this.field_title = op.field_title || 'name';//can use expression
    this.field_subtitle1 = op.field_subtitle1 ||null;
    this.search_fields = [this.field_title];//data will be searched on the bases of these fields.
    if(this.field_subtitle1){
      this.search_fields.push(this.field_subtitle1);
    }
    this.sort_field = {name: this.field_title, is_desc: false};
  }
}

module.exports = EntityRepo;

//Entity which have tree structure (id, parent_id, name...)

const _ = require('lodash'),
    Field = require('../schema/modelField'),
    EntityRepo = require('./entityRepo');

class TreeEntityRepo extends EntityRepo{
  constructor(name, fields, op){
    fields = Object.assign({parent_id: Field.LinkField('Parent', name,{default_value: 0})}, fields);
    super(name,fields, op);
  }

  //check tree related validation before save.
  //any node can not contains both leaf and group nodes.
  //create simple list only for leaf node.
}

module.exports = TreeEntityRepo;

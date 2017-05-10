const _ = require("lodash");

module.exports = {
    buildFilterKnexQuery : function(filterObj, searchObj, ObjectRepo){
      if(!filterObj || filterObj == {}){
        if(!searchObj || !searchObj.search)
          return function(){};
      }
      if(searchObj && searchObj.search){
        if(!filterObj || filterObj == {}){
          filterObj = {};
        }
        filterObj[searchObj.fields[0]] = {$cn: searchObj.search};
      }

      var qbuilder = function(qb) {
        let sql_str = sqlWhereEval(filterObj, ObjectRepo.db_model_name);
        qb.whereRaw(sql_str);
      }
      return qbuilder;
    },

    applyFilter: function (data, filters) {
        //apply filters on data and process;
    }
};

var sqlWhereEval = function(filterObj, tableName = null) {
  //build for postgres
  return buildGroup(filterObj);

  function buildGroup(lst, op = '$and') {
    let q_str = [];
    if(_.isArray(lst)){
      let d_g = []
      _.each(lst, (l)=>{
        d_g.push(buildGroup(l, op));
      });
      q_str.push("(" + d_g.join(' ' + getGroupOp(op) + ' ') + ")");
    }
    else{
      _.each(_.keys(lst), (k)=>{
        if(k === '$or' || k === '$and'){
          q_str.push(buildGroup(lst[k], k));
        }
        else{
          q_str.push(buildField({[k]: lst[k]}));
        }
      });
    }
    return q_str.join(' ' + getGroupOp(op) + ' ');
  }

  function  getGroupOp(op) {
    return (op === '$or')?"OR":"AND";
  }

  function buildField(ob) {
    var xr = '';
    _.mapValues(ob, function(value, key) {
      let str = '';
      if(typeof value !== 'object'){
        str = ((tableName)?('"' + tableName + '".'): '') + '"' + key + '" = ' + valueStr(value);
      }
      else{
        let d_a = [];
        _.mapValues(value, function(value1, key1) {
          let op_e = getOpOp(key1, value1);
          d_a.push(((tableName)?('"' + tableName + '".'): '') + '"' + key + '" ' + op_e.op + ' ' + valueStr(op_e.val));
        });
        if(d_a.length == 1)
          str = d_a[0];
        else
          str = '(' + d_a.join(' AND ') +')';

      }
      xr = str;
      return value;
    });
    return xr;
  }

  function valueStr(val){
    return (typeof val === 'number')? val: (_.isArray(val)?"("+ JSON.parse(JSON.stringify(val, replacer))+")": "'"+val+"'" );
  }

  function replacer(key, value) {
    if (typeof value === "string") {
      return "'" + value + "'";
    }
    return value;
  }

  function getOpOp(e_op, value) {
    let op = '=', val = value;
    let likeKW='ilike'; //for postgre case insenstive search
    if(e_op == '$ne')
      op = '!=';
    else if(e_op == '$gt')
      op = '>';
    else if(e_op == '$gte')
      op = '>=';
    else if(e_op == '$lt')
      op = '<';
    else if(e_op == '$lte')
      op = '<=';
    else if(e_op == '$like')
      op = likeKW;
    else if(e_op == '$cn'){
      op = likeKW; val = '%'+value+'%';
    }
    else if(e_op == '$sw'){
      op = likeKW; val = ''+value+'%';
    }
    else if(e_op == '$ew'){
      op = likeKW; val = '%'+value+'';
    }
    else if(e_op == '$in'){
      op = 'IN';
    }
    else if(e_op == '$nin'){
      op = 'NOTIN';
    }
    //between
    return {op, val};
  }
}

var buildFilterKnexQuery = function(filterObj, searchObj) {
  if(!filterObj){
    if(!searchObj || !searchObj.search)
      return {};
  }
  if(searchObj && searchObj.search){
    if(!filterObj.rules){
      filterObj = {groupOp: 'and', rules: [{field:searchObj.fields[0], op:'$cn', value: searchObj.search}]};
    }
    else {
      filterObj.rules.push({field:searchObj.fields[0], op:'$cn', value: searchObj.search});
    }
  }

  var qbuilder = function(qb){
    let _ix = 0;
    _.map(filterObj.rules, function(f) {
      qb = getOp(qb, f, (_ix == 0), filterObj.groupOp);
      _ix++;
      return qb;
    });
  }

  var getOp = function(qb, f, isFirst, groupOp) {
    groupOp = groupOp.toLowerCase();
    let op, val = f.value, opProp = '';
    if(f.op == '$eq')
      op = '=';
    else if(f.op == '$ne')
      op = '!=';
    else if(f.op == '$gt')
      op = '>';
    else if(f.op == '$gte')
      op = '>=';
    else if(f.op == '$lt')
      op = '<';
    else if(f.op == '$lte')
      op = '<=';
    else if(f.op == '$cn'){
      op = 'like'; val = '%'+f.value+'%';
    }
    else if(f.op == '$sw'){
      op = 'like'; val = ''+f.value+'%';
    }
    else if(f.op == '$ew'){
      op = 'like'; val = '%'+f.value+'';
    }
    else if(f.op == '$in'){
      op = null; opProp = 'In';
    }
    else if(f.op == '$nin'){
      op = null; opProp = 'NotIn';
    }
    let where = 'where'+opProp;
    if(!isFirst)
      where = groupOp + 'Where' + opProp;

    if(op)
      return qb[where](f.field, op, val);
    else
      return qb[where](f.field, val);
  };
  return qbuilder;
  /*
  function (qb) {
   qb.innerJoin('manufacturers', 'cars.manufacturer_id', 'manufacturers.id');
   qb.groupBy('cars.id');
   qb.where('manufacturers.country', '=', 'Sweden').orWhere('other_id', '>', 10);
  }
  .query({where: {other_id: '5'}, orWhere: {key: 'value'}})
  */
}

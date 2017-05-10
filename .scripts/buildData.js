const Promise = require('bluebird');

function BuildData(knex){
  var f_arr= [
    knex('Currency').insert({name:'Rupee', shortName: 'Rs', symbol: 'Rs.', fracName: 'Paise', decimalPos: 2, active: true}),
    knex('Partner').insert({name:'Local XYZ', type: 1, creditlimit: 2000, user_id: 1, active: true}),
    knex('Product').insert({name:'Item 1', type: 1, category: 'Fashion', refNo: 'F00001', rate: 200.00, uom: 'each', isSalesProduct: true, active: true}),
    knex('Product').insert({name:'Item 2', type: 1, category: 'Food', refNo: 'F00002', rate: 300.00, uom: 'packet', isSalesProduct: false, active: true}),
    knex('Product').insert({name:'Samsung Galaxy S2', type: 1, category: 'Mobile', refNo: 'M00001', rate: 22200.00, uom: 'each', isSalesProduct: true, active: true}),
    knex('Product').insert({name:'MI 3', type: 1, category: 'Mobile', refNo: 'M00002', rate: 12000.00, uom: 'each', isSalesProduct: true, active: true}),
    knex('Product').insert({name:'Huwaii gh6', type: 1, category: 'Mobile', refNo: 'M00003', rate: 11000.00, uom: 'each', isSalesProduct: true, active: true}),
    knex('Product').insert({name:'Samsung ON8', type: 1, category: 'Mobile', refNo: 'M00004', rate: 16300.00, uom: 'each', isSalesProduct: true, active: true}),
    knex('Product').insert({name:'DIY 50 ml', type: 1, category: 'Shampoo', refNo: 'S00001', rate: 200.00, uom: 'packet', isSalesProduct: true, active: true}),
    knex('Product').insert({name:'Jabs 100 ml', type: 1, category: 'Shampoo', refNo: 'S00002', rate: 560.00, uom: 'packet', isSalesProduct: true, active: true})
  ];
  console.log('**Demo Data Buiding**');
  return Promise.reduce(f_arr, function(arres, fc) {
    if(fc.then){
      return fc.then((d)=>{
        arres.push(true);
        return arres;
      });
    }
    else{
      arres.push(false);
      return arres;
    }
  },[]);
}

module.exports = BuildData;

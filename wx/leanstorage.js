'use strict'

var Promise = require('bluebird')
var _ = require('lodash')
var request = Promise.promisify(require('request'))

var APP_ID = 'vp4B8WU9ooBcLNESYX4lOtsC-gzGzoHsz'
var APP_KEY = 'ITuSNmhK10CzvMPRmUTcrR0Q'
var AV = require('leancloud-storage')

function LeanStorage() {}

LeanStorage.prototype.addItem = function(name, price) {

  var Item = AV.Object.extend('jp_items')
  var item = new Item()
  item.save({
    name: name,
    price: price
  }).then(function(object) {
    console.log('Item Created!')
  }, function(err){
    console.log('Add item failed')
  })
}

LeanStorage.prototype.todaysum = function() {
  var todayStart = new Date().setHours(0,0,0,0)
  var todayEnd = new Date().setHours(23,59,59,59)

  var startDateQuery = new AV.Query('jp_items');
  startDateQuery.greaterThanOrEqualTo('createdAt', new Date(todayStart));

  var endDateQuery = new AV.Query('jp_items');
  endDateQuery.lessThan('createdAt', new Date(todayEnd));

  var query = AV.Query.and(startDateQuery, endDateQuery);

  return new Promise((resolve, reject) => {
    query.find().then(function (results) {
      var sum = 0
      results.map((item, index)=> {
        sum += item.attributes.price
        console.log(item.attributes)
      })
      resolve(sum)
    }, function (error) {
      console.log('search db failed')
    })
  })
}

LeanStorage.prototype.fetchItems = function() {
  var query = new AV.Query('jp_items');
  var items = []
  var sum = 0
  return query.find().then(function (results) {
    results.map((item, index)=> {
      sum += item.attributes.price
      item.attributes.date = new Date(item.createdAt).setHours(0,0,0,0)
      items.push(item.attributes)
    })
  }, function (error) {
    console.log('search db failed')
  }).then((data)=>{
    var result = {
      sum: sum,
      items: items
    }
    return Promise.resolve(result)
  })
}

module.exports = LeanStorage
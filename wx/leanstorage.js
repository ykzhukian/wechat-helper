'use strict'

var Promise = require('bluebird')
var _ = require('lodash')
var request = Promise.promisify(require('request'))

var APP_ID = 'vp4B8WU9ooBcLNESYX4lOtsC-gzGzoHsz';
var APP_KEY = 'ITuSNmhK10CzvMPRmUTcrR0Q';
var AV = require('leancloud-storage');

function LeanStorage() {
  this.addItem('test item', 120)
}


LeanStorage.prototype.addItem = function(name, price) {

  var Item = AV.Object.extend('jp_items');
  var item = new Item();
  item.save({
    name: name,
    price: price
  }).then(function(object) {
    console.log('Item Created!');
  })

}

module.exports = LeanStorage
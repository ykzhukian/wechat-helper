'use strict'

var wechat = require('../wechat/g')
var config = require('../config')
var util = require('../libs/util')
var Wechat = require('../wechat/wechat')
var LeanStorage = require('../wx/leanstorage')
var fs = require('fs')
var path = require('path')
var wechat_verify_file = path.join(__dirname, 'MP_verify_HRCCb9RDiuBLZZON.txt')

var ejs = require('ejs')
var crypto = require('crypto')
var tpl = require('./review_tpl')

var createNonceStr = function() {
  return Math.random().toString(36).substr(2, 15)
}

var createTimestamp = function() {
  return parseInt(new Date().getTime() / 1000, 10) + ''
}

var _sign = function(nonceStr, ticket, timestamp, url) {
  var params = [
    'noncestr=' + nonceStr,
    'jsapi_ticket=' + ticket,
    'timestamp=' + timestamp,
    'url=' + url
  ]
  var str = params.sort().join('&')
  var shasum = crypto.createHash('sha1')

  shasum.update(str)
  return shasum.digest('hex')
}

function sign(ticket, url) {
  var nonceStr = createNonceStr()
  var timestamp = createTimestamp()
  var signature = _sign(nonceStr, ticket, timestamp, url)
  return {
    config: {
      nonceStr: nonceStr,
      timestamp: timestamp,
      signature: signature
    }
  }
}

function fetchItems() {
  var leanstorage = new LeanStorage()
  return new Promise((resolve, reject) => {
    leanstorage.fetchItems()
    .then((data) => {
      resolve(data)
    })
  })
}

module.exports = function() {

  return function *(next) {
    if (this.url.indexOf('/review') > -1) {
      var wechatApi = new Wechat(config.wechat)
      var leanstorage = new LeanStorage()
      var data = yield wechatApi.fetchAccessToken()
      var access_token = data.access_token
      var ticketData = yield wechatApi.fetchTicket(access_token)
      var ticket = ticketData.ticket
      var url = this.href.replace(':3000', '')
      var params = sign(ticket, url)
      var today = new Date().getDate()
      params.items = yield leanstorage.fetchItems()
      params.days_left = 23 - today < 0 ? 13 : 23 - today
      
      this.body = ejs.render(tpl.tpl, params)
      return next

    } else if (this.url.indexOf('/delete') > -1) {
      var leanstorage = new LeanStorage()
      var urlParams = util.getUrlParams(this.url)
      var objId = urlParams.obj
      yield leanstorage.deleteItem(objId)
      this.body = "<h1 style='text-align: center; margin-top: 50px;'>DONE</h1><h1 style='text-align: center; margin-top: 50px;'><a href='http://maimax.leanapp.cn/review'>BACK</a></h1>"
      return next
    } else if (this.url.indexOf('MP_verify_HRCCb9RDiuBLZZON') > -1) {
      console.log(wechat_verify_file)
      this.body = yield util.readFileAsync(wechat_verify_file)
      return next
    }
    yield next
  }
}
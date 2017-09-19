'use strict'

var Promise = require('bluebird')
var Ai = require('./ai')
var LeanStorage = require('./leanstorage')
var util = require('../libs/util')

function ReplyHandler(message) {

  var content = message.Content.replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?|\。|\，|\？|\！]/g,"");
  this.message = content
  this.msgType = message.MsgType
  this.time = message.CreateTime
  this.fromUserName = message.FromUserName
}

ReplyHandler.prototype.reply = function() {

  var category = this.checkMsgCategory()
  var whatname = false
  if (this.message.indexOf('你叫什么') > -1 || 
      this.message.indexOf('你是谁') > -1 ||
      this.message.indexOf('你的名字') > -1 ||
      this.message.indexOf('你是哪位') > -1 ||
      this.message.indexOf('你哪位') > -1 ||
      this.message.indexOf('你名字') > -1 ||
      this.message.indexOf('你到底是谁') > -1 ||
      this.message.indexOf('怎么称呼') > -1
    ) {whatname = true}

  return new Promise((resolve, reject) => {

    var data = '不太明白你的意思'

    if (this.message) {
      if (whatname) {
        data = '我叫MAIMAX 🤖'
        return resolve(data)
      }
      if (category === 'translate') {
        data = this.translateReply()
      } else if (category === 'currency') {
        data = this.currencyReply()
      } else if (category === 'account') {
        data = this.accountReply()
      } else if (category === 'review') {
        data = this.todaysumReply()
      } else {
        data = this.aiReply()
      }
    }
    resolve(data)
  })
}

ReplyHandler.prototype.checkMsgCategory = function() {

  var translateIndex = this.message.indexOf('翻译')
  var currencyIndex = this.message.indexOf('汇率')
  var accountIndex = this.message.indexOf('记账')
  var reviewIndex = this.message.indexOf('查账')

  if (translateIndex > -1 && translateIndex < 5) {
    return 'translate'
  } else if (currencyIndex > -1 && currencyIndex < 5) {
    return 'currency'
  } else if (accountIndex > -1 && accountIndex < 5) {
    return 'account'
  } else if (reviewIndex > -1 && reviewIndex < 5) {
    return 'review'
  } else {
    return ''
  }
}

ReplyHandler.prototype.translateReply = function() {
  var result = this.message.replace('翻译', '')
  console.log(result)

  return new Promise((resolve, reject) => {
    this.translate(result).then((data)=> {
      var src = decodeURI(data[0].src)
      var dst = decodeURI(data[0].dst)
      var reply = src + ': \n' + dst
      resolve(reply)
    })
  })
}

ReplyHandler.prototype.currencyReply = function() {
  return new Promise((resolve, reject) => {
    this.currency().then((data) => {
      data = [{
      title: '日元-人民币 JPY-CNY ' + data[1].exchange,
      description: '数据更新于：' + data[1].updateTime,
      url: 'http://q.m.hexun.com/forex/price/2.html'
      },{
        title: '人民币-日元 CNY-JPY ' + data[0].exchange,
        description: '数据更新于：' + data[0].updateTime,
        url: 'http://q.m.hexun.com/forex/price/2.html'
      }]
      resolve(data)
    })
  })
}

ReplyHandler.prototype.accountReply = function() {
  return new Promise((resolve, reject) => {
    this.prepareAccount()
    .then((data) => {
      if (data !== '没听清内容') {
        data = this.account(data.name, data.price)
      }
      resolve(data)
    })
  })
}

ReplyHandler.prototype.todaysumReply = function() {
  return new Promise((resolve, reject) => {
    this.todaysum()
    .then((data) => {
      data = [{
        title: '今天共花了：' + data + 'JPY 💰',
        description: '点击获取更多信息',
        url: 'http://832570aa.ngrok.io/review'
      }]
      resolve(data)
    })
  })
}

ReplyHandler.prototype.currency = function() {
  return new Promise((resolve, reject) => {
    var data = util.currencyJp()
    resolve(data)
  })
}

ReplyHandler.prototype.translate = function(text) {
  return new Promise((resolve, reject) => {
    var data = util.translateJp(text)
    resolve(data)
  })
}

ReplyHandler.prototype.todaysum = function() {
  return new Promise((resolve, reject) => {
    var re = new LeanStorage()
    var sum = re.todaysum()
    resolve(sum)
  })
}

ReplyHandler.prototype.prepareAccount = function() {
  return new Promise((resolve, reject) => {
    var string = this.message.replace('记账', '')
    var nameIndex = string.indexOf('内容')
    if (nameIndex < 0) {
      var data = '没听清内容'
      return resolve(data)
    }
    var name = string.slice(nameIndex + 2)
    var price = 0
    if (this.msgType === 'voice') {
      price = util.chineseToNum(string)
    } else {
      price = string.replace(/[^0-9]/g, '')
    }
    var data = {
      price: parseInt(price),
      name: name
    }
    console.log(data)
    resolve(data)
  })
}

ReplyHandler.prototype.account = function(name, price) {
  return new Promise((resolve, reject) => {
    var leanstorage = new LeanStorage()
    leanstorage.addItem(name, price)
    var data = '记好了：' + name + ' ' + price + 'JPY ' + '👌'
    resolve(data)
  })
}

ReplyHandler.prototype.aiReply = function() {
  var ai = new Ai()
  return new Promise((resolve, reject) => {
    var data = ai.aiReply(this.message, this.fromUserName)
    resolve(data)
  })
}

module.exports = ReplyHandler
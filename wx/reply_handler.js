'use strict'

var Promise = require('bluebird')
var Ai = require('./ai')
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

  return new Promise((resolve, reject) => {

    var data = '不太明白你的意思'

    if (this.message) {
      if (category === 'translate') {
        data = this.translateReply()
        resolve(data)
      } else if (category === 'currency') {
        this.currencyReply().then((data) => {
          console.log(data)
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
      } else {
        data = this.aiReply()
        resolve(data)
      }
    }
  })
}

ReplyHandler.prototype.checkMsgCategory = function() {

  var translateIndex = this.message.indexOf('翻译')
  var currencyIndex = this.message.indexOf('汇率')

  if (translateIndex > -1 && translateIndex < 5) {
    return 'translate'
  } else if (currencyIndex > -1 && currencyIndex < 5) {
    return 'currency'
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

ReplyHandler.prototype.aiReply = function() {
  var ai = new Ai()
  return new Promise((resolve, reject) => {
    var data = ai.aiReply(this.message, this.fromUserName)
    resolve(data)
  })
}

module.exports = ReplyHandler
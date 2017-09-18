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

  // 翻译：XXXX
  var category = this.checkMsgCategory()

  return new Promise((resolve, reject) => {

    var data = '不太明白你的意思'

    if (this.message) {
      if (this.message === '你是谁') {
        
      }
      if (category === 'translate') {
        data = this.translateReply()
      } else {
        data = this.aiReply()
      }
    }

    resolve(data)
  })
}

ReplyHandler.prototype.checkMsgCategory = function() {

  var translateIndex = this.message.indexOf('翻译')

  if (translateIndex > -1 && translateIndex < 5) {
    return 'translate'
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
'use strict'

var config = require('../config')
var Wechat = require('../wechat/wechat')
var menu = require('./menu')
var ReplyHandler = require('./reply_handler')

var wechatApi = new Wechat(config.wechat)

exports.reply = function *(next) {
  var message = this.weixin

  if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      if (message.EventKey) {
        console.log('QR CODE: ' + message.EventKey + ' ' + message.Ticket)
      }
      this.body = '欢迎订阅'
    } else if (message.Event === 'unsubscribe') {
      this.body = ''
      console.log('取关了')
    } else if (message.Event === 'LOCATION') {
      this.body = '上报的位置: ' + message.Latitude + ' | ' + message.Longtitude + '-' + message.Precision
    } else if (message.Event === 'CLICK') {
      this.body = '点击菜单: ' + message.EventKey
    } else if (message.Event === 'SCAN') {
      this.body = '你扫了些什么 ' + message.EventKey + ' ' + message.Ticket
    } else if (message.Event === 'VIEW') {
      this.body = '你点了链接 ' + message.EventKey
    } else if (message.Event === 'scancode_push') {
      console.log(message.ScanCodeInfo.ScanType)
      console.log(message.ScanCodeInfo.ScanResult)
      this.body = 'scan push ' + message.EventKey
    } else if (message.Event === 'scancode_waitmsg') {
      console.log(message.ScanCodeInfo.ScanType)
      console.log(message.ScanCodeInfo.ScanResult)
      this.body = 'scancode wait msg ' + message.EventKey
    } else if (message.Event === 'pic_sysphoto') {
      console.log(message.SendPicsInfo.PicList)
      console.log(message.SendPicsInfo.Count)
      this.body = 'pic_sysphoto ' + message.EventKey
    } else if (message.Event === 'pic_photo_or_album') {
      console.log(message.SendPicsInfo.PicList)
      console.log(message.SendPicsInfo.Count)
      this.body = 'pic_photo_or_album ' + message.EventKey
    } else if (message.Event === 'pic_weixin') {
      console.log(message.SendPicsInfo.PicList)
      console.log(message.SendPicsInfo.Count)
      this.body = 'pic_weixin ' + message.EventKey
    } else if (message.Event === 'location_select') {
      console.log(message.SendLocationInfo.Location_Y)
      console.log(message.SendLocationInfo.Location_X)
      console.log(message.SendLocationInfo.Scale)
      console.log(message.SendLocationInfo.Label)
      console.log(message.SendLocationInfo.Poiname)
      this.body = 'pic_weixin ' + message.EventKey
    } 
  } else if (message.MsgType === 'text') {

    var handler = new ReplyHandler(message)
    
    var data = yield handler.reply()
    var reply = data
    this.body = reply

  } else if (message.MsgType === 'voice') {

    message.Content = message.Recognition

    var handler = new ReplyHandler(message)

    var data = yield handler.reply()
    var reply = data
    this.body = reply

  } else {
    this.body = '你发了什么东西，我暂时看不懂'
  }

  yield next
}
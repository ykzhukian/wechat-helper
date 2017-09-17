'use strict'

var Koa = require('koa')
var wechat = require('./wechat/g')
var config = require('./config')
var util = require('./libs/util')
var weixin = require('./wx/reply')
var Wechat = require('./wechat/wechat')

var app = new Koa()

var ejs = require('ejs')
var crypto = require('crypto')

var heredoc = require('heredoc')

var tpl = heredoc(function() {/*
  <!DOCTYPE html>
  <html>
    <head>
      <title>搜电影</title>
      <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1" />
    </head>
    <body>
      <h1>点击标题，开始录制翻译</h1>
      <p id="title"></p>
      <div id="poster"></div>
      <div id="year"></div>
      <div id="director"></div>
      <script src="https://cdn.bootcss.com/zepto/1.2.0/zepto.js"></script>
      <script src="http://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
      <script>
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: 'wxda1ef7ca71651c91', // 必填，公众号的唯一标识
          timestamp: '<%= timestamp %>', // 必填，生成签名的时间戳
          nonceStr: '<%= nonceStr %>', // 必填，生成签名的随机串
          signature: '<%= signature %>',// 必填，签名，见附录1
          jsApiList: [
            'startRecord',
            'stopRecord',
            'onVoiceRecordEnd',
            'translateVoice'
          ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
        wx.ready(function(){
          wx.checkJsApi({
            jsApiList: ['onVoiceRecordEnd'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
            success: function(res) {
              console.log(res)
              // 以键值对的形式返回，可用的api值true，不可用为false
              // 如：{"checkResult":{"onVoiceRecordEnd":true},"errMsg":"checkJsApi:ok"}
            }
          });
          
          var isRecording = false
          $('h1').on('click', function() {
            console.log('clicked')
            if (!isRecording) {
              isRecording = true
              wx.startRecord({
                cancel: function() {
                  window.alert('那就不能搜了哦')
                }
              })
              return
            }

            isRecording = false
            wx.stopRecord({
              success: function(res) {
                var localId = res.localId

                wx.translateVoice({
                  localId: localId,
                  isShowProgressTips: 1,
                  success: function(res) {
                    window.alert(res.translateResult)
                  }
                })
              }
            })
            
          })

        });
      </script>
    </body>
  </html>
*/})

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
    nonceStr: nonceStr,
    timestamp: timestamp,
    signature: signature
  }
}

app.use(function *(next) {
  if (this.url.indexOf('/movie') > -1) {
    var wechatApi = new Wechat(config.wechat)
    var data = yield wechatApi.fetchAccessToken()
    var access_token = data.access_token
    var ticketData = yield wechatApi.fetchTicket(access_token)
    var ticket = ticketData.ticket
    var url = this.href.replace(':8000', '')
    var params = sign(ticket, url)
    
    console.log(params)
    this.body = ejs.render(tpl, params)

    return next
  }
  yield next
})

app.use(wechat(config.wechat, weixin.reply))

app.listen(8080)
console.log('Listening 8080')
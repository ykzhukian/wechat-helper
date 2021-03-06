'use strict'

var sha1 = require('sha1')
var getRawBody = require('raw-body')
var Wechat = require('./wechat')
var util = require('../libs/util')

module.exports = function(opts, handler) {
  var wechat = new Wechat(opts)

  return function *(next) {
    console.log(this.query)

    var token = opts.token
    var signature = this.query.signature
    var nonce = this.query.nonce
    var timestamp = this.query.timestamp
    var echostr = this.query.echostr

    var str = [token, timestamp, nonce].sort().join('')
    var sha = sha1(str)

    // 检验收到的请求
    if (this.method === 'GET') {
      // 检验请求来自微信
      if (sha === signature) {
        this.body = echostr + ''
      } else {
        this.body = 'wrong'
      }
    } else if (this.method === 'POST') {
      // 检验请求来自微信
      if (sha !== signature) {
        this.body = 'wrong'

        return false
      }

      var data = yield getRawBody(this.req, {
        length: this.length,
        limit: '1mb',
        encoding: this.charset
      })

      var content = yield util.parseXMLAsync(data)

      var message = util.formatMessage(content.xml)

      console.log(message)

      this.weixin = message

      yield handler.call(this, next)

      wechat.reply.call(this)
      
    }

  }
}


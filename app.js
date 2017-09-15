'use strict'

var Koa = require('koa')
var wechat = require('./wechat/g')
var config = require('./config')
var util = require('./libs/util')
var weixin = require('./weixin')

var app = new Koa()

app.use(wechat(config.wechat, weixin.reply))

app.listen(8080)
console.log('Listening 8080')
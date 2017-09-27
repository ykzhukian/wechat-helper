'use strict'

const AV = require('leanengine')
const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const statics = require('koa-static')
const bodyParser = require('koa-bodyparser')
const co = require('koa-convert')

var wechat = require('./wechat/g')
var review = require('./web/review')
var config = require('./config')
var weixin = require('./wx/reply')

var app = new Koa()

// 加载云函数定义，你可以将云函数拆分到多个文件方便管理，但需要在主文件中加载它们
require('./cloud')

const router = new Router()
app.use(router.routes())

// 加载云引擎中间件
app.use(co(AV.koa()))

app.use(bodyParser())

app.use(co(review()))
app.use(co(wechat(config.wechat, weixin.reply)))

module.exports = app

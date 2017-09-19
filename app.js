'use strict';

const path = require('path');

const AV = require('leanengine');
const Koa = require('koa');
const Router = require('koa-router');
const views = require('koa-views');
const statics = require('koa-static');
const bodyParser = require('koa-bodyparser');
const co = require('koa-convert');

var wechat = require('./wechat/g')
var config = require('./config')
var util = require('./libs/util')
var weixin = require('./wx/reply')
var Wechat = require('./wechat/wechat')

var app = new Koa()

var ejs = require('ejs')
var crypto = require('crypto')

var heredoc = require('heredoc')

// 加载云函数定义，你可以将云函数拆分到多个文件方便管理，但需要在主文件中加载它们
require('./cloud');

// // 设置模版引擎
// app.use(views(path.join(__dirname, 'views')));

// // 设置静态资源目录
// app.use(statics(path.join(__dirname, 'public')));

// const router = new Router();
// app.use(router.routes());

// 加载云引擎中间件
app.use(co(AV.koa()));

app.use(bodyParser());

// router.get('/', async function(ctx) {
//   ctx.state.currentTime = new Date();
//   await ctx.render('./index.ejs');
// });

// 可以将一类的路由单独保存在一个文件中
// app.use(require('./routes/todos').routes());

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

app.use(co(wechat(config.wechat, weixin.reply)))

module.exports = app;

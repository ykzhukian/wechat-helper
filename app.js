'use strict'

var Koa = require('koa')
var path = require('path')
var util = require('./libs/util')
var wechat = require('./wechat/g')
var wechat_file = path.join(__dirname, './config/wechat.txt')
var config = {
  wechat: {
    appID: 'wxa3bacb7b835329fd',
    appSecret: 'e4ea9ed4c39c953eb7d62626055ac91a',
    token: 'thecoolbangbaowechathelper',
    getAccessToken: () => {
      return util.readFileAsync(wechat_file)
    },
    saveAccessToken: (data) => {
      data = JSON.stringify(data)
      return util.writeFileAsync(wechat_file, data)
    }
  }
}

var app = new Koa()

app.use(wechat(config.wechat))

app.use(function *() {
  var echo = this.query.echo
  var snippet1 = '<!DOCTYPE html><html><head><title>回声机</title></head><body><span style="color:#ff6600; border:1px solid #ddd;">'
  var snippet2 = '</span></body></html>'
  var snippet3 = ' 回声次数：' + this.count

  if (!echo) {
    this.body = snippet1 + '哔哔哔！我听不到你！' + snippet3 + snippet2
  }
  else {
    echo = xss(echo)

    // 对输入的内容做一些必要的安全过滤
    this.body = snippet1 + echo + snippet3 + snippet2
  }
})

app.listen(1234)
console.log('Listening 1234')
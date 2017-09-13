'use strict'

var path = require('path')
var util = require('./libs/util')
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

module.exports = config
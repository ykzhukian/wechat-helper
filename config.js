'use strict'

var path = require('path')
var util = require('./libs/util')
var wechat_file = path.join(__dirname, './config/wechat.txt')
var wechat_ticket_file = path.join(__dirname, './config/wechat_ticket.txt')

var config = {
  wechat: {
    appID: 'wxda1ef7ca71651c91',
    appSecret: 'efb5f8cd70ef44c25dfa3dd8ee672c88',
    token: 'thecoolbangbaowechathelper',
    getAccessToken: () => {
      return util.readFileAsync(wechat_file)
    },
    saveAccessToken: (data) => {
      data = JSON.stringify(data)
      return util.writeFileAsync(wechat_file, data)
    },
    getTicket: () => {
      return util.readFileAsync(wechat_ticket_file)
    },
    saveTicket: (data) => {
      data = JSON.stringify(data)
      return util.writeFileAsync(wechat_ticket_file, data)
    }
  }
}

module.exports = config
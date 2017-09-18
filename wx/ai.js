'use strict'

var Promise = require('bluebird')
var _ = require('lodash')
var request = Promise.promisify(require('request'))

const APP_KEY = '08b270499f1fbea8370d95a9ae359e49';
const prefix = 'http://op.juhe.cn/robot/index?';

function Ai() {}

Ai.prototype.aiReply = function(message, userid) {

  var url = prefix + 'info=' + message + '&key=' + APP_KEY + '&userid=' + userid
  url = encodeURI(url)

  return new Promise(function(resolve, reject) {
    request({url: url, json: true}).then(function(response) {
      var data = response.body.result.text
      resolve(data)
    })
  })

}

module.exports = Ai
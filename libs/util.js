'use strict'

var fs = require('fs')
var Promise = require('bluebird')
var xml2js = require('xml2js')
var tpl = require('../wechat/tpl')
var crypto = require('crypto')
var request = Promise.promisify(require('request'))

exports.readFileAsync = function(fpath, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(fpath, encoding, (err, content) => {
      if (err) reject(err)
      else resolve(content)
    })
  })
}

exports.writeFileAsync = function(fpath, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(fpath, content, function(err) {
      if (err) {
        reject(err) 
        console.log('write err: ', err)
      } else { 
        resolve() 
      }
    })
  })
}

// Handle XML
exports.parseXMLAsync = function(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, {trim: true}, (err, content) => {
      if (err) reject(err)
      else resolve(content)
    })
  })
}

function formatMessage(result) {
  var message = {}
  if (typeof result === 'object') {
    var keys = Object.keys(result)

    for (var i = keys.length - 1; i >= 0; i--) {
      var item = result[keys[i]]
      var key = keys[i]

      if (!(item instanceof Array) || item.length === 0) {
        continue
      }
      if (item.length === 1) {
        var val = item[0]

        if (typeof val === 'object') {
          message[key] = formatMessage(val)
        } else {
          message[key] = (val || '').trim()
        }
      } else {
        message[key] = []

        for (var j = item.length - 1; j >= 0; j--) {
          message[key].push(formatMessage(item[j]))
        }
      }
    }
  }
  return message
}

exports.formatMessage = formatMessage

exports.translateJp = function(text) {
  var appid = '20170917000083414'
  var secret = 'dJumhiugA_w0luh9zPPS'
  var salt = Math.ceil(Math.random()*(10000000000-1000000000)+1000000000)
  var str = appid + text + salt + secret
  console.log(str)
  var md5sum = crypto.createHash('md5')
  md5sum.update(str)
  var sign = md5sum.digest('hex')
  console.log(sign)

  var url = 'http://fanyi-api.baidu.com/api/trans/vip/translate?from=zh&to=jp&q=' + text + '&appid=20170917000083414&salt=' + salt + '&sign=' + sign

  url = encodeURI(url)

  return new Promise(function(resolve, reject) {
    request({url: url}).then(function(response) {
      var data = JSON.parse(response.body)
      console.log(data.trans_result)
      if (data.trans_result) resolve(data.trans_result)
      else throw new Error('translate failed')
    })
  })
}

exports.tpl = function(content, message) {
  var info = {}
  var type = 'text'
  var fromUserName = message.ToUserName
  var toUserName = message.FromUserName

  if (Array.isArray(content)) {
    type = 'news'
  }

  type = content.type || type
  info.content = content
  info.createTime = new Date().getTime()
  info.msgType = type
  info.toUserName = toUserName
  info.fromUserName = fromUserName

  console.log(type, info)

  return tpl.compiled(info)
}
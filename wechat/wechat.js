'use strict'

var Promise = require('bluebird')
var _ = require('lodash')
var request = Promise.promisify(require('request'))
var util = require('../libs/util')
var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var fs = require('fs')
var api = {
  accessToken: prefix + 'token?grant_type=client_credential',
  temporary: {
    upload: 'http://file.api.weixin.qq.com/cgi-bin/media/upload?'
  },
  permanent: {
    uploadNews: prefix + 'material/add_news?',
    uploadNewsPic: prefix + 'media/uploadimg?',
    upload: prefix + 'material/add_material?'
  }
}

function Wechat(opts) {
  console.log(opts)
  this.appID = opts.appID
  this.appSecret = opts.appSecret
  this.getAccessToken = opts.getAccessToken
  this.saveAccessToken = opts.saveAccessToken

  this.fetchAccessToken()
  
}

Wechat.prototype.fetchAccessToken = function(data) {

  if (this.access_token && this.expires_in) {
    if (this.isValidAccessToken(this)) {
      return Promise.resolve(this)
    }
  }

  this.getAccessToken()
    .then((data) => {
      try {
        data = JSON.parse(data)
      }
      catch(e) {
        console.log('token check: no data')
        return this.updateAccessToken()
      }

      if (this.isValidAccessToken(data)) {
        console.log('token check: valid token')
        return Promise.resolve(data)
      } else {
        console.log('token check: expired')
        return this.updateAccessToken()
      }
    })
    .then((data) => {
      this.access_token = data.access_token
      this.expires_in = data.expires_in
      this.saveAccessToken(data)
      return Promise.resolve(data)
    })
}


Wechat.prototype.isValidAccessToken = function(data) {
  if (!data || !data.access_token || !data.expires_in) {
    return false
  }
  var access_token = data.access_token
  var expires_in = data.expires_in
  var now = (new Date().getTime())

  return now < expires_in
}

Wechat.prototype.updateAccessToken = function() {
  var appID = this.appID
  var appSecret = this.appSecret
  var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret
  return new Promise((resolve, reject) => {
    request({url: url, json: true}).then((response) => {
      var data = response.body
      var now = (new Date().getTime())
      var expires_in = now + (data.expires_in - 20) * 1000
      data.expires_in = expires_in
      resolve(data)
    })
  })
}

Wechat.prototype.uploadMedia = function(type, material, permanent) {
  var form = {}
  var uploadUrl = api.temporary.upload

  if (permanent) {
    uploadUrl = api.permanent.upload

    _.extend(form, permanent)
  }

  if (type === 'pic') {
    uploadUrl = api.permanent.uploadNewsPic
  }

  if (type === 'news') {
    uploadUrl = api.permanent.uploadNews
    form = material
  } else {
    form.media = fs.createReadStream(material)
  }

  return new Promise((resolve, reject) => {
    this
    .fetchAccessToken()
    .then((data) => {
      var url = uploadUrl + 'access_token=' + data.access_token

      if (!permanent) {
        url += '&type=' + type
      } else {
        form.access_token = data.access_token
      }

      var options = {
        method: 'POST',
        url: url,
        json: true
      }

      if (type === 'news') {
        options.body = form
      } else {
        options.formData = form
      }

      request(options).then((response) => {
        var _data = response.body
        if (_data) resolve(_data)
        else throw new Error('Upload media fails')
      })
    })
    .catch(function(err){reject(err)})
  })
}

Wechat.prototype.reply = function() {
  var content = this.body
  var message = this.weixin
  var xml = util.tpl(content, message)

  this.status = 200
  this.type = 'application/xml'
  this.body = xml
}

module.exports = Wechat
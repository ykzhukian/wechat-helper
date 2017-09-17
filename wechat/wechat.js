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
    upload: prefix + 'media/upload?'
  },
  permanent: {
    uploadNews: prefix + 'material/add_news?',
    fetch: prefix + 'material/get_material?',
    uploadNewsPic: prefix + 'media/uploadimg?',
    upload: prefix + 'material/add_material?',
    delete: prefix + 'material/del_material?',
    count: prefix + 'material/get_materialcount?',
    batch: prefix + 'material/batchget_material?'
  },
  menu: {
    create: prefix + 'menu/create?',
    get: prefix + 'menu/get?',
    delete: prefix + 'menu/delete?',
    current: prefix + 'get_current_selfmenu_info?'
  },
  ticket: {
    get: prefix + 'ticket/getticket?'
  }
}

function Wechat(opts) {
  console.log(opts)
  this.appID = opts.appID
  this.appSecret = opts.appSecret
  this.getAccessToken = opts.getAccessToken
  this.saveAccessToken = opts.saveAccessToken
  this.getTicket = opts.getTicket
  this.saveTicket = opts.saveTicket
  this.fetchAccessToken()
}

Wechat.prototype.fetchAccessToken = function(data) {

  if (this.access_token && this.expires_in) {
    if (this.isValidAccessToken(this)) {
      return Promise.resolve(this)
    }
  }

  return this.getAccessToken()
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
      this.saveAccessToken(data)
      return Promise.resolve(data)
    })
}

Wechat.prototype.fetchTicket = function(access_token) {

  return this.getTicket()
    .then((data) => {
      try {
        data = JSON.parse(data)
      }
      catch(e) {
        return this.updateTicket(access_token)
      }

      if (this.isValidTicket(data)) {
        return Promise.resolve(data)
      }
      else {
        return this.updateTicket(access_token)
      }
    })
    .then((data) => {
      this.saveTicket(data)

      return Promise.resolve(data)
    })
}

Wechat.prototype.isValidTicket = function(data) {

  if (!data || !data.ticket || !data.expires_in) {
    return false
  }

  var ticket = data.ticket
  var expires_in = data.expires_in
  var now = (new Date().getTime())

  if (ticket && now < expires_in) {
    return true
  }
  else {
    return false
  }
}

Wechat.prototype.updateTicket = function(access_token) {
  var url = api.ticket.get + '&access_token=' + access_token + '&type=jsapi'

  return new Promise(function(resolve, reject) {
    request({url: url, json: true}).then(function(response) {
      var data = response.body
      var now = (new Date().getTime())
      var expires_in = now + (data.expires_in - 20) * 1000

      data.expires_in = expires_in

      resolve(data)
    })
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

Wechat.prototype.fetchMedia = function(mediaId, type, permanent) {

  var fetchUrl = api.temporary.fetch

  if (permanent) {
    fetchUrl = api.permanent.fetch
  }

  return new Promise((resolve, reject) => {
    this
    .fetchAccessToken()
    .then((data) => {
      var url = fetchUrl + 'access_token=' + data.access_token

      var form = {}
      var options = {method: 'POST', url: url, json: true}

      if (permanent) {
        form.media_id = mediaId
        form.access_token = data.access_token
        options.body = form
      } else {
        if (type === 'video') {
          url = url.replace('https://', 'http://')
        }
        url += '&media_id=' + mediaId
      }
      
      if (type === 'news' || type === 'video') {
        request(options).then((response) => {
          var _data = response.body
          if (_data) resolve(_data)
          else throw new Error('Fetch media fails')
        })
        .catch(function(err){reject(err)})
      } else {
        resolve(url)
      }
    })
  })
}

Wechat.prototype.deleteMedia = function(mediaId) {

  var form = {
    media_id: mediaId
  }

  return new Promise((resolve, reject) => {
    this
    .fetchAccessToken()
    .then((data) => {
      var url = api.permanent.deleteMedia + 'access_token=' + data.access_token + '&media_id=' + mediaId
      request({method: 'POST', url: url, body: form, json: true}).then((response) => {
        var _data = response.body
        if (_data) resolve(_data)
        else throw new Error('Delete media fails')
      })
    })
  })
}

Wechat.prototype.countMedia = function() {

  return new Promise((resolve, reject) => {
    this
    .fetchAccessToken()
    .then((data) => {
      var url = api.permanent.count + 'access_token=' + data.access_token
      request({method: 'GET', url: url, json: true}).then((response) => {
        var _data = response.body
        if (_data) resolve(_data)
        else throw new Error('Count media fails')
      })
    })
  })
}

Wechat.prototype.batchMedia = function(options) {

  options.type = options.type || 'image'
  options.offset = options.offset || 0
  options.count = options.count || 1

  return new Promise((resolve, reject) => {
    this
    .fetchAccessToken()
    .then((data) => {
      var url = api.permanent.batch + 'access_token=' + data.access_token
      request({method: 'POST', url: url, body: options, json: true}).then((response) => {
        var _data = response.body
        if (_data) resolve(_data)
        else throw new Error('Batch media fails')
      })
    })
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
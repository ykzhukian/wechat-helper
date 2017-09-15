'use strict'

var config = require('./config')
var Wechat = require('./wechat/wechat')

var wechatApi = new Wechat(config.wechat)

exports.reply = function *(next) {
  var message = this.weixin

  if (message.MsgType === 'event') {
    if (message.Event === 'subscribe') {
      if (message.EventKey) {
        console.log('QR CODE: ' + message.EventKey + ' ' + message.Ticket)
      }
      this.body = '你好，欢迎订阅'
    } else if (message.Event === 'unsubscribe') {
      this.body = ''
      console.log('取关了')
    } else if (message.Event === 'LOCATION') {
      this.body = '上报的位置: ' + message.Latitude + ' | ' + message.Longtitude + '-' + message.Precision
    } else if (message.Event === 'CLICK') {
      this.body = '点击菜单: ' + message.EventKey
    } else if (message.Event === 'SCAN') {
      this.body = '你扫了些什么 ' + message.EventKey + ' ' + message.Ticket
    } else if (message.Event === 'VIEW') {
      this.body = '你点了链接 ' + message.EventKey
    } 
  } else if (message.MsgType === 'text') {
    var content = message.Content
    var reply = '你好'
    if (content === '1') {
      reply = '一'
    } else if (content === '2') {
      reply = '二'
    } else if (content === '3') {
      reply = [
        {
          title: '图文',
          description: '描述文字',
          picurl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1505910422&di=3fe25e2fa2cf89dee92cd799d76e4334&imgtype=jpg&er=1&src=http%3A%2F%2Fcdn.duitang.com%2Fuploads%2Fitem%2F201410%2F16%2F20141016152023_5vt4R.jpeg',
          url: 'https://github.com'
        },
        {
          title: '第二篇',
          description: 'description 2 x x x x ! oh!',
          picurl: 'https://b-ssl.duitang.com/uploads/item/201502/21/20150221220514_3sE8F.jpeg',
          url: 'https://github.com'
        }
      ]
    } else if (content === '4') {
      var data = yield wechatApi.uploadMedia('image', __dirname + '/2.jpg')
      reply = {
        type: 'image',
        mediaId: data.media_id
      }
    } else if (content === '5') {
      var data = yield wechatApi.uploadMedia('video', __dirname + '/big_buck_bunny.mp4')
      reply = {
        type: 'video',
        title: 'Big Buck Bunny',
        description: 'test video reply',
        mediaId: data.media_id
      }
    } else if (content === '6') {
      // var data = yield wechatApi.uploadMedia('image', __dirname + '/2.jpg')
      reply = {
        type: 'music',
        title: 'Music One',
        description: 'test music reply',
        musicurl: 'http://so1.111ttt.com:8282/2017/1/05m/09/298092036393.m4a?tflag=1501058362&pin=631f604479d1a4a2b8e66654463947fc&ip=114.82.246.122#.mp3',
        thumbMediaId: ''
      }
    } else if (content === '7') {
      var data = yield wechatApi.uploadMedia('image', __dirname + '/2.jpg', {type: 'image'})
      reply = {
        type: 'image',
        mediaId: data.media_id
      }
    } else if (content === '8') {
      var data = yield wechatApi.uploadMedia('video', __dirname + '/big_buck_bunny.mp4', {type: 'video', description: '{"title": "really nice video", "introduction":"good good well"}'})
      reply = {
        type: 'video',
        title: 'Big Buck Bunny',
        description: 'test video reply',
        mediaId: data.media_id
      }
    } else if (content === '9') {
      var picData = yield wechatApi.uploadMedia('image', __dirname + '/2.jpg', {})
      var media = {
        articles: [{
          title: 'tututu',
          thumbMediaId: picData.media_id,
          author: 'Kian',
          digest: '摘要',
          show_cover_pic: 1,
          content: 'test content',
          content_source_url: 'https://github.com'
        }]
      }
      data = yield wechatApi.uploadMedia('news', media, {})
      data = yield wechatApi.fetchMedia(data.media_id, 'news', {})
      console.log(data)
      var item = data.news_item
      var news = []

      item.forEach(function(item) {
        news.push({
          title: item.title,
          description: item.digest,
          picurl: picData.url,
          url: item.url
        })
      })
      reply = news
    } else if (content === 'b') {
      var data = yield wechatApi.batchMedia({type: 'news'})
      console.log(data)
    }
    this.body = reply
  } else {
    this.body = '你发了什么东西，我暂时看不懂'
  }

  yield next
}
'use strict'

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
    }

    this.body = reply
  } else {
    this.body = '你发了什么东西，我暂时看不懂'
  }

  yield next
}
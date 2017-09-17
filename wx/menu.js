'use strict'

module.exports = {
  'button': [{
    'name': 'click event',
    'type': 'click',
    'key': 'menu_click'
  }, {
    'name': '点出菜单',
    'sub_button': [{
      'type': 'view',
      'name': '跳转URL',
      'url': 'http://github.com/',
    }, {
      'type': 'scancode_push',
      'name': '扫码推送事件嗯嗯',
      'key': 'qr_scan'
    }, {
      'type': 'scancode_waitmsg',
      'name': '扫码推送中',
      'key': 'qr_scan_wait'
    }, {
      'type': 'pic_photo_or_album',
      'name': '弹出系统拍照',
      'key': 'pic_photo'
    }]
  }, {
    'name': '点出菜单2',
    'sub_button': [{
      'name': '微信相册发图',
      'type': 'pic_weixin',
      'key': 'pic_weixin'
    }, {
      'type': 'location_select',
      'name': '地理位置选择',
      'key': 'location_select'
    }]
  }]
}
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

exports.openFileAsync = function(fpath, encoding) {
  return new Promise((resolve, reject) => {
    fs.open(fpath, encoding, (err, content) => {
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

exports.currencyJp = function() {
  var appid = '3e4aa8aa9cac0d44dfed24a9e4568c7f'
  var url = 'http://op.juhe.cn/onebox/exchange/currency?from=cny&to=jpy&key=' + appid

  return new Promise(function(resolve, reject) {
    request({url: url, method: 'GET', }).then(function(response) {
      var data = JSON.parse(response.body)
      if (data.result) resolve(data.result)
      else throw new Error('get currency failed')
    })
  })
}

exports.chineseToNum = function(chnStr) {
  
  var chnNumChar = {
      零:0,
      一:1,
      两:2,
      二:2,
      三:3,
      四:4,
      五:5,
      六:6,
      七:7,
      八:8,
      九:9
  };
  var chnNameValue = {
    十:{value:10, secUnit:false},
    百:{value:100, secUnit:false},
    千:{value:1000, secUnit:false},
    万:{value:10000, secUnit:true},
    亿:{value:100000000, secUnit:true}
  }

  var rtn = 0;
  var section = 0;
  var number = 0;
  var secUnit = false;
  var str = chnStr.split('');

  // Remove all other chars, leave Chinese numbers only
  for(var i = 0; i < str.length; i++){ 
    if (!chnNumChar[str[i]] && !chnNameValue[str[i]] ) {
      console.log('remove ', str[i])
      str.splice(i, str.length);
    }
  }

  console.log(str)

  for(var i = 0; i < str.length; i++){
      var num = chnNumChar[str[i]];
      if(typeof num !== 'undefined'){
          number = num;
          if(i === str.length - 1){
              section += number;
          }
      }else{
          var unit = chnNameValue[str[i]].value;
          secUnit = chnNameValue[str[i]].secUnit;
          if(secUnit){
              section = (section + number) * unit;
              rtn += section;
              section = 0;
          }else{
              section += (number * unit);
          }
          number = 0;
      }
  }
  return rtn + section;
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

exports.getUrlParams = function(name) {
  // get query string from url (optional) or window
  var queryString = name.split('?')[1];

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i=0; i<arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // in case params look like: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1,-1);
        return '';
      });

      // set parameter value (use 'true' if empty)
      var paramValue = typeof(a[1])==='undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      paramValue = paramValue.toLowerCase();

      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === 'undefined') {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        }
        // if array index number specified...
        else {
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      }
      // if param name doesn't exist yet, set it
      else {
        obj[paramName] = paramValue;
      }
    }
  }

  return obj;
}
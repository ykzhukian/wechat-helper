'use strict'

var fs = require('fs')
var Promise = require('bluebird')
var xml2js = require('xml2js')

exports.readFileAsync = function(fpath, encoding) {
  return new Promise((resolve, reject) => {
    fs.readFile(fpath, encoding, (err, content) => {
      if (err) reject(err)
      else resolve(content)
    })
  })
}

exports.writeFileAsync = function(fpath, content) {
  console.log('data saving: ', content)
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
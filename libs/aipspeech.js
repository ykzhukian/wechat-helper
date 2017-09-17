'use strict'

var AipSpeech = require("baidu-ai").speech
var fs = require('fs')

// 设置APPID/AK/SK
var APP_ID = "10153145"
var API_KEY = "nE6C17lqTcmtcMbzdH1j36Fg"
var SECRET_KEY = "f4d18b5980ca2e542bb29d6bebf46a2c"
var client = new AipSpeech(APP_ID, API_KEY, SECRET_KEY)

exports.recognize = function() {
  let voice = fs.readFileSync('medias/voice.amr')
  console.log(voice)
  let voiceBuffer = new Buffer(voice)
  client.recognize(voiceBuffer, 'amr', 16000).then(function (result) {
      console.log('<normal recognize>: ' + JSON.stringify(result))
  }, function(err) {
      console.log(err)
  })
}

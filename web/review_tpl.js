var heredoc = require('heredoc')

exports.tpl = heredoc(function() {/*
  <!DOCTYPE html>
  <html>
    <head>
      <title>日本开销</title>
      <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1" />
    </head>
    <body>
      <h3>花费表 总计：<%= items.sum %>JPY</h1>
      <div>
        <% var current_date = null %>
        <% items.items.map((item, index) => { %>
          <% var new_date = new Date(item.date) %>
          <% if (current_date != new_date.getDate()) { %>
            <p><%= new_date.toDateString() %></p>
            <% current_date = new_date.getDate() %>
          <% } %>
          <p><%= item.name %> <%= item.price %></p>
        <% }) %>
      </div>

      <script src="https://cdn.bootcss.com/zepto/1.2.0/zepto.js"></script>
      <script src="http://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
      <script>
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: 'wxda1ef7ca71651c91', // 必填，公众号的唯一标识
          timestamp: '<%= config.timestamp %>', // 必填，生成签名的时间戳
          nonceStr: '<%= config.nonceStr %>', // 必填，生成签名的随机串
          signature: '<%= config.signature %>',// 必填，签名，见附录1
          jsApiList: [
            'startRecord',
            'stopRecord',
            'onVoiceRecordEnd',
            'translateVoice'
          ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
        wx.ready(function(){
          wx.checkJsApi({
            jsApiList: ['onVoiceRecordEnd'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
            success: function(res) {
              console.log(res)
              // 以键值对的形式返回，可用的api值true，不可用为false
              // 如：{"checkResult":{"onVoiceRecordEnd":true},"errMsg":"checkJsApi:ok"}
            }
          });
        });
      </script>
    </body>
  </html>
*/})
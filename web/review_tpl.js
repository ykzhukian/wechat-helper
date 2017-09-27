var heredoc = require('heredoc')

exports.tpl = heredoc(function() {/*
  <!DOCTYPE html>
  <html>
    <head>
      <title>日本开销</title>
      <meta name="viewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1" />
    </head>
    <body>
      <div class="fixed-top">
        <h4>总计：<%= items.sum %> <i><small>JPY</small></i> <span class="float-right">预算剩余：<%= 507000 - items.sum %> <i><small>JPY</small></i></span></h4>
        <h4>约合：<%= Math.round(items.sum / 16.9, 1) %> <i><small>RMB</small></i> <span class="float-right">余：<%= 30000 - Math.round(items.sum / 16.9, 1) %> <i><small>RMB</small></i></span></h4>
        <h4>剩余：<%= days_left %> <i><small>天</small></i> <span class="float-right">平均每天：<%= Math.round((507000 - items.sum) / days_left) %> <i><small>JPY</small></i></span></h4>
      </div>
      <div class="content-wrapper">
        <% var current_date = null %>
        <% items.items.map((item, index) => { %>
          <% var new_date = new Date(item.date) %>
          <% if (current_date != new_date.getDate()) { %>
            <div class="date"><%= new_date.toDateString() %></div>
            <% current_date = new_date.getDate() %>
          <% } %>
          <div class="items-wrapper">
            <p class="item"><%= item.name %> 
              <span class="float-right"><a href="">删除</a></span>
              <span class="float-right" style="margin-right: 10px;"><%= item.price %> <i><small>JPY</i></small></span>
            </p>
          </div>
        <% }) %>
      </div>
    </body>

    <style>
      html, body {
        padding: 0;
      }
      html {
        margin: 0;
        box-sizing: border-box;
      }
      *, *:before, *:after {
        box-sizing: inherit;
      }
      .fixed-top {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        padding: 10px;
        background-color: #fefefe;
        z-index: 999;
      }
      h4 {
        margin: 5px 0;
      }
      .content-wrapper {
        margin-top: 88px;
      }
      .float-right {
        float: right;
      }
      .date {
        background-color: #fefefe;
        width: 100%;
        text-align: center;
      }
      .sticky {
        position: fixed;
        top: 88px;
        left: 0;
      }
    </style>

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
      var date = $('.date')
      var positions = {}
      date.map((index, date) => {
        datePos = $(date).offset().top
        positions[index] = datePos;
      })
      console.log(positions)
      function onScroll(e) {
        date.map((index, date) => {
          datePos = positions[index]
          windowsPos = $('body').scrollTop()
          if (windowsPos + 88 > datePos) {
            $(date).addClass('sticky')
            $(date).next('.items-wrapper').css('padding-top', '17px')
            console.log('date pos: ', datePos)
            console.log('windows pos: ', windowsPos)
          } else if (windowsPos + 55 < datePos) {
            $(date).removeClass('sticky')
            $(date).next('.items-wrapper').css('padding-top', '0')
          }
        })
      }
       
      document.addEventListener('scroll', onScroll);
    </script>
  </html>
*/})
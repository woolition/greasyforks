// ==UserScript==
// @name         资源网助手
// @namespace    https://greasyfork.org/zh-CN/users/104201
// @version      2.3
// @description  最大资源网、172资源网、1977资源网、ok资源网、高清电影资源站、永久资源网、酷云资源、酷播资源网、非凡资源网[MP4][m3u8]视频直接播放，分类页面改进翻页功能。
// @author       黄盐
// 影视作品介绍页面
// @match        */?m=vod-*
// 分类页面
// @match        */detail/*
// ╮(╯▽╰)╭  好尴尬啊~我都忘记这个站点是用来做什么的了。最初添加好像是有些资源用这个网址开头的。
// @match        http://bobo.okokbo.com*
// @resource     playercss   https://cdn.bootcss.com/dplayer/1.25.0/DPlayer.min.css
// @require      https://cdn.bootcss.com/hls.js/0.12.4/hls.min.js
// @require      https://cdn.bootcss.com/dplayer/1.25.0/DPlayer.min.js
// @require      https://cdn.bootcss.com/zepto/1.2.0/zepto.min.js
// @noframes
// @run-at       document-end
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        unsafeWindow
// ==/UserScript==
;/* jshint esversion: 6 */
(function () {

  GM_addStyle(`
    span.zPlayButton{color:orange;font-size:1.2em;padding:2px 5px}
    span.played{color:gray}
    span.zPlayButton:hover{cursor:pointer;font-size:1.5em;background:#00000010;padding:3px 10px}
    /* 不是 m3u8 或者 MP4 的链接，直接打开另外的网页就可以 */
    span[data-url]{display:none}
    span[data-url*=m3u8],span[data-url*=mp4]{display:inline-block}
    table a{font-family:"微软雅黑"}
    #playerContainer{width:60%;position:fixed;display:block;z-index:9000;right:0;}
    #playerControls{position:absolute;width:100%;cursor:move;top:0;z-index:10000;visibility:hidden;}
    #playerContainer:hover #playerControls{visibility:visible;}
    #playerControls i{display:inline-block;max-height:40px;width:25px;padding:2px 5px;margin-left:5px;color:#fff;text-align:center;font-size: 16px;cursor:pointer;background:#ffff0080}
    #playerControls i:hover{color:red}
  `);
  GM_addStyle(GM_getResourceText("playercss"));

  let tempElement, tempText;
  // 链接转化，添加播放按钮
  Zepto('input[name*=copy_]').forEach(element => {
    // 链接转化为真链接
    if (Zepto(element).parent().find('a').length) {
      // 有 <a> 元素的情况
      Zepto(element).parent().find('a').attr({
        href: Zepto(element).val(),
        target: '_blank'
      }).after(`<span class="zPlayButton" data-url='${Zepto(element).val()}'>▶</span>`);
    } else {
      // 没有 <a> 元素的情况
      tempElement = element; tempText = Zepto(element).parent().text();
      Zepto(element).parent().empty().append(tempElement).append(`<a href="${Zepto(tempElement).val()}" target="_blank">${tempText}</a>`)
        .append(`<span class="zPlayButton" data-url='${Zepto(tempElement).val()}'>▶</span>`);
    }
  });
  // 元素全屏
  function fullScreen(elem) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullScreen) {
      elem.webkitRequestFullScreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else {
      elem.msRequestFullscreen();
    }
  }
  // 播放器拖动位置
  function move(e) {
    let left, top;
    let div = Zepto('#playerContainer')[0];
    let disX = e.clientX - div.offsetLeft;
    let disY = e.clientY - div.offsetTop;
    document.onmousemove = (e) => {
      left = e.clientX - disX;
      top = e.clientY - disY;
      Zepto(div).css({ left: left + 'px', top: top + 'px' });
    };
    document.onmouseup = (e) => {
      GM_setValue('position', { left: left, top: top });
      document.onmousemove = null;
      document.onmouseup = null;
    };
  }

  // 页面添加播放器，按需初始化
  function initPlayer(videoUrl = "") {
    // 添加播放器容器
    Zepto('body').append(`
      <div id="playerContainer">
        <div id="playerControls">
          <i data-size="small">🗕</i>
          <i data-size="medium">🗗</i>
          <i data-size="big">🗖</i>
          <i data-size="full">🡧🡥</i>
          <i data-size="close">🗙</i>
          <b id="playerTitle"></b>
        </div>
        <div id="zplayer"></div>
      </div>`);
    unsafeWindow.dp = new DPlayer({
      container: Zepto('#zplayer')[0],
      volume: 1,
      video: { url: videoUrl }
    });
    // 播放器调整尺寸或者关闭按钮功能
    function spanClick(e) {
      let sizes = {
        small: { width: '35%', height: 'auto' },
        medium: { width: '70%', height: 'auto' },
        big: { width: '100%', height: 'auto' }
      };
      console.log(unsafeWindow.dp.url)
      let size = e.target.dataset.size;
      switch (size) {
        case 'small':
        case 'medium':
        case 'big':
          Zepto('#playerContainer').css(sizes[size]);
          break;
        case 'full':
          fullScreen(Zepto('#playerContainer')[0]);
          break;
        case 'close':
          unsafeWindow.dp.switchVideo({ url: '' });
          unsafeWindow.dp.pause();
          Zepto('#playerContainer').hide();
          break;
        default:
          break;
      }
    }
    let position = GM_getValue('position', { left: 200, top: 100 });
    if(position=={}){position={ left: 200, top: 100 }}
    Zepto('#playerContainer').css({ left: position.left + 'px', top: position.top + 'px' });
    Zepto("#playerControls").on('mousedown', move);
    Zepto('#playerControls i').on('click', (e) => { spanClick(e); });

  }

  // 切换播放链接，点击播放按钮的时候生效
  function switchVideo(e) {
    // 还没有播放器的话，就初始化
    if (unsafeWindow.dp == undefined) { initPlayer(); }
    $('#playerContainer').show();
    let title = Zepto(e.target).prev().text().split('$')[0];
    Zepto('#playerTitle').text(title);

    console.log(title, "新视频地址：", e.target.dataset.url);  // 这一行不要删除

    unsafeWindow.dp.switchVideo({ url: e.target.dataset.url });
    unsafeWindow.dp.play();
  }
  Zepto('.zPlayButton').on('click', e => {
    Zepto(e.target).addClass('played');
    switchVideo(e);
  });


})();

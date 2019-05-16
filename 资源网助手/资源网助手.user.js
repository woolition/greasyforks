// ==UserScript==
// @name         资源网助手
// @namespace    https://greasyfork.org/zh-CN/users/104201
// @version      1.5
// @description  最大资源网、172资源网、1977资源网、ok资源网、高清电影资源站、永久资源网、酷云资源、酷播资源网、非凡资源网[MP4][m3u8]视频直接播放，分类页面改进翻页功能。
// @author       黄盐
// 影视作品介绍页面
// @match        */?m=vod-*
// 分类页面
// @match        */detail/*
// ╮(╯▽╰)╭  好尴尬啊~我都忘记这个站点是用来做什么的了。最初添加好像是有些资源用这个网址开头的。
// @match        http://bobo.okokbo.com*
// @resource     playercss   https://cdn.bootcss.com/dplayer/1.25.0/DPlayer.min.css
// @resource     hlsjs       https://cdn.bootcss.com/hls.js/0.12.4/hls.min.js
// @resource     playerjs    https://cdn.bootcss.com/dplayer/1.25.0/DPlayer.min.js
// @noframes
// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// @grant        GM_openInTab
// ==/UserScript==
/* jshint esversion: 6 */
;
(function () {
  //适配详情页，http://*.com/?m=vod-detail-id-*.html
  if (location.href.indexOf("detail") || (location.origin === "http://bobo.okokbo.com" && GM_getValue("lastLink", ""))) {
    try {
      // ERRC:enable right click to close, ERRC 就是启用【右键关闭】功能
      const ERCC = GM_getValue("ERCC", false);
      GM_addStyle(GM_getResourceText("playercss"));
      GM_addStyle(`
        #videoBox{position:fixed;top:100px;left:100px;width:60%;height:auto;}
        #videoBox.videoBoxFullScreen{width:100%;height:100%;margin:0;padding:0;top:0;left:0;}
        `);
      // 这里是为了支持 *.m3u8 类型的播放链接，需要 hls.js, 需要在加载 DPlayer 之前加载
      eval(GM_getResourceText("hlsjs"));
      eval(GM_getResourceText("playerjs"));
      // 运行 DPlayer
      this.zPlay = (function () {
        let modul = {};
        modul.init = function () {
          // 初始化，创建并绑定 video 容器
          var videoBox = document.createElement('div');
          document.body.appendChild(videoBox);
          videoBox.outerHTML = `<div id="videoBox" 
            allowfullscreen="allowfullscreen"
            mozallowfullscreen="mozallowfullscreen"
            msallowfullscreen="msallowfullscreen"
            oallowfullscreen="oallowfullscreen"
            webkitallowfullscreen="webkitallowfullscreen"></div>`
        };
        modul.doPlay = function (actionMark) {
          let videoBox = document.querySelector('#videoBox');
          let url = "";
          try {
            url = event.target.previousElementSibling.href;
            if (new URL(url).origin === "http://bobo.okokbo.com") {
              GM_setValue("lastLink", url);
              GM_openInTab("http://bobo.okokbo.com", { active: true });
              return;
            }
          } catch (e) {
            url = GM_getValue("lastLink", "");
          }
          // 目前只支持2种后缀格式，一种是 .m3u8 结束的链接。另外一种就是 DPlayer 内置支持的格式如 .mp4 等等
          // 当然，如果直接就是跳转到另外的网页的播放的那种，就不用考虑
          let videoType = (url.split(".").pop() === "m3u8") ? "hls" : "normal";
          let siteColor = "#ff6a1f";
          let dp = new DPlayer({
            theme: siteColor,
            container: videoBox,
            video: {
              url: url,
              type: videoType
            },
            contextmenu: [{
              text: "🗙 关闭播放器",
              link: "javascript:window.zPlay.close();"
            }, {
              text: "启用右键关闭播放器",
              link: "javascript:window.zPlay.toggleERCC();"
            }
            // 这个菜单不上线，因为退出网页全屏的时候，并不会出发 fullscreen_cancel 事件。没法恢复原来大小
            // , {
            //   text: "[↙↗] 网页全屏",
            //   click: (player)=>{
            //     videoBox.setAttribute("class", videoBox.getAttribute("class")+" videoBoxFullScreen");
            //     player.fullScreen.request("web");
            //   }
            // }
            ]
          });
          dp.on("fullscreen", () => {
            // 加这个样式是保证播放器能够全屏
            videoBox.setAttribute("class", videoBox.getAttribute("class")+" videoBoxFullScreen");
          });
          dp.on("fullscreen_cancel", () => {
            // 同样，这里是为了保证窗口能回到原来的大小
            videoBox.setAttribute("class", videoBox.getAttribute("class").replace("videoBoxFullScreen",""));
          });
          if (GM_getValue("ERCC", false)) {
            dp.on("contextmenu_show", () => {
              this.close();
            });
            GM_registerMenuCommand("禁用[右键关闭播放器]", this.toggleERCC);
          }
          setTimeout(() => dp.play(), 100);
        };
        modul.toggleERCC = function () {
          GM_setValue("ERCC", !GM_getValue("ERCC", false));
          try {
            document.querySelector("div.dplayer-menu").setAttribute("class", "dplayer-menu");
          } catch (e) { }
        };
        modul.close = function () {
          document.body.removeChild(document.querySelector("#videoBox"));
          modul.init();
        };
        return modul;
      })();
      //=========== Run =================
      GM_addStyle(`
        /* 这些样式是改造页面的链接的。在链接后面加播放按钮，启用DPlayer */
        span.playSpan{padding:2px 5px;color:#ff6a1f;}
        span.playSpan:hover{background:#00000010;padding:3px 10px;cursor:pointer;}
        `);
      let lis = document.querySelectorAll("input[name*='copy_']");
      let link, play;
      for (let i = 0; i < lis.length; i++) {
        link = lis[i].value;
        if (link.indexOf('m3u8') != -1 || link.indexOf('mp4') != -1) {
          play = `<span class="playSpan" onclick = "zPlay.doPlay()">▶</span>`;
        } else {
          play = '';
        }
        lis[i].parentNode.innerHTML = `${lis[i].outerHTML}<a target="_blank" href="${lis[i].value}" class="flow-wave">${lis[i].parentNode.textContent}</a>${play}`;
      }
      zPlay.init();
    } catch (e) {
      console.log(e);
    }
  }
  //适配分类页，http://*.com/?m=vod-type-id-*.html 方便翻页
  if (location.search.indexOf("type") != -1) {
    GM_addStyle('.GM_page{position:fixed !important;bottom:0 !important; width:100% !important;}');
    var ms = function () {
      var evt = window.event || arguments[0];
      if (evt.pageY < (document.body.offsetHeight - window.innerHeight)) {
        document.getElementsByClassName('pages')[0].className = "pages GM_page";
      } else {
        document.getElementsByClassName('pages')[0].className = "pages";
      }
    };
    document.onmousewheel = ms;
  }
})();

// 一个叫【品味】的老哥，窃了我的代码，还不留下我的信息。不好吧？【Shame! Shame! Shame!】 →_→
// 不过他倒是提供了几个新的资源站点。参考如下
// http://www.zuidazy.com/?m=vod-*
// http://www.172zy.net/?m=vod-*
// http://www.1977zy.com/?m=vod-*
// http://www.okzyw.com/?m=vod-*
// http://zuidazy.net/?m=vod-*
// http://www.gaoqingzy.com/?m=vod-*
// http://www.yongjiuzy.cc/?m=vod-*
// http://www.jingpinzy.com/?m=vod-*
// http://okokzy.cc/?m=vod-*
// http://caiji.000o.cc/?m=vod-*
// http://www.jingpinzy.net/?m=vod-*
// http://www.okokzy.com/?m=vod-*
// http://okzyzy.com/?m=vod-*
// http://okzyzy.cc/?m=vod-*
// http://www.okokzy.cc/?m=vod-*
// http://www.kubozy.net/?m=vod-*
// http://bobo.okokbo.com*
// http://www.ffzy8.com/detail/*
// http://www.kuyunzy.cc/detail/*
// http://www.kuyun.co/detail/*
// http://jingpinzy.com/?m=vod-detail-id*
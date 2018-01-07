// ==UserScript==
// @name         资源网助手
// @namespace    https://greasyfork.org/zh-CN/users/104201
// @version      1.1
// @description  OK资源网，最大资源网[MP4][m3u8]视频直接播放，分类页面改进翻页功能
// @author       黄盐
// @match        http://www.zuidazy.com/?m=vod-*
// @match        http://www.okokzy.com/?m=vod-*
// @match        http://okzyzy.com/?m=vod-*
// @resource     playercss   https://cdn.bootcss.com/dplayer/1.17.3/DPlayer.min.css
// @resource     hlsjs       https://cdn.bootcss.com/hls.js/0.8.9/hls.min.js
// @resource     playerjs    https://cdn.bootcss.com/dplayer/1.17.3/DPlayer.min.js
// @noframes
// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_getResourceText
// @grant        GM_registerMenuCommand
// ==/UserScript==
/* jshint esversion: 6 */
;
(function() {

  //适配详情页，http://*.com/?m=vod-detail-id-*.html
  if (location.search.indexOf("detail") != -1) {
    try {
      //-------> Prepare
      //ERRC:enable right click to close
      const ERCC = GM_getValue("ERCC", false);
      GM_addStyle(GM_getResourceText("playercss"));
      // new Function(GM_getResourceText("hlsjs"))();
      // new Function(GM_getResourceText("playerjs"))();
      eval(GM_getResourceText("hlsjs"));
      eval(GM_getResourceText("playerjs"));
      //-------> Player
      this.zPlay = (function() {
        let modul = {};
        modul.init = function() {
          var videoDiv = document.createElement('div');
          videoDiv.id = "videoDiv";
          videoDiv.style.cssText = "position:fixed;top:100px;left:100px;width:60%;height:auto;";
          document.body.appendChild(videoDiv);
        };
        modul.doPlay = function() {
          let containDiv = document.querySelector('#videoDiv');
          let urlStr = event.target.previousElementSibling.href;
          let videoType = (urlStr.split(".").pop() === "m3u8") ? "hls" : "normal";
          let siteColor = window.getComputedStyle(document.querySelector("div.sddm")).backgroundColor;
          let dp = new DPlayer({
            theme: siteColor,
            container: containDiv,
            video: {
              url: urlStr,
              type: videoType
            },
            contextmenu: [{
              text: "🗙关闭播放器",
              link: "javascript:window.zPlay.close();"
            }, {
              text: "启用右键关闭播放器",
              link: "javascript:window.zPlay.toggleERCC();"
            }]
          });
          dp.on("fullscreen", () => {
            containDiv.style.cssText = "";
          });
          dp.on("fullscreen_cancel", () => {
            containDiv.style.cssText = "position:fixed;top:100px;left:100px;width:60%;height:auto;";
          });
          if (ERCC){
            dp.on("contextmenu_show", () => {
              this.close();
            });
            GM_registerMenuCommand("禁用[右键关闭播放器]",this.toggleERCC);
          }
          setTimeout(() => dp.play(), 100);
        };
        modul.toggleERCC = function(){
          GM_setValue("ERCC", !GM_getValue("ERCC", false));
          try {
            document.querySelector("div.dplayer-menu").setAttribute("class", "dplayer-menu");
          } catch(e) {}
        };
        modul.close = function() {
          document.body.removeChild(document.querySelector("#videoDiv"));
          modul.init();
        };
        return modul;
      })();
      //=========== Run =================
      GM_addStyle(`
    span.playSpan{padding:2px 5px;color:${window.getComputedStyle(document.querySelector("div.sddm")).backgroundColor};}
    span.playSpan:hover{background:#00000010;padding:3px 10px;cursor:pointer;}
    `);
      var lis = document.querySelectorAll("div.vodplayinfo li"); //文档中0~end 是链接项目，渲染结束后是6~end是链接项目
      var tmp, play;
      for (var i = 0; i < lis.length; i++) {
        tmp = lis[i].innerText;
        if (tmp.indexOf('m3u8') != -1 || tmp.indexOf('mp4') != -1) {
          play = `<span class="playSpan" onclick = "zPlay.doPlay()">▶</span>`;
        } else {
          play = '';
        }
        lis[i].innerHTML = lis[i].childNodes[0].outerHTML + '<a target="_blank" href="' + tmp.slice(tmp.indexOf("http")) + '">' + tmp + '</a>' + play;
      }
      zPlay.init();
    } catch (e) {}
  }
  //适配分类页，http://*.com/?m=vod-type-id-*.html 方便翻页
  if (location.search.indexOf("type") != -1) {
    GM_addStyle('.GM_page{position:fixed !important;bottom:0 !important; width:100% !important;}');
    var ms = function() {
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
// ==UserScript==
// @name               DarkTheme
// @name:zh-CN         网页黑色主题
// @namespace          https://greasyfork.org/zh-CN/users/104201
// @version            0.1
// @description        Tabs in Dark Theme
// @description:zh-CN  网页切换为黑色主题
// @author             黄盐
// @include            *
// @noframes
// require      https://cdnjs.cloudflare.com/ajax/libs/zepto/1.2.0/zepto.min.js
// @run-at       document-start
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// ==/UserScript==
/* jshint esversion: 6 */
;
(function() {
  'use strict';
  const CSS = `
    :root{
      -webkit-filter: invert(100%) contrast(87%);
      filter: invert(100%) contrast(87%);
      background: #272822 !important;
    }
    img{
      -webkit-filter: invert(100%) brightness(105%);
      filter: invert(100%) brightness(105%);
    }
    *[style*="url"]{
      -webkit-filter: invert(100%);
      filter: invert(100%);
    }
    *[data-dmbg="1"]{
      -webkit-filter: none;
      filter: none;
    }
    *[data-dmbg="2"]{
      -webkit-filter: invert(100%);
      filter: invert(100%);
    }
    video, embed, object, canvas{
      -webkit-filter: invert(100%);
      filter: invert(100%);
    }
    /* 图标 */
    ::before{
      -webkit-filter: invert(100%);
      filter: invert(100%);
    }
    /* 图标 排除font-awesome图标 */
    .fa::before{
      -webkit-filter: invert(0%);
      filter: invert(0%);
    }
    /* 下面的 img img 这种选择器，是指那些被点击后图片会放大的图片，如微博里面小图, 方案: 眼睛护航crx*/
    :-webkit-any(iframe, img, [style*="url"]:not(input), i, video, object,embed:not([type$="pdf"]))
    :-webkit-any(iframe, img, [style*="url"]:not(input), i, video, object,embed:not([type$="pdf"]))
    {
      -webkit-filter:none;
      filter:none;
    }
    :-moz-any(iframe, img, [style*="url"]:not(input), i, video, object,embed:not([type$="pdf"]))
    :-moz-any(iframe, img, [style*="url"]:not(input), i, video, object,embed:not([type$="pdf"]))
    {filter:none;}

    /* baidu search,news,wenku logo*/
    #result_logo img,
    .s_logo img,
    .logo img{
      -webkit-filter: invert(0%);
      filter: invert(0%);
    }
    /**/
    img[src*="logo"]{
      -webkit-filter: invert(0%);
      filter: invert(0%);
    }
`;
  var mode, darkThemeSwitch, pageFirstLoad = true,
    blackList;
  try { //Tampermonkey
    blackList = GM_getValue('blackList', {});
  } catch (e) { //GreasyMonkey
    blackList = GM.getValue('blackList', {});
  }

  /*这里不采用GM_addStyle,是为了避免网页局部更新的时候,把<head>内部的<style>去除了,例如百度搜索,点击搜索一下按钮的时候*/
  function addStyle(styleId, cssText) {
    let a = document.createElement('style'),
      doc = document.body || document.documentElement;
    a.id = styleId;
    a.textContent = cssText;
    doc.appendChild(a);
  }

  function GMBlackList() {
    if (pageFirstLoad) {
      let a = document.createElement('div'),
        doc = document.body || document.documentElement,
        txt = `
      #GMBlackListDiv{position:fixed;left:0;bottom:0;width:30px;height:30px;border-radius:20px;background:cyan;opacity:0;z-index:9999999;}
      #GMBlackListDiv:hover{opacity:1;}
      `;
      addStyle('GMBlackList', txt);
      a.id = 'GMBlackListDiv';
      doc.appendChild(a);
      a.addEventListener('click', GMBlackList, false);
    } else {
      if (blackList[location.host] === undefined) {
        blackList[location.host] = true;
      } else {
        delete blackList[location.host];
      }
      GM.setValue('blackList', blackList);
    }
    if (blackList[location.host]) {
      try {
        document.getElementById('darkTheme').parentNode.removeChild(document.getElementById('darkTheme'));
      } catch (e) {}
    } else {
      addStyle('darkTheme', CSS);
      init();
    }

  }

  function TMBlackList() {
    if (!pageFirstLoad) {
      GM_unregisterMenuCommand(darkThemeSwitch);
      if (blackList[location.host] === undefined) {
        blackList[location.host] = true;
      } else {
        delete blackList[location.host];
      }
      GM_setValue('blackList', blackList);
    }

    if (blackList[location.host]) {
      try {
        document.getElementById('darkTheme').parentNode.removeChild(document.getElementById('darkTheme'));
      } catch (e) {}
      darkThemeSwitch = GM_registerMenuCommand('DarkTheme  On', TMBlackList);
    } else {
      addStyle('darkTheme', CSS);
      init();
      darkThemeSwitch = GM_registerMenuCommand('DarkTheme  Off', TMBlackList);
    }
  }
  (typeof GM_registerMenuCommand === 'function') ? TMBlackList(): GMBlackList();

  function init() {
    // $('*').filter(function() {
    //   if (this.currentStyle) {
    //     return this.currentStyle['backgroundImage'] !== 'none';
    //   } else if (window.getComputedStyle) {
    //     return document.defaultView.getComputedStyle(this,null).getPropertyValue('background-image') !== 'none';
    //   }
    // }).addClass('bg_found');

    function BGlinks() {
      [].forEach.call(document.links, function(item, index) {
        if (document.defaultView.getComputedStyle(item).getPropertyValue('background-image') !== 'none')
          item.setAttribute('data-dmbg', '1');
      });

    }

    function ready(fn) {
      if (document.addEventListener) { //标准浏览器
        document.addEventListener('DOMContentLoaded', function() {
          //注销时间，避免重复触发
          document.removeEventListener('DOMContentLoaded', arguments.callee, false);
          fn(); //运行函数
        }, false);
      } else if (document.attachEvent) { //IE浏览器
        document.attachEvent('onreadystatechange', function() {
          if (document.readyState == 'complete') {
            document.detachEvent('onreadystatechange', arguments.callee);
            fn(); //函数运行
          }
        });
      }
    }

    ready(BGlinks);

  }
  pageFirstLoad = false;

})();
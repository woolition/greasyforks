// ==UserScript==
// @name         马蜂窝旅游商城--获取销量价格
// @namespace    https://greasyfork.org/zh-CN/users/104201
// @version      0.2
// @description  马蜂窝，旅游商城板块，把产品列表转化为表格。适用于Tampermonkey
// @author       黄盐
// @include      *//www.mafengwo.cn/*
// @require      https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js
// @noframes
// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        window.close
// ==/UserScript==
/* jshint esversion: 6 */
;
(function() {

  function makeTable() {

 var items = $('a.item.clearfix');
    //这里不采用自编id，而是采用美团统一id，这样即使产品更改自编id或者更改产品名称也可以第一时间识别出来
    var tableHTML = "<table id='customers' contenteditable='true'><tr><th>马蜂窝ID</th><th>产品名称</th><th>出发地</th><th>品类</th><th>价格</th><th>销量</th><th>店铺名称</th></tr>";
    var tmp;
    $.each(items,(index,item) =>{
      // console.log(item);
      tableHTML += `<tr>
      <td>${item.href.match(/\d{4,10}/)[0]}</td>
      <td>${$(item).find('h3').text()}</td>
      <td>${$(item).find('span strong').first().text()}</td>
      <td>${$(item).find('span span').text()}</td>
      <td>${$(item).find('span.price>strong').text()}</td>
      <td>${$(item).find('.info p:first-child').text().length ? $(item).find('p').text().match(/\d{1,7}/) : 0}</td>
      <td>${$(item).find('span.t').text().replace(/店铺: /g,'')}</td>
      </tr>`;
    });

    tableHTML += "<table>";
    $("div.list-wrap").html(tableHTML);
  }

  function tableMode(){
    // 表格在版块内，可滚动，内容可编辑
    $('div.list-wrap').css({"overflow-x":"scroll"});
    // 克隆翻页组件，上移,
    $('#list_pagination').insertBefore($("div.sort-bar"));
    //添加转换表格按钮
    $("div.sort-bar>ul").append(`<li id="makeTable" class="sort-item"><a data-sort="sold_num">转成表格</a></li>`);
    $("#makeTable").on("click",makeTable);
  }

  GM_addStyle(`
    #customers{overflow:auto;white-space:nowrap}
    #customers{font-family:"Trebuchet MS",Arial,Helvetica,sans-serif;width:100%;border-collapse:collapse;}
    #customers td,#customers th{font-size:1em;border:1px solid #98bf21;padding:3px 7px 2px 7px;}
    #customers th{text-align:left;padding-top:5px;padding-bottom:4px;background-color:#A7C942;color:#ffffff;}
    #customers tr.alt td{color:#000000;background-color:#EAF2D3;}
    `);
  GM_registerMenuCommand('开启表格模式',tableMode,' ');

})();
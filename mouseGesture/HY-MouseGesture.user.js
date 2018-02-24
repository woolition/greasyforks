// ==UserScript==
// @name           MousePlus
// @name:zh-CN     鼠标手势--就是这么拽!
// @namespace      https://greasyfork.org/users/104201
// @description    HY's mouse gesture script,supports ringt-key draw track functions and left-key drag functions.Drag target can be [Text] & [Links] & [Image]  Customizenable → Right click to draw ⇄(right,left) to setting
// @description:zh-CN  鼠标手势脚本,就是这么拽:支持右键轨迹手势和左键拖拽功能.可以拖拽[文本],[链接]和[图片],支持自定义设置:鼠标画➡⬅(右左)路径,进入设置
// @version      2.3
// @include      *
// @noframes
// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM_setClipboard
// @grant        GM_download
// @grant        GM_addValueChangeListener
// @grant        GM_notification
// @grant        window.close
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// ==/UserScript==
/* jshint esversion: 6 */

//===============================================================
//Thanks:    Robbendebiene's project Gesturefy
//           https://github.com/Robbendebiene/Gesturefy   [GPL-3.0]
//For:       canvas line style & GestureHandler

//===============================================================
//Thanks:    Jim Lin's userscript 有道划词翻译
//           https://greasyfork.org/zh-CN/scripts/15844   [License MIT]
//For:       划词翻译


(function() {
  'use strict';
//==========①=========================
  let storage = {
      get: function(name, defaultValue) {
        return GM_getValue(name, defaultValue);
      },
      set: function(name, data) {
        return GM_setValue(name, data);
      }
    },
    runtime = {
      sendMessage: function(data){
        return Promise.resolve(this.processMessage(data));
      },
      processMessage: function(data){
        switch (data.subject) {
          case "gestureFrameMousedown":
          case "gestureFrameMousemove":
          case "gestureFrameMouseup":
            gestureHandler.handleMessage(data);
            break;
          case 'gestureChange':
            if(this.captureGesture){
              Ui.captureGesture(data.data.gesture, "recorddingGesture");

              return;
            }
            try {
              let actionName = '';
              if(cfg.gesture[data.data.gesture].alias)
                actionName = cfg.gesture[data.data.gesture].alias;
              else
                actionName = local.gesture[cfg.gesture[data.data.gesture].name][cfg.language];
              return {action:actionName};
            } catch(e) {}
            break;
          case 'gestureEnd':
            if(this.captureGesture){
              Ui.captureGesture(data.data.gesture);
              return;
            }
            try {
              let action = cfg.gesture[data.data.gesture];
              Fn[action.name](action.arg, data.data);
            } catch(e) {
              // console.log(e);
            }
            break;
          case 'dragChange':
          try {
            let actionName = '',
            typeAndData = getDragFn(data.data);
            if(typeAndData[1].alias)
              actionName = typeAndData[1].alias;
            else
              actionName = local[typeAndData[0]][typeAndData[1].name][cfg.language];
            return {action:actionName};
          } catch(e) {}
            break;
          case 'dragEnd':
            try {
              let action = getDragFn(data.data)[1];
              Fn[action.name](action.arg, data.data);
            } catch(e) {
              // console.log(e);
            }
            break;
          default:
            break;
        }
      },
      captureGesture:false
    },
    _cfg = {
      Gesture: {
        mouseButton: 2,
        suppressionKey: "",
        distanceThreshold: 10,
        distanceSensitivity: 10,
        Timeout: {
          active: false,
          duration: 1
        }
      },
      Hinter: {
        background : 'ff0',
        fontSize: 40,
        lineColor: '0074d990',
        minLineWidth: 1,
        maxLineWidth: 10,
        lineGrowth: 0.6,
        funNotDefine: '  (◔ ‸◔)？'
      },
      Drag: {
        linktextAslink: true,
        dragInTextarea: true
      },
      directions: 4,
      language: "zh",
      gesture:{           // not drag, just gesture
        "2":  {name:"toTop",    arg:[]},
        "8":  {name:"toBottom", arg:[]},
        "4":  {name:"back",     arg:[]},
        "6":  {name:"forward",  arg:[]},
        "86": {name:"close",    arg:[]},
        "42": {name:"reopenTab",arg:[]},
        "64": {name:"setting",  arg:[]}
      },
      text: {         // dragText
        "8":  {name:"copyText", arg:[]},
        "6":  {
                name:"searchText",
                arg:["https://www.baidu.com/s?wd=", true, true]
              }
      },
      link: {         // drag link
        "6": {name:"openLink",   arg:[]},
        "8": {name:"copyLink",   arg:[]}
      },
      image: {         // drag image
        "8": {name:"saveImg",    arg:[]},
        "3": {name:"selectImg",    arg:[]},
        "6": {
                name:"searchImg",
                arg:['https://image.baidu.com/n/pc_search?queryImageUrl=U-R-L&uptype=urlsearch', true, true]
              },
        "2": {name:"copyImgURL", arg:[]},
        "4": {name:"selectImg",  arg:[]}
      },
    },
    cfg = storage.get('cfg',_cfg),
    Fn = {
      userDefine: function(argumentArr, data){
        try {
          new Function("mpArray", "mpData", mpUnescape(argumentArr[0]))(data);
        } catch(e) {
          console.log(e);
        }
      },
      stopLoading: function() {
        window.stop();
      },
      reload: function() {
        history.go(0);
        //window.location.reload();
      },
      reloadNoCache: function() {
        window.location.reload(true);
      },
      close: function() {
        window.close();
      },
      back: function() {
        history.back();
      },
      forward: function() {
        history.forward();
      },
      toTop: function() {
        document.documentElement.scrollTo(0, 0);
        document.body.scrollTo(0, 0);  //file:///**
      },
      toBottom: function() {
        document.documentElement.scrollTo(0, 9999999);
        document.body.scrollTo(0, 9999999);  //file:///**
      },
      reopenTab: function() {
        //GreasyMonkdy:
        // GM_openInTab(GM_getValue('latestTab'),false);
        //TamperMonkey:
        GM_openInTab(GM_getValue('latestTab', 'about:blank'), {
          active: true
        });
      },
      URLLevelUp: function() {
        //当前网址的层次结构向上一层
        if (window.location.href[window.location.href.length - 1] === "/")
          window.location.href = "../";
        else
          window.location.href = "./";
      },
      //clone curren tab ,background
      cloneTab: function() {
        GM_openInTab(location.href, {
          active: false
        });
      },
      //open new blank tab
      openBlankTab: function() {
        GM_openInTab('about:blank', {
          active: true
        });
      },
      //view source
      viewSource: function() {
        GM_openInTab('view-source:'+location.href, {
          active: true
        });
      },
      fkVip: function(argumentArr) {
        GM_openInTab(argumentArr[0]+location.href, {active:true});
      },
      closeOtherTabs: function() {
        GM_setValue('closeAll', Date());
      },
      translateSelect: function() {
        window.document.body.addEventListener('mouseup', translate, false);
        var context = new AudioContext();
        function translate(e) {
          var previous = document.querySelector('.youdaoPopup');
          if (previous) {
            document.body.removeChild(previous);
          }
          var selectObj = document.getSelection();
          if (selectObj.anchorNode.nodeType == 3) {
            var word = selectObj.toString();
            if (word == '') {
              return;
            }
            word = word.replace('-\n', '');
            word = word.replace('\n', ' ');
            var ts = new Date().getTime();
            var x = e.clientX;
            var y = e.clientY;
            translate(word, ts);
          }
          function popup(x, y, result) {
            var youdaoWindow = document.createElement('div');
            youdaoWindow.classList.toggle('youdaoPopup');
            var dict = JSON.parse(result);
            var query = dict.query;
            var errorCode = dict.errorCode;
            if (dict.basic) {
              word();
            } else {
              sentence();
            }
            youdaoWindow.style.cssText = `z-index:999999;display:block;position:fixed;color:black;text-align:left;word-wrap:break-word;background:lightBlue;border-radius:5px;box-shadow:0 0 5px 0;opacity:1;width:200px;left:${x+10}px;padding:5px`;
            if (x + 200 + 10 >= window.innerWidth) {
              youdaoWindow.style.left = parseInt(youdaoWindow.style.left) - 200 + 'px';
            }
            if (y + youdaoWindow.offsetHeight + 10 >= window.innerHeight) {
              youdaoWindow.style.bottom = '20px';
            } else {
              youdaoWindow.style.top = y + 10 + 'px';
            }
            document.body.appendChild(youdaoWindow);
            function word() {
              var basic = dict.basic;
              var header = document.createElement('p');
              var span = document.createElement('span');
              span.innerHTML = query;
              header.appendChild(span);
              var phonetic = basic.phonetic;
              if (phonetic) {
                var phoneticNode = document.createElement('span');
                phoneticNode.innerHTML = '[' + phonetic + ']';
                phoneticNode.style.cursor = 'pointer';
                header.appendChild(phoneticNode);
                phoneticNode.addEventListener('mouseup', function(e) {
                  e.stopPropagation();
                }, false);
                var soundUrl = 'https://dict.youdao.com/dictvoice?type=2&audio={}'.replace('{}', query);
                var promise = new Promise(function() {
                  GM_xmlhttpRequest({
                    method: 'GET',
                    url: soundUrl,
                    responseType: 'arraybuffer',
                    onload: function(res) {
                      try {
                        context.decodeAudioData(res.response, function(buffer) {
                          phoneticNode.addEventListener('mouseup', function() {
                            var source = context.createBufferSource();
                            source.buffer = buffer;
                            source.connect(context.destination);
                            source.start(0);
                          }, false);
                          header.appendChild(document.createTextNode('✓'));
                        });
                      } catch (e) {}
                    }
                  });
                });
                promise.then();
              }
              header.style.color = 'darkBlue';
              header.style.margin = '0';
              header.style.padding = '0';
              span.style.color = 'black';
              youdaoWindow.appendChild(header);
              var hr = document.createElement('hr');
              hr.style.margin = '0';
              hr.style.padding = '0';
              youdaoWindow.appendChild(hr);
              var ul = document.createElement('ul');
              ul.style.margin = '0';
              ul.style.padding = '0';
              basic.explains.map(function(trans) {
                var li = document.createElement('li');
                li.style.listStyle = 'none';
                li.style.margin = '0';
                li.style.padding = '0';
                li.appendChild(document.createTextNode(trans));
                ul.appendChild(li);
              });
              youdaoWindow.appendChild(ul);
            }
            function sentence() {
              var ul = document.createElement('ul');
              ul.style.margin = '0';
              ul.style.padding = '0';
              dict.translation.map(function(trans) {
                var li = document.createElement('li');
                li.style.listStyle = 'none';
                li.style.margin = '0';
                li.style.padding = '0';
                li.appendChild(document.createTextNode(trans));
                ul.appendChild(li);
              });
              youdaoWindow.appendChild(ul);
            }
          }
          function translate(word, ts) {
            var reqUrl = 'http://fanyi.youdao.com/openapi.do?type=data&doctype=json&version=1.1&relatedUrl=' +
              escape('http://fanyi.youdao.com/#') +
              '&keyfrom=fanyiweb&key=null&translate=on' +
              '&q={}'.replace('{}', word) +
              '&ts={}'.replace('{}', ts);
            GM_xmlhttpRequest({
              method: 'GET',
              url: reqUrl,
              onload: function(res) {
                popup(x, y, res.response);
              }
            });
          }
        }
      },
      contentEditable: function(argumentArr, data){
        data.target.self.setAttribute('contenteditable', 'true');
        data.target.self.setAttribute('data-mp', '1');
      },
      /*
      //not torking
      zoomIn: function(){
         setTimeout(zoomer, 200);
        function zoomer(evt){
          let a, b,isZoom = true;
          a = document.elementFromPoint(evt.clientX,evt.clientY).style.zoom=cfg.zoom;
          a.setAttribute('data-zoom', 'true');
          [].every.forEach(document.querySelectorAll('*[data-zoom=true]'), function(item){
            if (item !== a) item.style.zoom = null;
          });
        }
      },*/

      searchText: function(argumentArr, data) {
        GM_openInTab(argumentArr[0] + encodeURIComponent(data.textSelection),
         {
          active: argumentArr[1] != "false",
          insert: argumentArr[2] != "false",
          setParent: true   //makes the browser re-focus the current tab on close.
        });
      },
      copyText: function(argumentArr, data) {
        GM_setClipboard(data.textSelection, "text");
      },
      openLink: function(argumentArr, data) {
        //TamperMonkey
        GM_openInTab(getLink(data), {
          active: true
        });
      },
      copyLink: function(argumentArr, data) {
        GM_setClipboard(getLink(data), "text");
      },
      copyLinkText: function(argumentArr, data) {
        GM_setClipboard(data.target.textContent || data.textSelection, "text");
      },
      saveImg: function(argumentArr, data) {
        //TamperMonkey
        let name = data.target.src.split('/').pop();
        GM_download(data.target.src, name);
        //method 2
        /*
        let a = document.createElement('a');
        a.href = dObj.img; a.setAttribute('download', dObj.img.split('/').pop());
        document.documentElement.appendChild(a);
        a.click();
        a.parentElement.remove(a);
        */
        /* //jQuery:
        $("<a>").attr("href", actionFn.request.selimg).attr("download", actionFn.request.selimg.split('/').pop()).appendTo("body");
        a[0].click();
        a.remove();
        */
      },
      searchImg: function(argumentArr, data) {
        //TamperMonkey
        GM_openInTab(argumentArr[0].replace(/U-R-L/, data.target.src), {
          active: argumentArr[1] != "false",
          insert: argumentArr[2] != "false",
          setParent: true   //not working
        });
      },
      selectImg: function(argumentArr, data) {
        // it may not working on some browsers [develping standard]
        //TamperMonkey
        document.execCommand('selectAll');
        let sel = document.getSelection();
        sel.collapse(data.target.self, 0);
        sel.modify("extend", "forward", "character");
      },
      //not working:
      copyImage: function(e) {
        let canvas = canvasDrawTheImage(e);
        // get image as blob
        canvas.canvas.toBlob((blob) => {
          GM_setClipboard(blob, {
            type: canvas.type,
            mimetype: canvas.mime
          });
        }, canvas.mime);
      },
      image2DataURL: function(e) {
        //canvas绘制图片，由于浏览器的安全考虑:
        //如果在使用canvas绘图的过程中，使用到了外域的图片资源，那么在toDataURL()时会抛出安全异常：
        let canvas = canvasDrawTheImage(e).canvas;
        let dataURL = canvas.toDataURL();
        GM_setClipboard(dataURL, "text");
      },
      copyImgURL: function(argumentArr, data) {
        //TamperMonkey
        GM_setClipboard(data.target.src, "text");
      },
      openImgNewTab: function(argumentArr, data) {
        //TamperMonkey
        GM_openInTab(data.target.src, {
          active: true
        });
      },
      setting: function() {
        if (document.getElementById('MPsetting')) {
          return;
        }else Ui.init();
      }
    },
    local = {
      gesture:{
        stopLoading:     {zh:'停止加载',         en:'StopLoading'},
        reload:          {zh:'刷新',             en:'Refresh'},
        reloadNoCache:   {zh:'清缓存刷新',       en:'Refresh Without Cache'},
        close:           {zh:'关闭',             en:'Close'},
        back:            {zh:'后退',             en:'Back'},
        forward:         {zh:'前进',             en:'Forward'},
        toTop:           {zh:'到顶部',           en:'Scroll to Top'},
        toBottom:        {zh:'到底部',           en:'Scroll to Bottom'},
        reopenTab:       {zh:'打开最近关闭窗口', en:'Reopen Latest Closed Window'},
        setting:         {zh:'设置',             en:'Settings'},
        URLLevelUp:      {zh:'网址向上一层',     en:'URL hierarchy up'},
        cloneTab:        {zh:'克隆标签页',       en:'Duplicate This Tab'},
        openBlankTab:    {zh:'打开空白页',       en:'Open New Blank Tab'},
        viewSource:      {zh:'看网页源代码',     en:'View Source'},
        fkVip:           {zh:'破解VIP视频',      en:'Crack to Watch VIP Video'},
        closeOtherTabs:  {zh:'关闭其他标签',     en:'Close Other Tabs'},
        translateSelect: {zh:'开启划词翻译',     en:'Turn on Select And Translate'},
        //开发者功能
        contentEditable: {zh:'元素内容可编辑',   en:'Element Content Editable'},
        userDefine:      {zh:'自定义',           en:'User Define'}
      },
      //drag text
      text: {
        searchText:      {zh:'搜索选中文本',     en:'Search Selected Text'},
        copyText:        {zh:'复制选中文本',     en:'Copy Selected Text'},
        userDefine:      {zh:'自定义',           en:'User Define'}
      },
      //drag link
      link:{
        openLink:        {zh:'打开链接',         en:'Open Link'},
        copyLink:        {zh:'复制链接',         en:'Copy Link'},
        copyLinkText:    {zh:'复制链接文字',     en:'Copy Link Text'},
        userDefine:      {zh:'自定义',           en:'User Define'}
      },
      //drag image
      image:{
        saveImg:         {zh:'保存图片',         en:'Save Image'},
        searchImg:       {zh:'搜索图片',         en:'Search Image'},
        // copyImage:       {zh:'复制图片',         en:'Copy Image to ClickBoard'},
        copyImgURL:      {zh:'复制图片链接',     en:'Copy ImageURL'},
        openImgNewTab:   {zh:'新标签打开图片',   en:'Open Image in New Tab'},
        // image2DataURL:   {zh:'复制图片为DataURL',en:'Copy Image as DataURL'},
        selectImg:       {zh:'选中图片',         en:'Select This Image'},
        userDefine:      {zh:'自定义',           en:'User Define'}
      }
    };

//========②supported functions=======
 function getLink(data){
    if(data.link)
      return data.link.href;
    else if(data.target.src)
      return data.target.src;
    else return data.textSelection;
  }

  //--> check if string is an url
  function isURL (string) {
    try {
      new URL(string);
    }
    catch (e) {
      return false;
    }
    return true;
  }

  //--> checks if the current window is framed or not
  function inIframe () {
    try {
      return window.self !== window.top;
    }
    catch (e) {
      return true;
    }
  }

  //--> returns all available data of the given target
  //--> this data is used by some background actions
  function getTargetData(target) {
    let data = {};

    data.target = {
      src: target.currentSrc || target.src || null,
      title: target.title || null,
      alt: target.alt || null,
      textContent: target.textContent.trim(),
      nodeName: target.nodeName,
      self: target
    };

    let link = getClosestLink(target);
    if (link) {
      data.link = {
        href: link.href || null,
        title: link.title || null,
        textContent: link.textContent.trim()
      };
    }

    data.textSelection = getTextSelection();

    return data;
  }

  //--> returns the selected text, if no text is selected it will return an empty string
  //--> inspired by https://stackoverflow.com/a/5379408/3771196
  function getTextSelection () {
    // get input/textfield text selection
    if (document.activeElement &&
        typeof document.activeElement.selectionStart === 'number' &&
        typeof document.activeElement.selectionEnd === 'number') {
          return document.activeElement.value.slice(
            document.activeElement.selectionStart,
            document.activeElement.selectionEnd
          );
    }
    // get normal text selection
    return window.getSelection().toString();
  }

  //--> calculates and returns the distance
  //--> between to points
  function getDistance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  //--> returns the closest hierarchical link node or null of given element
  function getClosestLink (node) {
    // bubble up the hierarchy from the target element
    while (node !== null && node.nodeName.toLowerCase() !== "a" && node.nodeName.toLowerCase() !== "area")
      node = node.parentElement;
    return node;
  }
  function getDirection(x, y, cx, cy){
    /*=================
    |                 |
    | 1↖   2↑   3↗ |
    |                 |
    | 4←    5    6→ |
    |                 |
    | 7↙   8↓   9↘ |
    |                 |
    |=================*/
    let d, t;
    if(cfg.directions == 4){   //4 directions
      if (Math.abs(cx - x) < Math.abs(cy - y)) {
        d = cy > y ? "8" : "2";
      } else {
        d = cx > x ? "6" : "4";
      }
    }else{  //8 directions
      t = (cy-y)/(cx-x);
      if     (-0.4142<= t && t < 0.4142) d = cx > x ? '6' : "4";
      else if(2.4142 <= t || t< -2.4142) d = cy > y ? '8' : '2';
      else if(0.4142 <= t && t < 2.4142) d = cx > x ? '9' : '1';
      else                               d = cy > y ? '7' : '3';
    }
    return d;
  }
  // data: data.data
  function getDragFn(data){
    // let
    if(data.target.nodeName === "IMG")
      return ['image',cfg.image[data.gesture]];
    else if(data.link || data.target.nodeName === "A" || isURL(data.textSelection))
      return ['link', cfg.link[data.gesture]];
    else
      return ['text', cfg.text[data.gesture]];
  }

  function mpEscape(str){
    if(!str) return;
    return str.replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }
  function mpUnescape(str){
    if(!str) return;
    return str.replace(/&quot;/g,'"').replace(/&apos;/g, "'");
  }

//========③Hinter====================
  const Hinter = (function(){
    let modul = {};

    modul.enable = function enable(){
      GestureHandler
        .on("start", addCanvas)
        .on("update", updateTrack)
        .on("change", updateHint)
        .on("abort", reset)
        .on("end", reset);
    };

    modul.applySettings = function applySettings(Config){
      background   = Config.Hinter.background;
      fontSize     = Config.Hinter.fontSize;
      lineColor    = Config.Hinter.lineColor;
      minLineWidth = Config.Hinter.minLineWidth;
      maxLineWidth = Config.Hinter.maxLineWidth;
      lineGrowth   = Config.Hinter.lineGrowth;
      funNotDefine = Config.Hinter.funNotDefine;
      updateHintLayer();
    };

    //private methods & value
    let
      background = 'ff0',
      fontSize = 40,
      lineColor = '0074d990',
      minLineWidth = 1,
      maxLineWidth = 10,
      lineGrowth = 0.6,
      funNotDefine = '  (◔ ‸◔)？';
    let canvas = null,
    tip = null,
    ctx = null,
    hasCanvas = false;

    function updateHintLayer(){
      canvas = tip = ctx = hasCanvas = null;
      createCanvaTips();
    }
    function createCanvaTips(){
      //create <canvas>
      canvas = document.createElement("canvas");
      canvas.id = 'MPcanvas';
      ctx = canvas.getContext("2d");
      //create tips<div>
      tip = document.createElement('div');
      tip.id = 'MPtips';
      tip.style.cssText = `background:#${background} !important;  font-size: ${fontSize}px !important;`;
    }
    //<canvas> & tip<div> is ready, when mousemove or drag, append to show track & tips
    function addCanvas(e) {
      if(!canvas || !tip) createCanvaTips();
      document.documentElement.appendChild(tip);      //append tip <div>
      document.documentElement.appendChild(canvas);   //append <canvas>
      canvas.width = window.innerWidth;               //set canvas attribute to clear content
      canvas.height = window.innerHeight;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if(lineColor.length>6) canvas.style.opacity = parseInt(lineColor.slice(6),16)/255;
      ctx.lineWidth = minLineWidth;
      ctx.strokeStyle = '#' + lineColor.slice(0,6); //like delicious link color//line color
      hasCanvas = true;
      //allow drop
      tip.addEventListener('dragover', ()=>event.preventDefault(), false);
      canvas.addEventListener('dragover', ()=>event.preventDefault(), false);
    }
    //remove <canvas> and tips<div>,set flags to false
    function reset() {
      if (hasCanvas) {
        document.documentElement.removeChild(canvas);
        tip.innerHTML = '';
        document.documentElement.removeChild(tip);
      }
      hasCanvas = false;
    }
    //show Tips
    function updateHint(gesture,fnName){
      tip.innerHTML = gesture.join("") + '<br/>' + (fnName ? fnName : funNotDefine);
    }
    function updateTrack(x,y){
      if (hasCanvas) {
        ctx.lineWidth = Math.min(maxLineWidth, ctx.lineWidth += lineGrowth);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
    // due to modul pattern: http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html
    return modul;
  })();

//========④GesturedHadler============
  //--> GestureHandler "singleton" class using the modul pattern
  //--> the handler behaves different depending on whether it's injected in a frame or not
  //--> frame: detects gesture start, move, end and sends an indication message
  //--> main page: detects whole gesture including frame indication messages and reports it to the background script
  //--> provides 4 events: on start, update, change and end
  //--> on default the handler is disabled and must be enabled via enable()
  //--> REQUIRES: contentCommons.js
  const GestureHandler = (function() {
    // public variables and methods
    let modul = {};

    //-->Add callbacks to the given events
    modul.on = function on(event, callback) {
      // if event does not exist or function already applied skip it
      if (event in events && !events[event].includes(callback))
        events[event].push(callback);
      return this;
    };

    //-->applies necessary settings
    modul.applySettings = function applySettings(Settings) {
      mouseButton = Number(Settings.Gesture.mouseButton);
      suppressionKey = Settings.Gesture.suppressionKey;
      distanceSensitivity = Settings.Gesture.distanceSensitivity;
      distanceThreshold = Settings.Gesture.distanceThreshold;
      timeoutActive = Settings.Gesture.Timeout.active;
      timeoutDuration = Settings.Gesture.Timeout.duration;
    };

    //-->Add the event listeners
    modul.enable = function enable() {
      if (inIframe()) {
        window.addEventListener('mousedown', handleFrameMousedown, true);
        window.addEventListener('mousemove', handleFrameMousemove, true);
        window.addEventListener('mouseup', handleFrameMouseup, true);
        window.addEventListener('dragstart', handleDragstart, true);
      } else {
        // chrome.runtime.onMessage.addListener(handleMessage);
        window.addEventListener('mousedown', handleMousedown, true);
      }
    };

    //-->Remove the event listeners and resets the handler
    modul.disable = function disable() {
      if (inIframe()) {
        window.removeEventListener('mousedown', handleFrameMousedown, true);
        window.removeEventListener('mousemove', handleFrameMousemove, true);
        window.removeEventListener('mouseup', handleFrameMouseup, true);
        window.removeEventListener('dragstart', handleDragstart, true);
      } else {
        // chrome.runtime.onMessage.removeListener(handleMessage);
        window.removeEventListener('mousedown', handleMousedown, true);
        window.removeEventListener('mousemove', handleMousemove, true);
        window.removeEventListener('mouseup', handleMouseup, true);
        window.removeEventListener('contextmenu', handleContextmenu, true);
        window.removeEventListener('mouseout', handleMouseout, true);
        window.removeEventListener('dragstart', handleDragstart, true);
        // reset gesture array, internal state and target data
        directions = [];
        state = "passive";
        targetData = {};
      }
    };

    // private variables and methods

    // setting properties
    let mouseButton = 2,
      dragButton = 1,//MP
      suppressionKey = "",
      distanceThreshold = 10,
      distanceSensitivity = 10,
      timeoutActive = false,
      timeoutDuration = 1;

    // contains all gesture direction letters
    let directions = [];

    // internal state: passive, pending, active
    let state = "passive";

    // holds reference point to current point
    let referencePoint = {
      x: 0,
      y: 0
    };

    // contains the timeout identifier
    let timeout = null;

    // contains relevant data of the target element
    let targetData = {};

    // holds all event callbacks added by on()
    let events = {
      'start': [],
      'update': [],
      'change': [],
      'abort': [],
      'end': []
    };

    //-->initializes the gesture to the "pending" state, where it's unclear if the user is starting a gesture or not
    //-->requires the current x and y coordinates
    function init(x, y) {
      // set the initial point
      referencePoint.x = x;
      referencePoint.y = y;

      // change internal state
      state = "pending";

      // add gesture detection listeners
      window.addEventListener('mousemove', handleMousemove, true);
      window.addEventListener('dragstart', handleDragstart, true);
      window.addEventListener('drag', handleDrag, true);//MP
      window.addEventListener('dragend', handleDragend, true);//MP
      window.addEventListener('contextmenu', handleContextmenu, true);
      window.addEventListener('mouseup', handleMouseup, true);
      window.addEventListener('mouseout', handleMouseout, true);
    }

    //-->Indicates the gesture start and should only be called once untill gesture end
    function start() {
      // dispatch all binded functions with the current x and y coordinates as parameter on start
      events['start'].forEach((callback) => callback(referencePoint.x, referencePoint.y));

      // change internal state
      state = "active";
    }

    //-->Indicates the gesture change and should be called every time the cursor position changes
    //-->requires the current x and y coordinates
    function update(x, y, dragMark) {
      // dispatch all binded functions with the current x and y coordinates as parameter on update
      events['update'].forEach((callback) => callback(x, y));

      // handle timeout
      if (timeoutActive) {
        // clear previous timeout if existing
        if (timeout) window.clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          // dispatch all binded functions on abort
          events['abort'].forEach((callback) => callback());
          state = "expired";
          // clear directions
          directions = [];
        }, timeoutDuration * 1000);
      }

      let direction = getDirection(referencePoint.x, referencePoint.y, x, y);

      if (directions[directions.length - 1] !== direction) {
        // add new direction to gesture list
        directions.push(direction);

        // send message to background on gesture change
        let message = runtime.sendMessage({
          // subject: "gestureChange",
          subject: dragMark ? "dragChange" : "gestureChange",//MP
          data: Object.assign(//MP
            targetData, {
            gesture: directions.join("")
          })
        });
        // on response (also fires on no response) dispatch all binded functions with the directions array and the action as parameter
        message.then((response) => {
          let action = response ? response.action : null;
          events['change'].forEach((callback) => callback(directions, action));
        });
      }

      // set new reference point
      referencePoint.x = x;
      referencePoint.y = y;
    }

    //-->Indicates the gesture end and should be called to terminate the gesture
    function end(dragMark) {
      // dispatch all binded functions on end
      events['end'].forEach((callback) => callback(directions));

      // send directions and target data to background if directions is not empty
      if (directions.length) runtime.sendMessage({
        // subject: "gestureEnd",
        subject: dragMark ? "dragEnd" : "gestureEnd",
        data: Object.assign(
          targetData, {
            gesture: directions.join("")
          }
        )
      });

      // reset gesture handler
      reset();
    }

    //-->Resets the handler to its initial state
    function reset() {
      // remove gesture detection listeners
      window.removeEventListener('mousemove', handleMousemove, true);
      window.removeEventListener('mouseup', handleMouseup, true);
      window.removeEventListener('contextmenu', handleContextmenu, true);
      window.removeEventListener('mouseout', handleMouseout, true);
      window.removeEventListener('dragstart', handleDragstart, true);
      window.removeEventListener('drag', handleDrag, true);//MP
      window.removeEventListener('dragend', handleDragend, true);//MP

      // reset gesture array, internal state and target data
      directions = [];
      state = "passive";
      targetData = {};

      if (timeout) {
        window.clearTimeout(timeout);
        timeout = null;
      }
    }

    //-->Handles iframe/background messages which will update the gesture
    function handleMessage(message, sender, sendResponse) {

      switch (message.subject) {
        case "gestureFrameMousedown":
          // init gesture
          init(
            Math.round(message.data.screenX / window.devicePixelRatio - window.mozInnerScreenX),
            Math.round(message.data.screenY / window.devicePixelRatio - window.mozInnerScreenY)
          );
          // save target data
          targetData = message.data;
          break;

        case "gestureFrameMousemove":
          // calculate distance between the current point and the reference point
          let distance = getDistance(referencePoint.x, referencePoint.y,
            Math.round(message.data.screenX / window.devicePixelRatio - window.mozInnerScreenX),
            Math.round(message.data.screenY / window.devicePixelRatio - window.mozInnerScreenY)
          );
          // induce gesture
          if (state === "pending" && distance > distanceThreshold)
            start();
          // update gesture && mousebutton fix: right click on frames is sometimes captured by both event listeners which leads to problems
          else if (state === "active" && distance > distanceSensitivity && mouseButton !== 2) update(
            Math.round(message.data.screenX / window.devicePixelRatio - window.mozInnerScreenX),
            Math.round(message.data.screenY / window.devicePixelRatio - window.mozInnerScreenY)
          );
          break;

        case "gestureFrameMouseup":
          if (state === "active" || state === "expired") end();
          else if (state === "pending") reset();
          break;
      }
    }

    //-->Handles mousedown which will add the mousemove listener
    function handleMousedown(event) {
      // on mouse button and no supression key
      if (event.isTrusted && (event.buttons === mouseButton || event.buttons === dragButton) && (!suppressionKey || (suppressionKey in event && !event[suppressionKey]))) {//MP
        // init gesture
        init(event.clientX, event.clientY);

        // save target to global variable if exisiting
        if (typeof TARGET !== 'undefined') TARGET = event.target;

        // get and save target data
        targetData = getTargetData(event.target);

        // prevent and middle click scroll
        if (mouseButton === 4) event.preventDefault();
      }
    }

    //-->Handles mousemove which will either start the gesture or update it
    function handleMousemove(event) {
      if (event.isTrusted && event.buttons === mouseButton) {
        // calculate distance between the current point and the reference point
        let distance = getDistance(referencePoint.x, referencePoint.y, event.clientX, event.clientY);

        // induce gesture
        if (state === "pending" && distance > distanceThreshold)
          start();

        // update gesture
        else if (state === "active" && distance > distanceSensitivity)
          update(event.clientX, event.clientY);

        // prevent text selection
        if (mouseButton === 1) window.getSelection().removeAllRanges();
      }
    }

    //-->Handles context menu popup and removes all added listeners
    function handleContextmenu(event) {
      if (event.isTrusted && mouseButton === 2) {
        if (state === "active" || state === "expired") {
          // prevent context menu
          event.preventDefault();
          end();
        }
        // reset if state is pending
        else if (state === "pending")
          reset();
      }
    }

    //-->Handles mouseup and removes all added listeners
    function handleMouseup(event) {
      // only call on left and middle mouse click to terminate gesture
      if (event.isTrusted && ((event.button === 0 && mouseButton === 1) || (event.button === 1 && mouseButton === 4))) {
        if (state === "active" || state === "expired")
          end();
        // reset if state is pending
        else if (state === "pending")
          reset();
      }
    }

    //-->Handles mouse out and removes all added listeners
    function handleMouseout(event) {
      // only call if cursor left the browser window
      if (event.isTrusted && event.relatedTarget === null) {
        if (state === "active" || state === "expired")
          end();
        // reset if state is pending
        else if (state === "pending")
          reset();
      }
    }

    //-->Handles dragstart and prevents it if needed
    function handleDragstart(event) {
      // prevent drag if mouse button and no supression key is pressed
      if (event.isTrusted && event.buttons === mouseButton && (!suppressionKey || (suppressionKey in event && !event[suppressionKey])))
        event.preventDefault();
    }

    //-->Handles drag  MP
    function handleDrag(event) {
      // prevent drag if mouse button and no supression key is pressed
      if (event.isTrusted && event.buttons === dragButton && (!suppressionKey || (suppressionKey in event && !event[suppressionKey]))){
        let distance = getDistance(referencePoint.x, referencePoint.y, event.clientX, event.clientY);

        // induce gesture
        if (state === "pending" && distance > distanceThreshold)
          start();

        // update gesture
        else if (state === "active" && distance > distanceSensitivity)
          update(event.clientX, event.clientY, 'dragMark');
      }
    }

    //-->Handles dragsend MP
    function handleDragend(event) {
      if (event.isTrusted && ((event.button === 0 && mouseButton === 1) || (event.button === 1 && mouseButton === 4) || event.button === 0 && dragButton === 1)) {//MP
      // if (event.isTrusted && ((event.button === 0 && gestureHandler.mouseButton === 1) || (event.button === 1 && gestureHandler.mouseButton === 4))) {
        if (state === "active" || state === "expired")
          end("dragMark");
        // reset if state is pending
        else if (state === "pending")
          reset();
      }
    }

    //-->Handles mousedown for frames; send message with target data and position
    function handleFrameMousedown(event) {
      // on mouse button and no supression key
      if (event.isTrusted && event.buttons === mouseButton && (!suppressionKey || (suppressionKey in event && !event[suppressionKey]))) {
        runtime.sendMessage({
          subject: "gestureFrameMousedown",
          data: Object.assign(
            getTargetData(event.target), {
              screenX: event.screenX,
              screenY: event.screenY,
            }
          )
        });
        // save target to global variable if exisiting
        if (typeof TARGET !== 'undefined') TARGET = event.target;
        // prevent middle click scroll
        if (mouseButton === 4) event.preventDefault();
      }
    }

    //-->Handles mousemove for frames; send message with position
    function handleFrameMousemove(event) {
      // on mouse button and no supression key
      if (event.isTrusted && event.buttons === mouseButton && (!suppressionKey || (suppressionKey in event && !event[suppressionKey]))) {
        runtime.sendMessage({
          subject: "gestureFrameMousemove",
          data: {
            screenX: event.screenX,
            screenY: event.screenY
          }
        });
        // prevent text selection
        if (mouseButton === 1) window.getSelection().removeAllRanges();
      }
    }

    //--> Handles mouseup for frames
    function handleFrameMouseup(event) {
      // only call on left, right and middle mouse click to terminate or reset gesture
      if (event.isTrusted && ((event.button === 0 && mouseButton === 1) || (event.button === 1 && mouseButton === 4) || (event.button === 2 && mouseButton === 2)))
        runtime.sendMessage({
          subject: "gestureFrameMouseup",
          data: {}
        });
    }

    // due to modul pattern: http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html
    return modul;
  })();

//========⑤Setting===================
  const Ui = (function(){
    let modul = {};
    modul.init = function (){
      addStyle(CSS, 'MPmanageStyle');

      let node = document.createElement('div');
      node.id = 'MPsetting';
      node.innerHTML = menuHTML;
      document.body.appendChild(node);

      //#mg1
      q('#mg1')[0].innerHTML = gestureAndDragHTML;
      //#mg2
      q('#mg2')[0].innerHTML = makeFunsList();
      each(['gesture', 'text', 'link', 'image'],(item)=>{
        q('#mg2')[0].innerHTML += makeDefinedFunsList(item);
      });
      //#mg3
      q('#mg3')[0].innerHTML = aboutHTML;

      //addEventListener
      listen(q('#MPsetting')[0], 'click', click);
      each(q('#mg1 input[type=text], #mg2 span[name="alias"]'),item=>{
        listen(item, 'blur', updateConfigUi);
      });
      each(q('#MPsetting select, #MPsetting input[type=checkbox]'),item=>{
        listen(item, 'change', updateConfigUi);
      });
      //show functions,hide others
      q('li[name=mg2]')[0].click();
    };

    modul.captureGesture = function(gestureStr, operation){
      try {
        if(operation === "recorddingGesture"){
          q('#recorddingGesture')[0].textContent = gestureStr;
          return;
        }
        if(operation !== "cancelGesture") q('[data-flag=captureGesture]')[0].value = gestureStr;
        document.body.removeChild(q('#MPMask')[0]);
        runtime.captureGesture = false;
        attr(q('#MPsetting')[0], "style", " ");
        let tmp = q('[data-flag=captureGesture]')[0];
        attr(tmp, "data-flag", " ");
        updateFns(tmp.parentElement);
      } catch(e) {
        // console.log(e);
      }
    };

    let
      fnLocal = {
        arg: {
          userDefine:{
            description:{zh:['自定义功能代码'], en:['User Define Function Code']},
            arg:['textarea']
          },
          searchText:{
            description:{zh:['搜索引擎', '后台打开', '右边插入'], en:['SearchingEnging', 'Load In Background', 'Insert After Current Tab']},
            arg:['select:searchEnging', 'checkbox', 'checkbox']
          },
          searchImg:{
            description:{zh:['图片搜索引擎', '后台打开', '右边插入'], en:['Image SearchingEnging', 'Load In Background', 'Insert After Current Tab']},
            arg:['select:imgSearchEnging', 'checkbox', 'checkbox']
          },
          fkVip:{
            description:{zh:['视频解析接口'], en:['Videos Parser API']},
            arg:['select:vipAPI']
          }
        },
        FunsListTitle: {
          gesture: {zh:'手势',     en:'Gesture'},
          text:    {zh:'拖拽文本', en:'Drag Text'},
          link:    {zh:'拖拽链接', en:'Drag Link'},
          image:   {zh:'拖拽图片', en:'Drag Image'}
        },
        addFunction: {zh:'增加一个功能', en:'Add Function'}
      },
      CSS = `
        #MPsetting{z-index:999997!important;background:white!important;width:100%!important;height:100%!important;color:#032E58!important;font-family:"微软雅黑"!important;position:fixed!important;top:0!important;left:0!important;}
        #MPmenu *,
        .MPcontent *{border-radius:3px!important;font-size:16px!important;}
        #MPlogo svg{background:white!important;box-shadow:inset 0 0 25px 15px #A2B7D2!important;width:80px!important;height:100px!important;margin:0!important;padding:0!important;}
        #MPmenu{z-index:999999!important;height:100%!important;width:100px!important;background:#A2B7D2!important;color:white!important;text-align:center!important;}
        #MPmenu li{list-style-type:none!important;border-top:1px dashed white!important;margin:10px 15px!important;cursor:pointer;}
        .MPselected,#MPmenu li:hover{background:white!important;color:#A2B7D2!important;}
        #MPmenu li span{display:block!important;width:40px!important;height:40px!important;font-size:35px!important;font-weight:bold!important;padding:0 15px!important;}
        #MPmenu b{display:block!important;width:70px!important;text-align:center!important;margin-top:10px!important;}
        .MPcontent{height:94%!important;width:100%!important;overflow-y:scroll!important;position:absolute!important;left:100px!important;top:0!important;z-index:999998!important;padding:20px!important;}
        .MPcontent h1{display:block!important;width:800px!important;font-size:20px!important;float:left!important;top:0!important;left:90px!important;padding:3px 10px!important;margin:0 5px!important;border-left:5px solid #A2B7D2!important;background:#A2B7D259!important;}
        .MPcontent > li{list-style-type:none!important;width:800px!important;height:auto!important;padding:10px 5px 0px 5px!important;margin:5px 20px!important;float:left!important;border-bottom:1px dashed #00000020!important;}
        .MPcontent > li:hover{box-shadow:inset 1px 1px 1px 3px #A2B7D240!important;}
        #mg1 >li span:nth-child(2),#mg2>li>input{max-height:28px!important;float:right!important;}
        #mg1 input[type="text"],#mg1 select,#mg2 input[readonly="readonly"]{width:250px!important;height:26px!important;margin:0 10px!important;text-align:center!important;border:0!important;background:#0000000C!important;font-size:20px!important;}
        .MPcontent input[type="checkbox"]{width:0!important;}
        #FunsList{width:800px!important;border:0!important;overflow:hidden!important;}
        .FunsListHide{height: 34px!important;border: 0!important;margin: 0!important;padding: 0!important;}
        .FunsListShow{height:auto!important;}
        #FunsList>li{display:inline-block!important;width:300px!important;height:30px!important;margin:5px!important;text-align:left!important;}
        span.tag:before{color:white!important;background:#555555!important;margin:0!important;border:0!important;padding:3px!important;border-radius:4px 0 0 4px!important;font-size:14px!important;white-space:nowrap!important;font-weight:bold!important;}
        span.tag{color:white!important;margin:0!important;border:0!important;padding:1px 7px 3px 0!important;border-radius:4px!important;}

        #mg2 b{margin-left:30px;padding:0 20px;background:#0000000C!important;}
        #mg2 div.fnArgument{display:none;padding-top:20px!important;height:auto;}
        #mg2 div.fnArgument textarea{width:100%;height:200px;}
        #mg2 div.fnArgument span{width:auto;height:auto;}
        #mg2 .yellow{background:#FFB400!important;}
        #mg2 .yellow:before{content:"${fnLocal.FunsListTitle.gesture[cfg.language]}";}
        #mg2 .blue:before{content:"${fnLocal.FunsListTitle.link[cfg.language]}";}
        #mg2 .blue{background:#1182C2!important;}
        #mg2 .green:before{content:"${fnLocal.FunsListTitle.text[cfg.language]}";}
        #mg2 .green{background:#4DC71F!important;}
        #mg2 .darkcyan:before{content:"${fnLocal.FunsListTitle.image[cfg.language]}";}
        #mg2 .darkcyan{background:#B10DC9!important;}
        #mg2 > li[data-type=gesture]>span:first-child{background:#FFB40030!important;color:#FFB400!important;}
        #mg2 > li[data-type=text]>span:first-child{background:#4DC71F30!important;color:#4DC71F!important;}
        #mg2 > li[data-type=link]>span:first-child{background:#1182C230!important;color:#1182C2!important;}
        #mg2 > li[data-type=image]>span:first-child{background:#B10DC930!important;color:#B10DC9!important;}
        #mg1 > li span:first-child,#mg2>li>span:first-child{text-align:left!important;font-size:16px!important;font-weight:bold!important;padding:2px 6px!important;width:auto!important;height:24px!important;float:left!important;border-left:5px solid!important;margin-right:20px!important;}
        #mg2>li>span{margin-bottom:10px!important;}
        #mg2>li>input {font-family: MParrow;}

        #mg2 div input[type=text],#mg2 div select{background:#0000000c;padding:5px;margin:10px 5px;border: 0;}
        #mg2 div input{width:80%;}
        #mg2 div select{width:15%;}
        #mg2 div label{margin:3px 0;}


        #mg3 *{height: auto;font-size: 30px!important;text-decoration: none;font-weight: bolder;padding: 20px; color:#3A3B74!important}

        /*label 作为开关*/
        label.switchOn{background:#3A3B7420!important;display:inline-block!important;color:#3A3B74!important;font-weight:bolder!important;min-width:40px!important;height:24px!important;padding:2px 5px!important;border-left:15px solid #3A3B74!important;border-radius:5px!important;}
        label.switchOff{background:#33333370!important;display:inline-block!important;color:#333333a0!important;text-decoration:line-through!important;min-width:40px!important;height:24px!important;padding:2px 5px!important;border-right:15px solid #333333!important;border-radius:5px!important;}
        input[type=checkbox].switch{width:0px!important;}

        #MPMask{z-index:9999999;position:fixed;top:0;left:0;}
        #recorddingGesture{position: fixed;width: 100%;top: 100%;margin-top: -50%;text-align: center;color: white;font-size: 40px;font-family: MParrow;word-wrap:break-word;}
      `,
      uiLocal = {
        //gesture
        gestureUi: {zh:'手势配置', en:'Gesture Config'},
        mouseButton: {zh:'手势按键', en:'Gesture mouse button'},
        leftButton: {zh:'左键', en:'Left Key'},
        middleButton: {zh:'中键', en:'MIddle Key'},
        rightButton: {zh:'右键', en:'Right Key'},
        mouseButtonTitle: {zh:'触发鼠标手势的按键', en:'The mouse button which will trigger the gesture.'},

        suppressionKey: {zh:'手势禁用键', en:'Gesture suppression key'},
        suppressionKeyTitle: {zh:'按下禁用键,暂时禁用手势', en:'Disables the mouse gesture if the key is pressed.'},
        distanceThreshold: {zh:'手势距离阈值', en:'Gesture distance threshold'},
        distanceThresholdTitle: {zh:'激活鼠标手势的最短距离', en:'The minimum mouse distance until the Gesture gets activated.'},
        distanceSensitivity: {zh:'手势灵敏度', en:'Gesture sensitivity'},
        distanceSensitivityTitle: {zh:'认定为新方向的最短距离。这也影响轨迹平滑度', en:'The minimum mouse distance until a new direction gets recognized. This will also impact the trace smoothness.'},
        timeout: {zh:'手势超时', en:'Gesture timeout'},
        timeoutTitle: {zh:'鼠标不动指定时间后，取消手势', en:'Cancels the gesture after the mouse has not been moved for the specified time.'},
        directions: {zh:'手势方向数', en:'Gesture directions'},
        directionsTitle: {zh:'手势识别的方向个数', en:'Gesture diffrent directions.'},
        language: {zh:'语言', en:'Language'},
        languageTitle: {zh:'设定使用语言', en:'Set the language for using.'},
        //hint
        hintUi: {zh:'提示配置', en:'Hint Config'},
        background: {zh:'提示背景颜色', en:'Hint background'},
        backgroundTitle: {zh:'提示的文字的背景颜色', en:'Hint text background color'},
        fontSize: {zh:'提示字体', en:'Hint font size'},
        fontSizeTitle: {zh:'提示文字的字体大小,单位:"&quot;px"&quot;', en:'Hint text font size,unit:"&quot;px"&quot;'},
        lineColor: {zh:'轨迹颜色', en:'Track line color'},
        lineColorTitle: {zh:'显示轨迹的颜色,十六进制,可以使3/6/8位', en:'track line color, hex, 3/6/8 bit'},
        minLineWidth: {zh:'最小宽度', en:'Track minimum width'},
        minLineWidthTitle: {zh:'轨迹的最小宽度,单位:&quot;px"&quot;', en:'Track minimum width,unit:&quot;px"&quot;'},
        maxLineWidth: {zh:'最大宽度', en:'Track maximum width'},
        maxLineWidthTitle: {zh:'轨迹的最大宽度,单位:&quot;px"&quot;', en:'Track maximum width,unit:&quot;px&quot;'},
        lineGrowth: {zh:'增长速度', en:'Track growth speed'},
        lineGrowthTitle: {zh:'轨迹的增长速度,单位:&quot;px&quot;', en:'Track growth speed,unit:&quot;px&quot;'},
        funNotDefine: {zh:'未定义提示', en:'Gesture not found hint'},
        funNotDefineTitle: {zh:'手势或者功能未定义时的提示信息', en:'If gesture not found, hint this'},
        //drag
        dragSetting: {zh:'拖拽配置', en:'Drag Config'},
        linktextAslink: {zh:'链接优先', en:'Link priority'},
        linktextAslinkTitle: {zh:'链接文字识别为链接', en:'Text link drag as link'},
        dragInTextarea: {zh:'文本框拖拽', en:'Enable drag in textarea'},
        dragInTextareaTitle: {zh:'文本框中选中文字并且拖拽时候,使用拖拽的功能', en:'Enable drag in textarea or input'}
      },

      menuHTML = `
        <div id="MPmenu">
          <span id="MPlogo">
            <svg width="80px" height="100px" viewbox="0 0 200 200">
            <path d="M135 13 l13 13h-7v20h20v-7l13 13l-13 13v-7h-20v20h7l-13 13 l-13 -13h7v-20h-20v7l-13-13l13-13v7h20v-20h-7z" style="fill:#0074d9;stroke:none;"></path>
            <path d="M0 190L20 10c3,-8 8,-4 10,0L100 130L160 80c8,-8 17,-8 20,0L200 180c-2 20 -24 20 -30 0L160 120L110 163c-6 6 -19 10 -25 0L30 40L10 195c-3 5 -8 5 -10 0z" style="stroke:none;fill:#0074d9;"></path>
            </svg>
          </span>
          <li name="mg1">   <span>◧</span>  <b>Config</b>  </li>
          <li name="mg2">   <span>↯</span>   <b>Gesture</b> </li>
          <li name="mg3">   <span>❓</span>  <b>About</b>   </li>
          <li name="close"> <span>🗙</span>  <b>Close</b>   </li>
        </div>
        <div id="mg1" class="MPcontent">mg1</div>
        <div id="mg2" class="MPcontent">mg2</div>
        <div id="mg3" class="MPcontent">mg3</div>
      `,
      gestureAndDragHTML =
//======gestureAndDragHTML======
  `
  <h1>${uiLocal.gestureUi[cfg.language]}</h1>
  <!-- 因为启用了左键作为拖拽,所以按钮选项要禁用
  <li>
    <span title="${uiLocal.mouseButtonTitle[cfg.language]}">${uiLocal.mouseButton[cfg.language]}</span>
    <span>
     <select name="mouseButton">
      <option value="0" ${sel(cfg.Gesture.mouseButton, 0)}>${uiLocal.leftButton[cfg.language]}</option>
      <option value="1" ${sel(cfg.Gesture.mouseButton, 1)}>${uiLocal.middleButton[cfg.language]}</option>
      <option value="2" ${sel(cfg.Gesture.mouseButton, 2)}>${uiLocal.rightButton[cfg.language]}</option>
     </select>
    </span>
  </li>
  -->
  <li>
    <span title="${uiLocal.suppressionKeyTitle[cfg.language]}">${uiLocal.suppressionKey[cfg.language]}</span>
    <span>
     <select name="suppressionKey">
      <option value="" ${sel(cfg.Gesture.suppressionKey, '')}>&nbsp;</option>
      <option value="altKey" ${sel(cfg.Gesture.suppressionKey, 'altKey')}>Alt</option>
      <option value="ctrlKey" ${sel(cfg.Gesture.suppressionKey, 'ctrlKey')}>Ctrl</option>
      <option value="shiftKey" ${sel(cfg.Gesture.suppressionKey, 'shiftKey')}>Shift</option>
     </select>
     </span>
  </li>
  <li>
    <span title="${uiLocal.distanceThresholdTitle[cfg.language]}">${uiLocal.distanceThreshold[cfg.language]}</span>
    <span>
      <input type="text" name="distanceThreshold" value="${cfg.Gesture.distanceThreshold}" data-mark="number">
      </span>
    </li>
  <li>
    <span title="${uiLocal.distanceSensitivityTitle[cfg.language]}">${uiLocal.distanceSensitivity[cfg.language]}</span>
    <span>
      <input type="text" name="distanceSensitivity" value="${cfg.Gesture.distanceSensitivity}"  data-mark="number">
    </span>
  </li>
  <li>
    <span title="${uiLocal.timeoutTitle[cfg.language]}">${uiLocal.timeout[cfg.language]}</span>
    <span>
      <input type="text" name="timeout" value="${cfg.Gesture.Timeout.duration}" data-mark="number">
    </span>
  </li>
  <li>
    <span title="${uiLocal.directionsTitle[cfg.language]}">${uiLocal.directions[cfg.language]}</span>
    <span>
      <select name="directions">
       <option value="4" ${sel(cfg.directions, 4)}> 4 </option>
       <option value="8" ${sel(cfg.directions, 8)}> 8 </option>
      </select>
    </span>
  </li>
  <li>
    <span title="${uiLocal.languageTitle[cfg.language]}">${uiLocal.language[cfg.language]}</span>
    <span>
     <select name="language">
      <option value="zh" ${sel(cfg.language, 'zh')}>中文</option>
      <option value="en" ${sel(cfg.language, 'en')}>English</option>
     </select>
    </span>
  </li>
  <h1>${uiLocal.hintUi[cfg.language]}</h1>
  <li>
    <span title="${uiLocal.backgroundTitle[cfg.language]}">${uiLocal.background[cfg.language]}</span>
    <span>
      <input type="text" name="background" value="${cfg.Hinter.background}" style="background:#${cfg.Hinter.background} !important;">
    </span>
  </li>
  <li>
    <span title="${uiLocal.fontSizeTitle[cfg.language]}">${uiLocal.fontSize[cfg.language]}</span>
    <span>
      <input type="text" name="fontSize" value="${cfg.Hinter.fontSize}" data-mark="number">
    </span>
  </li>
  <li>
    <span title="${uiLocal.lineColorTitle[cfg.language]}">${uiLocal.lineColor[cfg.language]}</span>
    <span>
      <input type="text" name="lineColor" value="${cfg.Hinter.lineColor}" style="background:#${cfg.Hinter.lineColor} !important;">
    </span>
  </li>
  <li>
    <span title="${uiLocal.minLineWidthTitle[cfg.language]}">${uiLocal.minLineWidth[cfg.language]}</span>
    <span>
      <input type="text" name="minLineWidth" value="${cfg.Hinter.minLineWidth}">
    </span>
  </li>
  <li>
    <span title="${uiLocal.maxLineWidthTitle[cfg.language]}">${uiLocal.maxLineWidth[cfg.language]}</span>
    <span>
      <input type="text" name="maxLineWidth" value="${cfg.Hinter.maxLineWidth}">
    </span>
  </li>
  <li>
    <span title="${uiLocal.lineGrowthTitle[cfg.language]}">${uiLocal.lineGrowth[cfg.language]}</span>
    <span>
      <input type="text" name="lineGrowth" value="${cfg.Hinter.lineGrowth}">
    </span>
  </li>
  <li>
    <span title="${uiLocal.funNotDefineTitle[cfg.language]}">${uiLocal.funNotDefine[cfg.language]}</span>
    <span>
      <input type="text" name="funNotDefine" value="${cfg.Hinter.funNotDefine}">
    </span>
  </li>

  <h1>${uiLocal.dragSetting[cfg.language]}</h1>
  <li>
    <span title="${uiLocal.linktextAslinkTitle[cfg.language]}">${uiLocal.linktextAslink[cfg.language]}</span>
    <span>
      <input type="checkbox" id="linktextAslink" name="linktextAslink" checked="" class="switch">
      <label for="linktextAslink" class="switchOn"></label>
    </span>
  </li>
  <!--  使用抑制键代替
  <li>
    <span title="${uiLocal.dragInTextareaTitle[cfg.language]}">${uiLocal.dragInTextarea[cfg.language]}</span>
    <span>
      <input type="checkbox" id="dragInTextarea" name="dragInTextarea" checked="" class="switch">
      <label for="dragInTextarea" class="switchOn"></label>
    </span>
  </li>
  -->
      `,

//=======gestureAndDragHTML End=========
      aboutHTML = `
        <pre style="font-size:1.2em !important;">
        About userDefine function:
        there are one argument(Object:mpData) provided in userDefine function.
        mpData is a object like this:
        {
          gesture:"646",         //gesture code of last mouse gesure
          link:{                 //optional, the target is link/image link...
            href: "https://www.baidu.com/",
            title: null, textContent: ""
          }
          target:{
            src: "https://www.baidu.com/img/baidu_jgylogo3.gif",   //target element arrtibute: src
            title: "到百度首页",  //target element arrtibute: title
            alt: "到百度首页",    //target element arrtibute: alt
            textContent: "",      //target element's text content
            nodeName: "IMG",      //target element's node name
            self:{}               //target element itself
          }
          textSelection:""
        }
        So, code in textarea shuold be <em>function body.</em>
        And, you can add some not frequently used function as "userDefine" function to MP™
        </pre>
        <a href="https://github.com/woolition/greasyforks/blob/master/mouseGesture/HY-MouseGesture.md" >(●￣(ｴ)￣●)づ <br>Click Me to More(点我看更多介绍)! </a>
        `,
      options = {
        imgSearchEnging: {    // image searching
          BaiduImage:  "https://image.baidu.com/n/pc_search?queryImageUrl=U-R-L&uptype=urlsearch",
          GoogleImage: "https://www.google.com/searchbyimage?image_url=U-R-L",
          TinEye:      "http://www.tineye.com/search?url=U-R-L"
        },
        searchEnging: {       // text searching
          google:  "http://www.google.com/search?q=",
          baidu:   "http://www.baidu.com/s?wd=",
          yandex:  "http://www.yandex.com/yandsearch?text=",
          Bing:    "http://www.bing.com/search?q=",
          yahoo:   "http://search.yahoo.com/search?p=",
          wiki:    "http://en.wikipedia.org/w/index.php?search=",
          taobao:  "http://s.taobao.com/search?q=",
          amazon:  "http://www.amazon.com/s/&field-keywords=",
          sogou:   "https://www.sogou.com/web?query=",
          s360:    "http://www.haosou.com/s?q="
        },
        vipAPI:{
          疯狂:    "http://goudidiao.com/?url=",
          噗噗:    "http://pupudy.com/play?make=url&id="
        }
      };


    function q(cssSelector){
      return document.querySelectorAll(cssSelector);
    }
    function attr(element,attributeName, attributeValue){
      try {
        if(attributeValue) element.setAttribute(attributeName, attributeValue);
        else return element.getAttribute(attributeName);
      } catch(e) {}
    }
    function each(elementCollect,func){
      try{
        Array.prototype.forEach.call(elementCollect, (item)=>{func(item);});
      }catch(e){}
    }
    function listen(element, eventType, func){
      element.addEventListener(eventType, func, false);
    }
    function sel(val1, val2){
      return val1 == val2 ? 'selected="selected"' : '';
    }
    function click(evt){
      function getName(evt){
        if(evt.target.getAttribute('name')){
          return evt.target.getAttribute('name');
        }else {
          if(evt.target.parentElement.getAttribute('name'))
            return evt.target.parentElement.getAttribute('name');
          else
            return evt.target.parentElement.parentElement.getAttribute('name');
        }
      }
      let named = getName(evt);
      switch (named) {
        case 'mg1':
        case 'mg2':
        case 'mg3':
          each(q('.MPcontent'),(item)=>{
            attr(item, 'style', 'display:none;');
          });
          attr(q('#'+named)[0], 'style', 'display:block;');
          each(q('#MPmenu li'),item=>{
            attr(item, 'class', ' ');
          });
          attr(q('[name='+named+']')[0], 'class', 'MPselected');
          break;
        case 'close':
          q('body')[0].removeChild(q('#MPsetting')[0]);
          break;
        case 'addFunction':
          toggleFunsList();
          break;
        case 'addFunctionLi':
          clickToMakeEle();
          break;
        case 'alias':
          attr(evt.target, 'contentEditable', "true");
          break;
        case 'toggleArgument':
          if(evt.target.textContent === "▼"){
            evt.target.textContent = "▲";
            try{attr(evt.target.parentElement.lastChild,"style","display:block;");}
            catch(e){}
          }else {
            evt.target.textContent = "▼";
            try{attr(evt.target.parentElement.lastChild,"style"," ");}
            catch(e){}
          }
          break;
        case 'clearGesture':
        case 'cancelGesture':
          modul.captureGesture("", named);
          break;
        default:
          if(cfg.hasOwnProperty(attr(evt.target, 'data-mark')))
              addMask();
          break;
      }
    }
    function arg2html(argument, type, trk){
      let html ="",
      argu, i,rand, trackTxt, name,
      argValue = [],
      agrDetail = [],
      description,
      selectName;
      if(typeof argument === "object")
        argu = argument;
        else
        argu = JSON.parse(argument);
      trackTxt = trk || '';
      name = argu.name;
      html += `<span>${name}</span><span name="alias">${argu.alias ? argu.alias : local[type][name][cfg.language]}</span><b style="visibility:${argu.arg.length ? "visible" : "hidden"};" name="toggleArgument">▼</b><input type="text" name="${name}" value="${trackTxt}" data-mark="${type}" readonly="readonly"><br/><div class="fnArgument">`;
      if(argu.arg.length > 0){
        argValue = trackTxt ? argu.arg : [];
        agrDetail = fnLocal.arg[name].arg;
        description = fnLocal.arg[name].description[cfg.language];
        for(i in agrDetail){
          rand = Math.floor(Math.random()*1000);
          switch (agrDetail[i].slice(0,5)) {
            case 'texta':
              html += `<span><textarea>${mpUnescape(argValue[i])}</textarea><i></i></span>`;
              break;
            case 'input':
              html += '<span><input type="text"><i></i></span>';
              break;
            case 'check':
              html += `<span><input type="checkbox" id="${name + rand}" value=${argValue[i] || false} ${argValue[i] ? "checked" : ''} class="switch" name="fnCheckbox"><label for="${name + rand}" ${argValue[i] ? 'class="switchOn"' : 'class="switchOff"'}>${description[i]}</label></span>`;
              break;
            case 'selec':
              selectName = agrDetail[i].split(':').pop();
              html += `<span><input type="text" value=${argValue[i] || ''}><select name="fnSelect">`;
              for (let k in options[selectName]){
                html += `<option value=${options[selectName][k]}>${k}</option>`;
              }
              html += '</select></span>';
              break;
            default:
               html = `<span style="visibility:hidden;"></span>`;
              break;
          }
        }
      }
      return html + "</div>";
    }
    function makeFunsList(){
      let color = ['yellow', 'green', 'blue', 'darkcyan'],
      html = '',
        arg = null;
        each(['gesture', 'text', 'link', 'image'], (type)=>{
          each(Object.keys(local[type]), (fnName)=>{
            if(fnLocal.arg.hasOwnProperty(fnName))
              arg = Object.assign({name:fnName},fnLocal.arg[fnName]);
            else
              arg = {name:fnName,arg:[]};
           html += `<li  data-type="${type}" data-arg='${JSON.stringify(arg)}' title="${local[type][fnName][cfg.language]}" name="addFunctionLi">
                      <span class="tag ${color[['gesture', 'text', 'link', 'image'].indexOf(type)]}">
                        <!--<span>${fnLocal.FunsListTitle[type][cfg.language]}</span>-->
                        <!--<span>-->${fnName}<!--</span>-->
                      </span>
                    </li>`;
          });
        });
      html = `<fieldset id="FunsList" class="FunsListHide">
                <h1 name="addFunction">${fnLocal.addFunction[cfg.language]} ➕ </h1><br/>
                ${html}
              </fieldset>`;
      return html;
    }
    function makeDefinedFunsList(type){
      let html ='';
      each(Object.keys(cfg[type]), item=>{
        try {
          html += `<li data-arg='${JSON.stringify(cfg[type][item])}' data-type='${type}'>${arg2html(cfg[type][item], type, item)}`;
        } catch(e) {}
      });
       return html;
    }
    function clickToMakeEle(){
      let tarEle = event.target.tagName === 'LI' ? event.target : (event.target.parentNode.tagName === "LI" ? event.target.parentNode : event.target.parentNode.parentNode);
      let ele = document.createElement('li');
      ele.setAttribute('data-arg', tarEle.dataset.arg);
      ele.setAttribute('data-type', tarEle.dataset.type);
      ele.innerHTML = arg2html(tarEle.dataset.arg, tarEle.dataset.type);
      document.getElementById('mg2').insertBefore(ele, document.querySelector(`#mg2>li`));
      listen(ele.childNodes[2].childNodes[0], 'blur', updateConfigUi);
      //函数列表收缩, 回滚到顶部
      toggleFunsList();
      document.documentElement.scrollTo(0, 0);
    }
    function updateFns(ele){
      // check Conflict
      if(Object.keys(cfg[ele.dataset.type]).indexOf(ele.childNodes[3].value) > -1){
        if(JSON.parse(ele.dataset.arg).name !== cfg[ele.dataset.type][ele.childNodes[3].value].name){
        attr(ele, "style", "background:red!important;");
        alert("Gesture Conflict (手势冲突) !!!");
        return;
        }
      }
      // setting gesture not null
      if(JSON.parse(ele.dataset.arg).name === "setting" && !ele.childNodes[3].value){
        attr(ele, "style", "background:red!important;");
        alert("Setting Gesture Cannot Set Null (设置手势不能为空) !!!");
        return;
      }
      attr(ele, "style", " ");

      let typeObject = {};
      each(q(`#mg2>li[data-type=${ele.dataset.type}]`), element=>updateItem(element));
      function updateItem(item){
        let childrens, trk, argValue=[], name, dataArgObject, alias, argumentNodes;
        trk = item.childNodes[3].value;
        alias = item.childNodes[1].textContent;
        //if mouse track is not empty , update Fns
        if(trk !== ''){
          childrens = item.childNodes[5].childNodes;
          dataArgObject = JSON.parse(item.dataset.arg);
          each(childrens, item=>{
            if(item.firstElementChild.value && item.firstElementChild.value !== "undefined"){
              // console.log(item.firstElementChild.nodeName);
              // console.log('updateItem..');
              if(item.firstElementChild.nodeName === "TEXTAREA")
                argValue.push(mpEscape(item.firstElementChild.value));
              else
                argValue.push(item.firstElementChild.value);
            } else{
              argValue.push(' ');
            }
          });
          typeObject[trk] = {name: dataArgObject.name, arg: argValue, alias:alias};
        }
      }
      // console.log(typeObject);
      cfg[ele.dataset.type] = typeObject;
      storage.set('cfg', cfg);
    }
    function updateConfigUi(e){
      let name = attr(e.target, 'name');
      switch (name) {
        case 'mouseButton':
        case 'suppressionKey':
          cfg.Gesture[name] = e.target.value;
          break;
        case 'distanceThreshold':
        case 'distanceSensitivity':
        case 'timeout':
          cfg.Gesture[name] = parseInt(e.target.value);
          break;
        case 'directions':
        case 'language':
          cfg[name] = e.target.value;
          break;
        case 'background':
        case 'lineColor':
          cfg.Hinter[name] = e.target.value;
          attr(e.target, 'style', `background: #${e.target.value} !important;`);
          break;
        case 'fontSize':
        case 'minLineWidth':
        case 'maxLineWidth':
        case 'lineGrowth':
          cfg.Hinter[name] = parseFloat(parseFloat(e.target.value).toFixed(2));
          break;
        case 'funNotDefine':
          cfg.Hinter[name] = e.target.value;
          break;
        case 'linktextAslink':
        case 'dragInTextarea':
          cfg.Drag[name] = e.target.checked;
          onOff(e, e.target.checked);
          break;
        default:
          if(name === "alias")
            updateFns(e.target.parentElement);
          else if(name === "fnCheckbox" || name==="fnSelect"){
            formChange();
          }
          return;
      }
      storage.set('cfg', cfg);
    }
    function formChange(){
      if(event.target.type === 'checkbox'){
        event.target.value = event.target.checked;
        onOff(event, event.target.checked);
        updateFns(event.target.parentElement.parentElement.parentElement);
      }
      if(event.target.tagName === 'SELECT'){
        event.target.previousElementSibling.value = event.target.value;
        updateFns(event.target.parentElement.parentElement.parentElement);
      }
    }
    function onOff(e, check) {
      if (check) {
        attr(e.target.nextElementSibling, 'class', 'switchOn');
      } else {
        attr(e.target.nextElementSibling, 'class', 'switchOff');
      }
    }
    function addMask(){
      let
        w=window.innerWidth,
        h=window.innerHeight,
        px = 0.1*w,
        string=`
        <svg height="${h}" width="${w}" style="background:#00000080">
        <path  id="record" d="
      M${50},     ${50+px}   v-${px}  h${px}
      M${w-px-50},${50}      h${px}   v${px}
      M${w-50},   ${h-px-50} v${px}   h-${px}
      M${50+px},  ${h-50}    h-${px}  v-${px}"
      style="stroke:#fff;stroke-width:${w/50};fill:none;"></path>
      <text name="clearGesture" x="100" y="${h-100}" style="font-size:${Math.floor(w/20)}px;stroke:none;fill:white;cursor:pointer;">Clear</text>
      <text name="cancelGesture" x="${w-100-w/6}" y="${h-100}" style="font-size:${Math.floor(w/20)}px;stroke:none;fill:white;cursor:pointer;">Cancle</text>
      </svg>`;
      let mask = document.createElement('div');
      mask.id = "MPMask";
      mask.innerHTML = string + '<div id="recorddingGesture"></div>';
      document.body.appendChild(mask);
      each(q('text[name=clearGesture], text[name=cancelGesture]'), item=>listen(item,"click",click));

      attr(q('#MPsetting')[0], "style", "z-index:9999998 !important;");
      attr(event.target, "data-flag", "captureGesture");
      runtime.captureGesture = true;
    }
    function toggleFunsList(){
      let a = q('#FunsList')[0];
      if(attr(a, 'class') === "FunsListHide"){
        attr(a, 'class', 'FunsListShow');
      }else{
        attr(a, 'class', 'FunsListHide');
      }
    }


    return modul;
  })();

//========⑥Run===================

  //this addStyle is better than GM_addStyle,but not working in CSP tabs
  // function addStyle(cssStr,id='MPStyle'){
  //   try {
  //     let node = document.createElement('style');
  //     node.id = id;
  //     node.textContent = cssStr;
  //     document.querySelector(':root').appendChild(node);
  //   } catch(e){}
  // }
  function addStyle(cssStr,id='MPStyle'){
    GM_addStyle(cssStr);
  }
  addStyle(`
    @font-face {
    font-family: 'MParrow';
    src: url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAQdAAoAAAAABPAAAQAAAAAAAAAAAAAAAAAAAAAECAAAABVPUy8yAAABYAAAAEQAAABgUc1dNGNtYXAAAAHEAAAARgAAAGAAcgFDZ2x5ZgAAAiAAAADwAAABNKukdSxoZWFkAAAA9AAAADQAAAA2DKcEFmhoZWEAAAEoAAAAHQAAACQEKQIaaG10eAAAAaQAAAAfAAAAJBGtAZVsb2NhAAACDAAAABQAAAAUATIBfm1heHAAAAFIAAAAFQAAACAACwAKbmFtZQAAAxAAAADnAAABe0DXvWtwb3N0AAAD+AAAABAAAAAgAAMAAXjaY2BkYGAA4gfLE97F89t8ZeBkYgCBq07amiD6mu+MRAaB/3cZXzFuAnI5GMDSAEgbC5142mNgZGBgYgACPSApwCDA+IqBkQEVcAIAGeEBSQAAAHjaY2BkYGDgBEIQzQAlkQAAAjsAFgAAAHjaY2Bm/MY4gYGVgYPRhzGNgYHBHUp/ZZBkaGFgYGJg5WSAAUYGJBCQ5poCpAwZLBkf/H/AoMeEpIaRAcpjAAAVNgmoeNpjYmBgYPzCYAbE3lBagImBQQzM/srgA6IBjAwITgB42i2KywmAQBQD57l+e9gCvAoieLd/7ShmnwZCmDBA4WslaLlMkdyzekdv0LFzSuaNQ9Kj+/ebUfNf0iv2YfA7Mb+pBQmvAAAAAAAAABQAJgA6AEwAXgByAIYAmnjaVY8hT8NAGIa/N0tzLJlgbY4LYmI0zekvTTmBuHomcGT9DXMkpD8Bwd+AhIo1wa8CVYfF4DCgm8wV7m6Gqc+8eZ7nI9AlRejwSCdERvAkYqHEQxljarv6zWIau0sEuv79xAtewy4tjJLpPH2q2rZqvtH3GAc6YiWaswlroQfPKLsaVzYe93ZXu90pneML94ElWRuWS/nhILO7qt2uG/K+M7f5OWxQsBJcLAtc9P04YLHeOu2xL1McJayMAtlx74W34YngW7n25tCe5VLoIp/nuAnxzz4eMwrO/zzDScZGG2xK393V74G7q/8AczlNtXjadY7BasJAEIb/mKgVSumh3ucBoiQetHjpod6K4MlLi7CROSzEBDaB0EfoC/hEvoLv0990G0Rwhtn99p9/hwHwiCMCXCLAsD0v0eP94DnEuNMjjDruY8rOHw/ofqcziEZUnvDhuccfn55D+v/1CC8d9/GFb88DPOO83hjnykbetuoqWxaSTpPkmmWlez1k6mQeyyxJF7HYwtbW5OI0V1OpHzHBGhsYOGaJBrJ7/TlhiS2USgVLtYAg5WoJ854uWLGzZx2QtR7BHDHPGbspFi1b/rGoWQY5347OnGU4UW82mfwCMzM4HQB42mNgZkAGjAxoAAAAjgAFSExQRAEARkMJAAAAUGF3J1oAAAAA) format('woff');
    }
    #MPcanvas{position:fixed;top:0;left:0;z-index:10000000;}
    #MPtips{all:initial!important;position:fixed!important;z-index:9999996!important;top:50%!important;left:50%!important;transform:translate(-50%,-50%)!important;font-family:MParrow,"Arial",sans-serif!important;color:white!important;white-space:nowrap!important;line-height:normal!important;text-shadow:1px 1px 5px rgba(0,0,0,0.8)!important;text-align:center!important;padding:25px 20px 20px 20px!important;border-radius:5px!important;font-weight:bold!important; }
  `);
  //===========update any time=========
  GM_addValueChangeListener('cfg', ()=>{
    GestureHandler.applySettings(cfg);
    Hinter.applySettings(cfg);
  });
  //when close a tab, save it's url, in order to reopen it: reopenTab
  window.addEventListener('unload', function() {
    GM_setValue('latestTab', window.location.href);
  }, false);
  //used in func: closeOtherTabs
  if(!GM_getValue('closeAll','')) GM_setValue('closeAll', Date());
  GM_addValueChangeListener('closeAll',function(name, old_value, new_value, remote){if(remote)window.close();});
  //===========update any time end=========

  GestureHandler.applySettings(cfg);
  Hinter.applySettings(cfg);
  GestureHandler.enable();
  Hinter.enable();


})();
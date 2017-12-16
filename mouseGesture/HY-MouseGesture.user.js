// ==UserScript==
// @name         MouseGesture--HY
// @name:zh-CN     鼠标手势--就是这么拽!
// @namespace      https://greasyfork.org/users/104201
// @description    HY's mouse gesture script,supports ringt-key draw track functions and left-key drag functions.Drag target can be [Text] & [Links] & [Image]  Customizenable → Right click to draw ⇄(left,right) to setting
// @description:zh-CN  鼠标手势脚本,就是这么拽:支持右键轨迹手势和左键拖拽功能.可以拖拽[文本],[链接]和[图片],支持自定义设置:鼠标画➡⬅(右左)路径,进入设置
// @version      1.6
// @include      *
// @noframes
// @run-at       document-end
// @grant        GM_openInTab
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        GM_download
// @grant        GM_addValueChangeListener
// @grant        GM_notification
// @grant        window.close
// @grant        GM_getResourceText
// @grant        GM_xmlhttpRequest
// Thanks to: Peer Zeng's script:  https://greasyfork.org/zh-CN/scripts/4776-my-mouse-gestures [no License] [for right click gesture handle]
// Thanks to: crxMouse Chrome™ Gestures [chrome crxID:jlgkpaicikihijadgifklkbpdajbkhjo] [for: drag processing]
// Thanks to: Robbendebiene's project Gesturefy [https://github.com/Robbendebiene/Gesturefy] [for canvas line style]
// Thanks to: Jim Lin's userscript 有道划词翻译 [https://greasyfork.org/zh-CN/scripts/15844] [License MIT][for 划词翻译]
// ==/UserScript==
/* jshint esversion: 6 */

const MouseGesture = (function() {
  let arrowCss = `@font-face {
    font-family: 'MParrow';
    src: url(data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAQdAAoAAAAABPAAAQAAAAAAAAAAAAAAAAAAAAAECAAAABVPUy8yAAABYAAAAEQAAABgUc1dNGNtYXAAAAHEAAAARgAAAGAAcgFDZ2x5ZgAAAiAAAADwAAABNKukdSxoZWFkAAAA9AAAADQAAAA2DKcEFmhoZWEAAAEoAAAAHQAAACQEKQIaaG10eAAAAaQAAAAfAAAAJBGtAZVsb2NhAAACDAAAABQAAAAUATIBfm1heHAAAAFIAAAAFQAAACAACwAKbmFtZQAAAxAAAADnAAABe0DXvWtwb3N0AAAD+AAAABAAAAAgAAMAAXjaY2BkYGAA4gfLE97F89t8ZeBkYgCBq07amiD6mu+MRAaB/3cZXzFuAnI5GMDSAEgbC5142mNgZGBgYgACPSApwCDA+IqBkQEVcAIAGeEBSQAAAHjaY2BkYGDgBEIQzQAlkQAAAjsAFgAAAHjaY2Bm/MY4gYGVgYPRhzGNgYHBHUp/ZZBkaGFgYGJg5WSAAUYGJBCQ5poCpAwZLBkf/H/AoMeEpIaRAcpjAAAVNgmoeNpjYmBgYPzCYAbE3lBagImBQQzM/srgA6IBjAwITgB42i2KywmAQBQD57l+e9gCvAoieLd/7ShmnwZCmDBA4WslaLlMkdyzekdv0LFzSuaNQ9Kj+/ebUfNf0iv2YfA7Mb+pBQmvAAAAAAAAABQAJgA6AEwAXgByAIYAmnjaVY8hT8NAGIa/N0tzLJlgbY4LYmI0zekvTTmBuHomcGT9DXMkpD8Bwd+AhIo1wa8CVYfF4DCgm8wV7m6Gqc+8eZ7nI9AlRejwSCdERvAkYqHEQxljarv6zWIau0sEuv79xAtewy4tjJLpPH2q2rZqvtH3GAc6YiWaswlroQfPKLsaVzYe93ZXu90pneML94ElWRuWS/nhILO7qt2uG/K+M7f5OWxQsBJcLAtc9P04YLHeOu2xL1McJayMAtlx74W34YngW7n25tCe5VLoIp/nuAnxzz4eMwrO/zzDScZGG2xK393V74G7q/8AczlNtXjadY7BasJAEIb/mKgVSumh3ucBoiQetHjpod6K4MlLi7CROSzEBDaB0EfoC/hEvoLv0990G0Rwhtn99p9/hwHwiCMCXCLAsD0v0eP94DnEuNMjjDruY8rOHw/ofqcziEZUnvDhuccfn55D+v/1CC8d9/GFb88DPOO83hjnykbetuoqWxaSTpPkmmWlez1k6mQeyyxJF7HYwtbW5OI0V1OpHzHBGhsYOGaJBrJ7/TlhiS2USgVLtYAg5WoJ854uWLGzZx2QtR7BHDHPGbspFi1b/rGoWQY5347OnGU4UW82mfwCMzM4HQB42mNgZkAGjAxoAAAAjgAFSExQRAEARkMJAAAAUGF3J1oAAAAA) format('woff');
    }
    #MPcanvas{position:fixed;top:0;left:0;z-index:9999999;}
    #MPtips{all:initial!important;position:fixed!important;z-index:9999998!important;top:50%!important;left:50%!important;transform:translate(-50%,-50%)!important;font-family:MParrow,"Arial",sans-serif!important;color:white!important;white-space:nowrap!important;line-height:normal!important;text-shadow:1px 1px 5px rgba(0,0,0,0.8)!important;text-align:center!important;padding:25px 20px 20px 20px!important;border-radius:5px!important;font-weight:bold!important; }
    `;
  GM_addStyle(arrowCss);
  let dObj = {};// the Object Element being draged
  let x, y, startX, startY, screenX, screenY, canvas, tips, ctx,
  direction = '', track = '';
  //_*:  default cfg values
  let _cfg = {
    t2n:{           // t2n: track <==> function name
      "2":  {name:"toTop",    arg:[]},
      "8":  {name:"toBottom", arg:[]},
      "4":  {name:"back",     arg:[]},
      "6":  {name:"forward",  arg:[]},
      "86": {name:"close",    arg:[]},
      "42": {name:"reopenTab",arg:[]},
      "64": {name:"setting",  arg:[]}
    },
    dt2n: {         //dt2n: dragText <==> function name
      "8":  {name:"copyText", arg:[]},
      "6":  {
              name:"searchText",
              arg:["http://www.baidu.com/s?wd=", true, true]
            }
    },
    dl2n: {         //dl2n: drag link <==> function name
      "6": {name:"openLink",   arg:[]},
      "8": {name:"copyLink",   arg:[]}
    },
    di2n: {         //li2n: drag image <==> function
      "8": {name:"saveImg",    arg:[]},
      "6": {
              name:"searchImg",
              arg:['https://image.baidu.com/n/pc_search?queryImageUrl=%URL&uptype=urlsearch', true, true]
            },
      "2": {name:"copyImgURL", arg:[]},
      "4": {name:"selectImg",  arg:[]}
    },
    directions:        4,              // 4 or 8 directions
    minLineWidth:      1,               //canvas setting
    lineGrowth:        0.6,
    maxLineWidth:      10,
    lineColor:         '00AAA0',

    fontSize:          50,             //tips font size
    tipsBackground:    "00000055",     //div background
    funNotDefine:      "  (◔ ‸◔)？",  //function not define tips

    language:          1,              //language 0:Chinese 1:English
    sensitivity:       10,             // minLength
    translateTo:      'zh-CHS',
    translateTimeout: 5,
    zoom:             2,

    dragType:         "",
    dragtext:         true,
    draginput:        true,
    draglink:         true,
    dragimage:        true,
    imgfirst:         false,
    imgfirstcheck:    true,
    setdragurl:       true
  };
  //function name <==> tips
  let fn = {
    t2n: {
      stopLoading:     ['停止加载',         'StopLoading'],
      reload:          ['刷新',             'Refresh'],
      reloadNoCache:   ['清缓存刷新',       'Refresh Without Cache'],
      close:           ['关闭',             'Close'],
      back:            ['后退',             'Back'],
      forward:         ['前进',             'Forward'],
      toTop:           ['到顶部',           'Scroll to Top'],
      toBottom:        ['到底部',           'Scroll to Bottom'],
      reopenTab:       ['打开最近关闭窗口', 'Reopen Latest Closed Window'],
      setting:         ['设置',             'Settings'],
      URLLevelUp:      ['网址向上一层',     'URL hierarchy up'],
      cloneTab:        ['克隆标签页',       'Duplicate This Tab'],
      openBlankTab:    ['打开空白页',       'Open New Blank Tab'],
      translate:       ['翻译网页',         'Translate This Page'],
      fkVip:           ['破解VIP视频',      'Crack to Watch VIP Video'],
      closeOtherTabs:  ['关闭其他标签',     'Close Other Tabs'],
      translateSelect: ['开启划词翻译',     'Turn on Select And Translate'],
      //开发者功能
      contentEditable: ['元素内容可编辑',   'Element Content Editable']
    },
    dt2n: {
      searchText:      ['搜索选中文本',     'Search Selected Text'],
      copyText:        ['复制选中文本',     'Copy Selected Text']
    },
    dl2n: {
      openLink:        ['打开链接',         'Open Link'],
      copyLink:        ['复制链接',         'Copy Link'],
      copyLinkText:    ['复制链接文字',     'Copy Link Text']
    },
    di2n: {
      saveImg:         ['保存图片',         'Save Image'],
      searchImg:       ['搜索图片',         'Search Image'],
      copyImage:       ['复制图片',         'Copy Image to ClickBoard'],
      copyImgURL:      ['复制图片链接',     'Copy ImageURL'],
      openImgNewTab:   ['新标签打开图片',   'Open Image in New Tab'],
      image2DataURL:   ['复制图片为DataURL','Copy Image as DataURL'],
      selectImg:       ['选中图片',         'Select This Image']
    }
  };
  //function name <==> function declaration  ==> execute it
  let Fn = {
    stopLoading: function() {
      window.stop();
    },
    reload: function(arr) {
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
    },
    toBottom: function() {
      document.documentElement.scrollTo(0, 9999999);
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
      window.open('about:blank');
    },

    //use MicrosoftTranslator to translate the page
    translate: function(arr) {

      if (typeof Microsoft === 'undefined' || typeof Microsoft.Translator === 'undefined') {
        let d = document.createElement('div');
        d.id = "MicrosoftTranslatorWidget";
        d.style.cssText = 'visibility:hidden;';
        d.setAttribute('class', 'Lignt');
        let s = document.createElement('script');
        s.type = 'text/javascript';
        s.charset = 'UTF-8';
        s.src = ((location && location.href && location.href.indexOf('https') == 0) ? 'https://ssl.microsofttranslator.com' : 'http://www.microsofttranslator.com') + '/ajax/v3/WidgetV3.ashx?siteData=ueOIGRSKkd965FeEGM5JtQ**&ctf=False&ui=true&settings=Manual&from=';
        let p = document.getElementsByTagName('head')[0] || document.documentElement;
        p.insertBefore(s, p.firstChild);
        document.body.appendChild(d);
      }
      let onComplete, onProgress, onError;
      onError = function(){
        GM_notification({
          title: 'MouseGesture:',
          text: cfg.language ? "出了问题,无法完成翻译" : "Oops,Something wrong Hapend...",
          timoeout: 2000
        });
        tips.parentNode.removeChild(tips);
      };
      onComplete = function() {
        tips.parentNode.removeChild(tips);
      };
      onProgress = function() {
        document.documentElement.appendChild(tips);
        tips.innerHTML = cfg.language ? "翻译中..." : "Translating...";
      };
      let doTranslate = function() {
        if (typeof Microsoft === 'undefined' || typeof Microsoft.Translator === 'undefined') return;
        clearInterval(loadTranslatorTimer);
        Microsoft.Translator.Widget.Translate('', arr[0], onProgress, onError, onComplete, () => {}, (cfg.translateTimeout) * 1000);
      };
      loadTranslatorTimer = setInterval(doTranslate, 200);
      setTimeout(() => clearTimeout(loadTranslatorTimer), (cfg.translateTimeout) * 1000);
    },
    fkVip: function() {
      GM_openInTab((cfg.vipApi)+location.href, {active:true});
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
    contentEditable: function(){
      console.log('x:'+startX+' y:'+startY);
      document.elementFromPoint(startX, startY).setAttribute('contenteditable', 'true');
      document.elementFromPoint(startX, startY).setAttribute('data-mp', '1');
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

    searchText: function(arr) {
      //get text
      let txt = window.getSelection().toString();
      txt = encodeURIComponent(txt);
      //get search enging
      openURL = arr[0] + txt;
      GM_openInTab(openURL, {
        active: arr[1],
        insert: arr[2],
        setParent: true   //makes the browser re-focus the current tab on close.
      });
    },
    copyText: function() {
      GM_setClipboard(dObj.text, "text");
    },
    openLink: function() {
      //TamperMonkey
      GM_openInTab(dObj.link, {
        active: true
      });
    },
    copyLink: function() {
      GM_setClipboard(dObj.link, "text");
    },
    copyLinkText: function() {
      GM_setClipboard(dObj.text, "text");
    },
    saveImg: function() {
      //TamperMonkey
      let arr = dObj.img.split('/');
      let name = arr[arr.length - 1];
      GM_download(dObj.img, name);
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
    searchImg: function(event,arr) {
      //TamperMonkey
      GM_openInTab(arr[0].replace(/%URL/, dObj.img), {
        active: arr[1],
        insert: arr[2],
        setParent: true   //not working
      });
    },
    selectImg: function() {
      // it may not working on some browsers [develping standard]
      //TamperMonkey
      document.execCommand('selectAll');
      let sel = document.getSelection();
      sel.collapse(dObj.target, 0);
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
    copyImgURL: function() {
      //TamperMonkey
      GM_setClipboard(dObj.img, "text");
    },
    openImgNewTab: function() {
      //TamperMonkey
      GM_openInTab(dObj.img, {
        active: true
      });
    },
    setting: function() {
      if (document.getElementById('HYetting')) {
        return;
      }
      makeSettingUi();
    }
  };
  let flag = {
    actionType:'',
    isDrag:    false,      //if drag ,isDrag = true
    isPress:   false,     //if mouse right key is press,ispress = true
    hascanvas: false,   //if document has <canvas> hascanvas = true
    isZoom:    false       //zoom mode
  };
  //============ supportive functions ==> used by Fn{}'s function
  //check if string is an url
  function isURL(string) {
    try {
      new URL(string);
    } catch (e) {
      return false;
    }
    return true;
  }
  function isObject (item) {
    return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
  }
  /**
   * deep merge two objects into a new one
   * from https://stackoverflow.com/a/37164538/3771196
   **/
  function mergeDeep (target, source) {
    let output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
      if (!(key in target))
        Object.assign(output, { [key]: source[key] });
      else
        output[key] = mergeDeep(target[key], source[key]);
      }
      else Object.assign(output, { [key]: source[key] });
    });
    }
    return output;
  }
  let cfg = mergeDeep(_cfg,GM_getValue('cfg', _cfg));
  //return: {canvas:canvas,type:fileType,mime:mimeType}
  function canvasDrawTheImage(e) {
    // let img = e.target,
    let img = dObj.target,
      fileType = img.src.split('/').pop().split('.').pop().toLowerCase(),
      mimeType = 'image/' + fileType,
      canvas = document.createElement('canvas');
    canvas.width = getNaturalSize(img).width;
    canvas.height = getNaturalSize(img).height;
    canvas.getContext('2d', {
      alpha: true
    }).drawImage(img, 0, 0);
    return {
      canvas: canvas,
      type: fileType,
      mime: mimeType
    };
  }
  // function canvasDrawTheImage(e) {
  //   // let img = e.target,
  //   var img=new Image;
  //   img.onload=function(){
  //     var canvas=document.createElement("canvas");
  //     canvas.width = getNaturalSize(img).width;
  //     canvas.height = getNaturalSize(img).height;
  //     var g=canvas.getContext("2d",{alpha:true});
  //     g.drawImage(img,0,0);
  //     console.log(canvas.toDataURL());
  //   };
  //   img.crossOrigin="anonymous"; //关键
  //   img.src=dObj.img;
  //   return {
  //     canvas: canvas,
  //     type: 'png',
  //     // type: fileType,
  //     mime: 'image/png'
  //     // mime: mimeType
  //   };
  // }
  // get image natural width and height
  function getNaturalSize(ele) {
    let i, w, h;
    if (typeof ele.naturalWidth == 'undefined') { // IE 6/7/8
      i = new Image();
      i.src = ele.src;
      w = i.width;
      h = i.height;
    } else { // HTML5 browsers
      w = ele.naturalWidth;
      h = ele.naturalHeight;
    }
    return {
      width: w,
      height: h
    };
  }
  //============ function for all
  //show Tips
  function showTips(){
    if (cfg[cfg.dragType][track] !== undefined) {
      tips.innerHTML = track + '<br/>' + fn[cfg.dragType][cfg[cfg.dragType][track].name][cfg.language];
    } else {
      tips.innerHTML = track + '<br/>' + (cfg.funNotDefine);
    }
  }
  function drawTrack(e){
    if (flag.hascanvas) {
      ctx.lineWidth = Math.min(cfg.maxLineWidth, ctx.lineWidth += cfg.lineGrowth);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(e.clientX, e.clientY);
      ctx.stroke();
      ctx.closePath();
    }
  }
  function getDirection(cx, cy){
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
    if(cfg.directions === 4){   //4 directions
      if (dx < dy) {
        d = cy > y ? "8" : "2";
      } else {
        d = cx > x ? "6" : "4";
      }
    }else{  //8 directions
      t = (cy-y)/(cx-x);
      if(-0.4142<= t && t < 0.4142) d = cx > x ? '6' : "4";
      else if(2.4142 <= t || t< -2.4142) d = cy > y ? '8' : '2';
      else if(0.4142 <= t && t < 2.4142) d= cx > x ? '9' : '1';
      else d = cy > y ? '7' : '3';
    }
    return d;
  }
  //draw track & show tips
  function tracer(e) {
   // const tracer = function(e) {
    let cx = e.clientX,
      cy = e.clientY;
      dx = Math.abs(cx - x),
      dy = Math.abs(cy - y);
      distance = dx * dx + dy * dy;
    if (distance < cfg.sensitivity * cfg.sensitivity) {
      return;
    }
    //if mouse right key is press and document has no <canvas>,then creaet <canvas> and append it
    //到里面才添加元素是为了避免 鼠标一按下,还没有移动就已经图层了
    //这个图层有两方面作用,①画出轨迹 ②支持拖拽功能, 因为作用②,所以不能移到 drawTrack 函数里面
    if (flag.isPress && !flag.hascanvas) addCanvas(e);
    let direction = getDirection(cx,cy);
    if (track.charAt(track.length - 1) !== direction) {
      track += direction;
      showTips();     //show action tips
    }
    drawTrack(e);      //draw track on canvas
    // update (x,y)
    x = cx;
    y = cy;
  }
  //<canvas> & tips<div> is ready, when mousemove or drag, append to show track & tips
  function addCanvas(e) {
    document.documentElement.appendChild(tips);     //append tips <div>
    document.documentElement.appendChild(canvas);   //append <canvas>
    canvas.width = window.innerWidth;               //set canvas attribute to clear content
    canvas.height = window.innerHeight;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if(cfg.lineColor.length>6)canvas.style.opacity = parseInt(cfg.lineColor.slice(6),16)/255;
    ctx.lineWidth = cfg.minLineWidth;
    ctx.strokeStyle = '#' + cfg.lineColor.slice(0,6); //like delicious link color//line color
    flag.hascanvas = true;
  }
  //remove <canvas> and tips<div>,set flags to false
  function reset() {
    if (flag.hascanvas) {
      document.documentElement.removeChild(canvas);
      document.documentElement.removeChild(tips);
    }
    flag.isPress = false;
    flag.hascanvas = false;
  }
  function createCanvaTips(){
    //create <canvas>
    canvas = document.createElement("canvas");
    canvas.id = 'MPcanvas';
    ctx = canvas.getContext("2d");
    //create tips<div>
    tips = document.createElement('div');
    tips.id = 'MPtips';
    tips.style.cssText = `background:#${cfg.tipsBackground} !important;  font-size: ${cfg.fontSize}px !important;`;
  }
  createCanvaTips();

  //=========== event processing
  //right click ==> gesture
  window.addEventListener('mousedown', function(e) {
    // 3 : mouse.right ; 1:mouse.left
    if (e.which === 3) {
      startX = x = e.clientX;
      startY = y = e.clientY;
      track = "";
      flag.isPress = true;
      // flag.actionType = "common";
      cfg.dragType = "t2n";
      window.addEventListener('mousemove', tracer, false);
    }
  }, false);
  window.addEventListener('contextmenu', function(e) {
    reset();
    window.removeEventListener('mousemove', tracer, false);
    if (track !== "") {
      e.preventDefault();
      if (cfg.t2n.hasOwnProperty(track)) {
        Fn[cfg.t2n[track].name](cfg.t2n[track].arg);
      }
    }
  }, false);

  //left click ==> drag
  window.addEventListener('dragstart', function(e) {
    startX = x = e.clientX;
    startY = y = e.clientY;
    track = '';
    flag.isPress = true;
    flag.isDrag = true;
    flag.actionType = "drag";
    processDrag(e);
    window.addEventListener('drag', tracer, false);
    //避免释放鼠标时候,坐标跑到(0,0) window.allowDrop
    this.allowDrop = function(event) {
      event.preventDefault();
    };
    tips.addEventListener("dragover", allowDrop, false);
    canvas.addEventListener("dragover", allowDrop, false);
  }, false);
  window.addEventListener('dragend', function(e) {
    window.removeEventListener('drag', tracer, false);
    tips.removeEventListener("dragover", allowDrop, false);
    canvas.removeEventListener("dragover", allowDrop, false);
    reset();
    isDrag = false;
    if (track !== "" && cfg[cfg.dragType].hasOwnProperty(track)) {
      // dragType + track => function
      Fn[cfg[cfg.dragType][track].name](event,cfg[cfg.dragType][track].arg);
    }
  }, false);

  function processDrag(e) {
    //========这部分借鉴 crxMouse Chrome™ Gestures, crxID:jlgkpaicikihijadgifklkbpdajbkhjo===========
    dObj.target = e.target;
    let nodetype = e.target.nodeType;
    //confirm dragType
    if (nodetype === 3) {
      let isLink = e.target.parentNode.href;
      if (cfg.dragtext && !isLink) {
        // cfg.dragType = "text";
        cfg.dragType = "dt2n";
      } else if (isLink) { //use regular express to match?
        e = e.target.parentNode;
        cfg.dragType = "dl2n";
        // cfg.dragType = "link";
      }
    }
    if (nodetype === 1) {
      if (e.target.value && cfg.dragtext && cfg.draginput) {
        cfg.dragType = "dt2n";
        // cfg.dragType = "text";
      } else if (e.target.href) {
        if (window.getSelection().toString() == "" || e.target.textContent.length > window.getSelection().toString().lenght) {
          if (cfg.draglink) {
            cfg.dragType = "dl2n";
            // cfg.dragType = "link";
          }
        } else {
          if (cfg.dragtext) {
            cfg.dragType = "dt2n";
            // cfg.dragType = "text";
          }
        }
        if (!cfg.dragtext && cfg.draglink) {
          cfg.dragType = "dl2n";
          // cfg.dragType = "link";
        }
      } else if (e.target.src) {
        if (e.target.parentNode.href) {
          if (cfg.dragimage && (e[cfg.imgfirst + "Key"] || cfg.imgfirstcheck)) {
            cfg.dragType = "di2n";
            // cfg.dragType = "image";
          } else if (cfg.draglink) {
            cfg.dragType = "dl2n";
            // cfg.dragType = "link";
            e = e.target.parentNode;
          }

        } else if (cfg.dragimage) {
          cfg.dragType = "di2n";
          // cfg.dragType = "image";
        }
      }

    }


    if (!cfg.dragType) {
      flag.isDrag = false;
      return;
    }
    dObj.text = window.getSelection().toString() || e.target.innerHTML;
    dObj.link = e.href || e.target.href;
    dObj.img = e.target.src;
    if (cfg.setdragurl && cfg.dragType == "dt2n") {
      var tolink;
      if (dObj.text.indexOf("http://") != 0 && dObj.text.indexOf("https://") != 0 && dObj.text.indexOf("ftp://") != 0 && dObj.text.indexOf("rtsp://") != 0 && dObj.text.indexOf("mms://") != 0 && dObj.text.indexOf("chrome-extension://") != 0 && dObj.text.indexOf("chrome://") != 0) {
        tolink = "http://" + dObj.text;
      } else {
        tolink = dObj.text;
      }
      var urlreg = /^((chrome|chrome-extension|ftp|http(s)?):\/\/)([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
      if (urlreg.test(tolink)) {
        cfg.dragType = "dl2n";
        dObj.link = tolink;
      }
    }
    //========== crxID:jlgkpaicikihijadgifklkbpdajbkhjo END===========
    return dObj;
  }

  //when close a tab, save it's url, in order to reopen it: reopenTab
  window.addEventListener('unload', function() {
    GM_setValue('latestTab', window.location.href);
  }, false);
  //used in func: closeOtherTabs
  if(!GM_getValue('closeAll','')) GM_setValue('closeAll', Date());
  GM_addValueChangeListener('closeAll',function(name, old_value, new_value, remote){if(remote)window.close();});
  //update all tabs MG's config
  if(!GM_getValue('configChanged','')) GM_setValue('configChanged', Date());
  GM_addValueChangeListener('configChanged',function(name, old_value, new_value, remote){
    if(remote) cfg = GM_getValue('cfg', _cfg);
    createCanvaTips();
  });

  //========== Setting UI
  let makeSettingUi = function(){
    let CSS = `
      #MPsetting{z-index:999997!important;background:white!important;width:100%!important;height:100%!important;font-family:"微软雅黑"!important;position:fixed!important;top:0!important;left:0!important;}
      #MPmenu *,
      .MPcontent *{border-radius:5px!important;font-size:16px!important;}
      #MPlogo{background:white!important;box-shadow:inset 0 0 25px 15px yellowgreen!important;width:80px!important;height:80px!important;padding:0 10px 30px 10px!important;display:block!important;font-size:80px!important;color:cyan!important;text-shadow:6px 5px 15px black!important;}
      #MPmenu{z-index:999999!important;height:100%!important;width:100px!important;background:yellowgreen!important;color:white!important;text-align:center!important;}
      #MPmenu li{list-style-type:none!important;border-top:1px dashed white!important;margin:10px 15px!important;}
      .MPselected{box-shadow:inset 2px 2px 1px 4px rgba(16,12,12,0.6)!important;}
      #MPmenu li:hover{background:#05FDE7!important;color:#FF841D!important;}
      #MPmenu li span{display:block!important;width:40px!important;height:40px!important;font-size:35px!important;font-weight:bold!important;padding:0 15px!important;}
      #MPmenu b{display:block!important;width:70px!important;text-align:center!important;margin-top:10px!important;}
      .MPcontent{height:94%!important;width:100%!important;overflow-y:scroll!important;position:absolute!important;left:100px!important;top:0!important;z-index:999998!important;padding:20px!important;}
      .MPcontent h1,
      #FunsList legend{display:block!important;width:800px!important;font-size:30px!important;float:left!important;top:0!important;left:90px!important;padding:5px 12px!important;margin:0 10px!important;border-left:5px solid yellowgreen!important;background:#9acd3259!important;}
      .MPcontent > li{list-style-type:none!important;width:800px!important;height:auto!important;padding:10px 5px 0px 5px!important;margin:5px 20px!important;float:left!important;border-bottom:1px dashed #00000020!important;}
      .MPcontent > li:hover{box-shadow:inset 1px 1px 1px 3px #9acd32de!important;}
      .MPcontent >li span:nth-child(2){background:#00000010!important;text-align:left!important;padding:4px 10px!important;height:20px!important;width:auto!important;float:left!important;}
      .MPcontent >li span:nth-child(3){max-height:28px!important;float:right!important;}
      .MPcontent input[type="text"]{width:250px!important;height:26px!important;margin:0 10px!important;text-align:center!important;border:0!important;background:#0000000C!important;font-size:20px!important;}
      .MPcontent input[type="checkbox"]{width:0!important;}
      .MPcontent select{width:100%!important;height:100%!important;}
      #FunsList{width:800px!important;border:0!important;overflow:hidden!important;}
      .FunsListHide{height:40px!important;}
      .FunsListShow{height:auto!important;}
      #FunsList>li{display:inline-block!important;width:300px!important;height:30px!important;margin:5px!important;text-align:left!important;}
      span.tag{margin:2px 7px!important;padding:0!important;border:0!important;font-size:11px!important;white-space:nowrap!important;font-weight:bold!important;}
      span.tag span:first-child{color:white!important;background:#555!important;margin:0!important;padding:3px 3px 3px 7px!important;border:0!important;border-radius:4px 0 0 4px!important;}
      span.tag span:last-child{color:white!important;margin:0!important;border:0!important;padding:3px 7px 3px 3px!important;border-radius:0 4px 4px 0!important;}
      span.tag.yellow span:last-child{background:#FFB400!important;}
      span.tag.blue span:last-child{background:#1182C2!important;}
      span.tag.green span:last-child{background:#4DC71F!important;}
      span.tag.darkcyan span:last-child{background:#4DB798!important;}
      .MPcontent > li[data-type=t2n] span:first-child{background:#FFB40030!important;color:#FFB400!important;}
      .MPcontent > li[data-type=dt2n] span:first-child{background:#4DC71F30!important;color:#4DC71F!important;}
      .MPcontent > li[data-type=dl2n] span:first-child{background:#1182C230!important;color:#1182C2!important;}
      .MPcontent > li[data-type=di2n] span:first-child{background:#4DB79830!important;color:#4DB798!important;}
      .MPcontent > li span:first-child{text-align:left!important;font-size:18px!important;font-weight:bold!important;padding:2px 10px!important;width:auto!important;height:24px!important;float:left!important;border-left:10px solid!important;margin-right:20px!important;}
      #mg2>li>span{margin-bottom:10px!important;}
      #mg2>li>span:nth-child(3)>input {font-family: MParrow;}
      #mg2 > li span:nth-child(5),
      .MPcontent > li span:nth-child(6),
      .MPcontent > li span:nth-child(7){max-height:30px!important;margin-bottom:100px!important;white-space:nowrap!important;}
      .MPcontent > li span:nth-child(5) select{width:auto!important;height:26px!important;}

      /*label 作为开关*/
      label.switchOn{background:#4dc71f20!important;display:inline-block!important;color:#4DC71F!important;font-weight:bolder!important;min-width:40px!important;height:24px!important;padding:2px 5px!important;border-left:15px solid #4DC71F!important;border-radius:5px!important;}
      label.switchOff{background:#33333370!important;display:inline-block!important;color:#333333a0!important;text-decoration:line-through!important;min-width:40px!important;height:24px!important;padding:2px 5px!important;border-right:15px solid #333333!important;border-radius:5px!important;}
      input[type=checkbox].switch{width:0px!important;}
    `;
    let span = '', isOn = '', isChecked = '', settingDiv, settingParent,
      //菜单栏HTML
      txt = `<div id="MPmenu"><span id="MPlogo">☈</span><li data-target="mg1"><span>◧</span><b>Config</b></li><li data-target="mg2"><span>↯</span><b>Gesture</b></li><li data-target="mg3"><span>❓</span><b>About</b></li><li id="close"><span>🗙</span><b>Close</b></li></div>`;
    let setting = {
      mg1Start:         {eletype: '1',  id: 'mg1'},
      mg1title1:        {eletype: '2'},
      maxLineWidth:     {type: 'input',    name: 'maxLineWidth',     more: 'num'},
      lineGrowth:       {type: 'input',    name: 'lineGrowth',       more: 'num'},
      fontSize:         {type: 'input',    name: 'fontSize',         more: ''},
      lineColor:        {type: 'input',    name: 'lineColor',        more: 'color'},
      funNotDefine:     {type: 'input',    name: 'funNotDefine',     more: ''},
      language:         {type: 'input',    name: 'language',         more: 'num'},
      sensitivity:      {type: 'input',    name: 'sensitivity',      more: 'num'},
      tipsBackground:   {type: 'input',    name: 'tipsBackground',   more: 'color'},
      translateTimeout: {type: 'input',    name: 'translateTimeout', more: ''},
      mg1title2:        {eletype: '2'},
      dragtext:         {type: 'checkbox', name: 'dragtext',         more: ''},
      draginput:        {type: 'checkbox', name: 'draginput',        more: ''},
      draglink:         {type: 'checkbox', name: 'draglink',         more: ''},
      dragimage:        {type: 'checkbox', name: 'dragimage',        more: ''},
      //imgfirst:       {imgfirstcheck: {type: 'checkbox', name: 'imgfirstcheck', more: ''},
      setdragurl:       {type: 'checkbox', name: 'setdragurl',       more: ''},
      mg1end:           {eletype: '3'}
    };
    let selectobjs = {
      //languages
      translateTo: {"Afrikaans":"af","Haitian Creole":"ht","Querétaro Otomi":"otq","Arabic":"ar","Hebrew":"he","Romanian":"ro","Bangla":"bn","Hindi":"hi","Russian":"ru","Bosnian (Latin)":"bs-Latn","Hmong Daw":"mww","Samoan":"sm","Bulgarian":"bg","Hungarian":"hu","Serbian (Cyrillic)":"sr-Cyrl","Cantonese (Traditional)":"yue","Indonesian":"id","Serbian (Latin)":"sr-Latn","Catalan":"ca","Italian":"it","Slovak":"sk","Chinese Simplified":"zh-CHS","Japanese":"ja","Slovenian":"sl","Chinese Traditional":"zh-CHT","Kiswahili":"sw","Spanish":"es","Croatian":"hr","Klingon":"tlh","Swedish":"sv","Czech":"cs","Korean":"ko","Tahitian":"ty","Danish":"da","Latvian":"lv","Tamil":"ta","Dutch":"nl","Lithuanian":"lt","Thai":"th","English":"en","Malagasy":"mg","Tongan":"to","Estonian":"et","Malay":"ms","Turkish":"tr","Fijian":"fj","Maltese":"mt","Ukrainian":"uk","Filipino":"fil","Norwegian Bokmål":"no","Urdu":"ur","Finnish":"fi","Persian":"fa","Vietnamese":"vi","French":"fr","Polish":"pl","Welsh":"cy","German":"de","Portuguese":"pt","Yucatec Maya":"yua","Greek":"el"},
      imgSearchEnging: {    // image searching
        BaiduImage:  "https://image.baidu.com/n/pc_search?queryImageUrl=%URL&uptype=urlsearch",
        GoogleImage: "https://www.google.com/searchbyimage?image_url=%URL",
        TinEye:      "http://www.tineye.com/search?url=%URL"
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
    let local = {
      arg: {
        searchText:{
          description:[['搜索引擎', '后台打开', '右边插入'], ['SearchingEnging', 'Load In Background', 'Insert After Current Tab']],
          arg:['select:searchEnging', 'checkbox', 'checkbox']
        },
        searchImg:{
          description:[['图片搜索引擎', '后台打开', '右边插入'], ['Image SearchingEnging', 'Load In Background', 'Insert After Current Tab']],
          arg:['select:imgSearchEnging', 'checkbox', 'checkbox']
        },
        translate:{
          description:[['目标语言'], ['Translate To']],
          arg:['select:translateTo']
        },
        fkVip:{
          description:[['视频解析接口'], ['Videos Parser API']],
          arg:['select:vipAPI']
        }
      },
      FunsListTitle: {
        t2n: ['手势', 'Gesture'],
        dt2n: ['拖拽文本', 'Drag Text'],
        dl2n: ['拖拽链接', 'Drag Link'],
        di2n: ['拖拽图片', 'Drag Image']
      },
      tips: ['说明', 'Description'],
      addFunction: ['增加一个功能', 'Add Function'],
      //setting prefix: SET => SET + functionName + Item
      mg1title1ITEM:       ['界面',                           'UI'],
      maxLineWidthITEM:    ['轨迹宽度',                       'Line Width'],
      maxLineWidthDESC:    ['鼠标轨迹最大宽度,单位"px"',      'Mouse Track Max. Line Width'],
      lineGrowthITEM:      ['轨迹增长',                       'Line Grow'],
      lineGrowthDESC:      ['轨迹增长速度,单位"px"',          'Track Growing Speed, Unit "px"'],
      fontSizeITEM:        ['提示字体大小',                   'Tips Font Size'],
      fontSizeDESC:        ['功能提示字体的大小,单位"px"',    'Function Tips Font Size, Unit "px"'],
      lineColorITEM:       ['轨迹颜色',                       'Line Color'],
      lineColorDESC:       ['3|6|8位16进制值,如 0f0 ,00ff00, 00ff0080','3|6|8 Hexadecimal Value, eg. 0f0,00ff00,00ff0080'],
      funNotDefineITEM:    ['未定义提示',                     'Not Define Tips'],
      funNotDefineDESC:    ['手势或者功能未定义时的提示信息', 'Undefined Function Tips'],
      languageITEM:        ['语言',                           'Language'],
      languageDESC:        ['0 表示中文 1 表示英语',          '0 for Chinese, 1 for English'],
      sensitivityITEM:     ['识别距离',                       'Sensitivigy'],
      sensitivityDESC:     ['方向变化计算距离',               'Min Direction Change Distance'],
      tipsBackgroundITEM:  ['提示文字背景颜色',               'Tis Background Color'],
      tipsBackgroundDESC:  ['提示文字的背景颜色',             'Tips Background Color'],
      vipApiITEM:          ['破解视频接口',                   'Parse Video API'],
      vipApiDESC:          ['VIP视频及杰解析接口',            'VIP Videos Parser API'],
      translateTimeoutITEM:['等待时间',                       'Timeout'],
      translateTimeoutDESC:['翻译等待时间,超时作废',          'Translation Timeout'],
      mg1title2ITEM:       ['设定',                           'Setting'],
      dragtextITEM:        ['启用拖拽文字',                   'Enable Drag Text'],
      dragtextDESC:        ['选中文字并且拖拽时候的功能',     'Enable Drag Text'],
      draginputITEM:       ['启用拖拽文本框文字',             'Enable Drag Text-in-Inputbox'],
      draginputDESC:       ['文本框中选中文字并且拖拽时候,使用拖拽的功能','Enable Drag Text-in-Inputbox'],
      draglinkITEM:        ['启用拖拽链接',                   'Enable Drag Link'],
      draglinkDESC:        ['拖拽链接时候的功能',             'Enable Drag Link'],
      dragimageITEM:       ['启用拖拽图片',                   'Enable Drag Image'],
      dragimageDESC:       ['拖拽图片时候的功能',             'Enable Drag Image'],
      imgfirstcheckITEM:   ['图片链接识别为图片',             'Drag ImageLink as Drag Image'],
      imgfirstcheckDESC:   ['拖拽图片链接时候,识别为拖拽图片的功能','Drag Image-Link, Treat as Drag Image'],
      setdragurlITEM:      ['拖拽文本链接',                   'Drag LinkText as Drag Link'],
      setdragurlDESC:      ['拖拽文本为链接时候,识别为拖拽链接','Drag Link-Text, Treat as Drag Link']
    };
    let arg2html = function(argument, type, trk){
      let html ="", argu, i,rand, trackTxt, name, argValue = [], agrDetail = [], description;
      typeof argument === "object" ? argu = argument : argu = JSON.parse(argument);
      trackTxt = trk || '';
      name = argu.name;
      html += `<span>${name}</span><span>${fn[type][name][cfg.language]}</span><span><input type="text" name="${name}" value="${trackTxt}" data-mark="${type}"></span><br/>`;
      if(argu.arg.length > 0){
        argValue = trackTxt ? argu.arg : [];
        agrDetail = local.arg[name].arg;
        description = local.arg[name].description[cfg.language];
        for(i in agrDetail){
          rand = Math.floor(Math.random()*1000);
          switch (agrDetail[i].slice(0,5)) {
            case 'input':
              html += '<span><input type="text"></span>';
              break;
            case 'check':
              html += `<span><input type="checkbox" id="${name + rand}" value=${argValue[i] || false} ${argValue[i] ? "checked" : ''} class="switch"><label for="${name + rand}" ${argValue[i] ? 'class="switchOn"' : 'class="switchOff"'}>${description[i]}</label></span>`;
              break;
            case 'selec':
              selectName = agrDetail[i].split(':').pop();
              html += `<span><input type="text" value=${argValue[i] || ''}><select>`;
              for (let k in selectobjs[selectName]){
                html += `<option value=${selectobjs[selectName][k]}>${k}</option>`;
              }
              html += '</select></span>';
              break;
            default:
               html = `<span style="visibility:hidden;"><span></span></span>`;
              break;
          }
        }
      }
      return html;
    },
    makeFunsList = function(){
      let html = '',i=0,j,hasArgument,item2,arg,color=['yellow', 'green', 'blue', 'darkcyan'];
      ['t2n','dt2n','dl2n','di2n'].forEach((item1) => {
        for( item2 in fn[item1]){
          local.arg.hasOwnProperty(item2) ? arg = Object.assign({name:item2},local.arg[item2]) : arg = {name:item2,arg:[]};
          html +=`
          <li  data-arg='${JSON.stringify(arg)}' data-type="${item1}" title="${fn[item1][item2][cfg.language]}"><span class="tag ${color[i]}"><span>${local.FunsListTitle[item1][cfg.language]}</span><span>${item2}</span></span></li>
          `;
        }
        i += 1;
      });
      html = `<fieldset id="FunsList" class="FunsListHide"><h1>${local.addFunction[cfg.language]} ➕ </h1><br/>${html}</fieldset>`;

      return html;
    },
    makeDefinedFunsList = function(type){
      let i, html ='';
       for(i in cfg[type]){
        html += `<li data-arg='${JSON.stringify(cfg[type][i])}' data-type='${type}'>${arg2html(cfg[type][i], type, i)}`;
      }
       return html;
    },
    clickToMakeEle = function(){
      let tarEle = event.target.tagName === 'LI' ? event.target : (event.target.parentNode.tagName === "LI" ? event.target.parentNode : event.target.parentNode.parentNode);
      let ele = document.createElement('li');
      ele.setAttribute('data-arg', tarEle.dataset.arg);
      ele.setAttribute('data-type', tarEle.dataset.type);
      ele.innerHTML = arg2html(tarEle.dataset.arg, tarEle.dataset.type);
      document.getElementById('mg2').insertBefore(ele, document.querySelector(`#mg2>li`));
      try {
        if(ele.children[4]) ele.children[4].children[1].addEventListener('change', formChange, false);
        if(ele.children[5]) {
          ele.children[5].firstElementChild.addEventListener('change', formChange, false);
          ele.children[5].firstElementChild.addEventListener('change', onOff, false);
        }
        if(ele.children[6]) {
          ele.children[6].firstElementChild.addEventListener('change', formChange, false);
          ele.children[6].firstElementChild.addEventListener('change', onOff, false);
        }
      } catch(e) {
      }
      //轨迹框 失去焦点 更新设置
      ele.children[2].firstElementChild.addEventListener('blur', updateFns, false);
      ele.children[2].firstElementChild.addEventListener('keyup', function(event) {
        event.target.value = letter2arrow(event.target.value);
      }, false);
      //函数列表收缩, 回滚到顶部
      toggleFunsList();
      document.documentElement.scrollTo(0, 0);
    },
    updateFns = function(){
      var typeObject = {},
      tarEle = event.target;
      tarEle.tagName === "LI" ? null : (tarEle.parentNode.tagName === "LI" ? tarEle = tarEle.parentNode : tarEle = tarEle.parentNode.parentNode);
      [].forEach.call(document.querySelectorAll(`#mg2>li[data-type=${tarEle.dataset.type}]`), function(element, index) {
        updateItem(element);
      });
      function updateItem(item){
        let childrens, trk, argValue=[], name, dataArgObject;
        trk = item.children[2].firstElementChild.value;
        //if mouse track is not empty , update Fns
        if(trk !== ''){
          childrens = item.children;
          dataArgObject = JSON.parse(item.dataset.arg);
          if(childrens[4]) {
            if(childrens[4].firstElementChild.value && childrens[4].firstElementChild.value !== "undefined"){
              argValue[0] = childrens[4].firstElementChild.value;
            } else{
              argValue[0] = '';
            }
          }
          if(childrens[5]) {
            if(childrens[5].firstElementChild.value && childrens[5].firstElementChild.value !== "undefined"){
              argValue[1] = childrens[5].firstElementChild.value;
            } else{
              argValue[1] = '';
            }
          }
          if(childrens[6]) {
            if(childrens[6].firstElementChild.value && childrens[6].firstElementChild.value !== "undefined"){
              argValue[2] = childrens[6].firstElementChild.value;
            } else{
              argValue[2] = '';
            }
          }
          typeObject[trk] = {name: dataArgObject.name, arg: argValue};
        }

      }
      cfg[tarEle.dataset.type] = typeObject;
      GM_setValue('cfg', cfg);
      GM_setValue('configChanged', Date());
    },
    updateCfgUsr = function(e){
      switch (e.target.dataset.mark) {
        case 'color':
          cfg[e.target.name] = e.target.value;
          e.target.setAttribute('style', `background: #${e.target.value} !important;`);
          break;
        case 'num':
          let b;
          switch (e.target.name) {
            case 'language':
              b = (e.target.value == 1 || e.target.value == 0) ? e.target.value : cfg[e.target.name];
              break;
            case 'sensitivity':
            case 'fontSize':
              b = parseInt(e.target.value);
              break;
            default:
              b = parseFloat(parseFloat(e.target.value).toFixed(2));
              break;
          }
          cfg[e.target.name] = b;
          break;
        case 'select':
        case 'normal':
          cfg[e.target.name] = e.target.value;
          break;
        default:
          // cfg[e.target.id] = updateFns(`input[data-mark="${e.target.dataset.mark}"]`);
          break;
      }
      GM_setValue('cfg', cfg);
      GM_setValue('configChanged', Date());
    },
    formChange = function(){
      if(event.target.type === 'checkbox'){
        event.target.value = event.target.checked;
        updateFns();
      }
      if(event.target.tagName === 'SELECT'){
        event.target.previousElementSibling.value = event.target.value;
        updateFns();
      }
    },
    letter2arrow = function(str){
      return str.replace(/[^uUdDlLrR4682]/g, '').replace(/[lL]/g, '4').replace(/[rR]/g, '6').replace(/[dD]/g, '8').replace(/[uU]/g, '2');
    },
    onOff = function(e) {
      cfg[e.target.id] = e.target.checked;
      if (cfg[e.target.id]) {
        e.target.nextElementSibling.setAttribute('class', 'switchOn');
      } else {
        e.target.nextElementSibling.setAttribute('class', 'switchOff');
      }
      //GM***
    },
    toggleFunsList = function(){
      let a = document.getElementById('FunsList');
      if(a.getAttribute('class') === "FunsListHide"){
        a.setAttribute('class', 'FunsListShow');
      }else{
        a.setAttribute('class', 'FunsListHide');
      }
    },
    selected = function(e) {
      let tar;
      if (e.target.tagName === "LI") {
        tar = e.target;
      } else {
        tar = e.target.parentNode;
      }
      [].forEach.call(document.querySelectorAll('#MPmenu li'), function(item) {
        item.setAttribute('class', '');
      });
      tar.setAttribute('class', 'MPselected');
      [].forEach.call(document.querySelectorAll('.MPcontent'), function(item) {
        item.style.display = "none";
      });
      document.getElementById(tar.dataset.target).setAttribute('style', 'display:block;');
    };

    GM_addStyle(CSS);
    //#mg1 config
    for (let i in setting) {
      if (setting[i].eletype) {
        switch (setting[i].eletype) {
          case '1':
            txt += `<div id="${setting[i].id}" class="MPcontent">`;
            break;
          case '2':
            txt += `<h1>${local[i+'ITEM'][cfg.language]}</h1>`;
            break;
          case 1:
            txt += `<div id="${setting[i].id}" class="MPcontent">`;
            break;
          default:
            txt += `</div>`;
            break;
        }
      } else {
        if (setting[i].type === 'input') {
          if (setting[i].more === 'color') {
            span = `<input type="text" name="${setting[i].name}" value="${cfg[setting[i].name]}" style="background:#${cfg[setting[i].name]};"  data-mark="color">`;
          } else if (setting[i].more === 'num') {
            span = `<input type="text" name="${setting[i].name}" value="${cfg[setting[i].name]}" data-mark="num">`;
          } else {
            span = `<input type="text" name="${setting[i].name}" value="${cfg[setting[i].name]}" data-mark="normal">`;
          }
        } else {
          isChecked = cfg[setting[i].name] ? 'checked' : '';
          isOn = cfg[setting[i].name] ? 'class="switchOn"' : 'class="switchOff"';
          span = `<input type="checkbox" id="${setting[i].name}" name="${setting[i].name}" ${isChecked} class="switch"><label for="${setting[i].name}" ${isOn}></label>`;

        }
        txt += `<li><span>${local[i+'ITEM'][cfg.language]}</span><span title='${local[i+'DESC'][cfg.language]}'>${local.tips[cfg.language]}</span><span>${span}</span></li>`;
      }
    }

    //#mg2 Defined FunsList htms Gesture/Darg funcs
    txt +='<div id="mg2" class="MPcontent">';
    txt += makeFunsList();    //#mg2 FunsList html
    txt += makeDefinedFunsList('t2n');
    txt += makeDefinedFunsList('dt2n');
    txt += makeDefinedFunsList('dl2n');
    txt += makeDefinedFunsList('di2n');
    txt += '</div>';  //#mg2 end
    //#mg3
    txt += '<div id="mg3" class="MPcontent"><a href="https://github.com/woolition/greasyforks/blob/master/mouseGesture/HY-MouseGesture.md" style="display:block;width: 90%;height: auto;font-family:MParrow;font-size: 40px!important;text-decoration: none;font-weight: bolder;padding: 30px 30px; color:yellowgreen;">手势输入:<br>u or U: 2<br>r or R: 6<br> d or D: 8<br> l or L: 4<br><br>(●￣(ｴ)￣●)づ <br>点我看更多介绍! </a></div>';

    settingDiv = document.createElement('div');
    settingDiv.id = "MPsetting";
    settingDiv.innerHTML = txt;
    settingParent = document.body || document.documentElement;
    settingParent.appendChild(settingDiv);

    [document.querySelectorAll('#MPmenu li')[0],document.querySelectorAll('#MPmenu li')[1],document.querySelectorAll('#MPmenu li')[2]].forEach(function(item) {
      item.addEventListener('click', selected, false);
    });
    [].forEach.call(document.querySelectorAll('#mg1 input[type=text]'), function(item) {
      item.addEventListener('blur', updateCfgUsr, false);
    });
    [].forEach.call(document.querySelectorAll('#mg1 input[type=checkbox], #mg2 input[type=checkbox]'), function(item) {
      item.addEventListener('change', onOff, false);
      if(item.parentNode.parentNode.parentNode.id === 'mg1'){
        item.addEventListener('change',updateCfgUsr,false);
      }
    });
    [].forEach.call(document.querySelectorAll('#FunsList li'),(item)=>{
      item.addEventListener('click', clickToMakeEle, false);
    });
    [].forEach.call(document.querySelectorAll('#mg2 input[type=text]'), function(item) {
      item.addEventListener('blur', updateFns, false);
    });
    [].forEach.call(document.querySelectorAll('#mg2 select, #mg2 input[type=checkbox]'), function(item) {
      item.addEventListener('change', formChange, false);
    });
    [].forEach.call(document.querySelectorAll('#mg2>li'), function(item) {
      item.children[2].firstElementChild.addEventListener('keyup', function(event) {
        let a = event.target.value;
        a = letter2arrow(a);
        if(a.charAt(a.length -1) === a.charAt(a.length-2)) a = a.slice(0,-1);
        event.target.value = a;
      }, false);
    });
    //init
    [].forEach.call(document.querySelectorAll('.MPcontent'), function(item) {
      item.style.display = "none";
    });
    document.querySelector('#FunsList h1').addEventListener('click', toggleFunsList, false);
    document.getElementById('mg1').style.display = 'block';
    document.getElementById('close').addEventListener('click', function(e) {
      try {
        document.documentElement.removeChild(document.getElementById("MPsetting"));
      } catch(event) {
        document.body.removeChild(document.getElementById("MPsetting"));
      }

    }, false);
  };
  // return;

})();
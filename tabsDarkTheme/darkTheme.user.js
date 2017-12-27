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
// @require            https://cdnjs.cloudflare.com/ajax/libs/zepto/1.2.0/zepto.min.js
// @grant              unsafeWindow
// @run-at             document-start
// @grant              GM_setValue
// @grant              GM_getValue
// @grant              GM.setValue
// @grant              GM.getValue
// @grant              GM_registerMenuCommand
// @grant              GM_unregisterMenuCommand
// ==/UserScript==
/* jshint esversion: 6 */
;
(function() {
  'use strict';
  const CSS = `
    :root{-webkit-filter:invert(100%) contrast(87%);filter:invert(100%) contrast(87%);background:#272822!important;}
    img{-webkit-filter:invert(100%) brightness(105%);filter:invert(100%) brightness(105%);}
    *[style*="url"]{-webkit-filter:invert(100%);filter:invert(100%);}
    *[data-dmbg="1"]{-webkit-filter:none;filter:none;}
    *[data-dmbg="2"]{-webkit-filter:invert(100%);filter:invert(100%);}
    video,embed,object,canvas{-webkit-filter:invert(100%);filter:invert(100%);}
    /* 图标 */
    ::before{-webkit-filter:invert(100%);filter:invert(100%);}
    /* 图标 排除font-awesome图标 */
    .fa::before{-webkit-filter:invert(0%);filter:invert(0%);}
    /* 下面的 img img 这种选择器，是指那些被点击后图片会放大的图片，如微博里面小图, 方案: 眼睛护航crx*/
    :-webkit-any(iframe,img,[style*="url"]:not(input),i,video,object,embed:not([type$="pdf"])):-webkit-any(iframe,img,[style*="url"]:not(input),i,video,object,embed:not([type$="pdf"])){-webkit-filter:none;filter:none;}
    :-moz-any(iframe,img,[style*="url"]:not(input),i,video,object,embed:not([type$="pdf"])):-moz-any(iframe,img,[style*="url"]:not(input),i,video,object,embed:not([type$="pdf"])){filter:none;}
    img[src*="logo"]{-webkit-filter:invert(0%);filter:invert(0%);}
  `;
  const defaultCSSlist = {
    ".*baidu.com": {
      name: "百度",
      enable: 0,
      default: 1,
      css: "/* baidu search,news,wenku logo*/\n#result_logo img, .s_logo img, .logo img {\n  -webkit-filter: invert(0%);\n  filter: invert(0%);\n}"
    },
    ".iqiyi.com": {
      name: "爱奇艺",
      enable: 1,
      default: 1,
      css: "/*index*/\n#adSkinInner #block-A,\ndiv#block-C,\ndiv#block-B { -webkit-filter: invert(100%); filter: invert(100%); }\n\n/*首页图片*/\n.skin_focus li[style*=\"background-image\"] { -webkit-filter: invert(0%); filter: invert(0%); }\n\n/*播放页*/\n#block-B video,\n#block-B img { -webkit-filter: invert(0%); filter: invert(0%); }\n.topNav-player,\n.topNav-pindao { background: #e4e4e4; }\ndiv.navMid.clearfix,\ndiv.navcont.clearfix { -webkit-filter: invert(100%); filter: invert(100%); }\ndiv.mod-breadcrumb { -webkit-filter: invert(0%); filter: invert(0%); background: black; }"
    }
  };
  var darkThemeSwitch, csslist, blackList, pageFirstLoad = true;

  /*这里不采用GM_addStyle,
   *是为了避免网页局部更新的时候,把<head>内部的<style>去除了,
   *例如百度搜索,点击搜索一下按钮的时候
   */
  function GMaddStyle(id, css) {
    let a = document.createElement('style'),
      doc;
    a.id = id;
    a.textContent = '<!--\n' + css + '\n-->';
    if (location.origin === "file://") {
      doc = document.head || document.documentElement;
    } else {
      doc = document.body || document.documentElement;
    }
    doc.appendChild(a);
  }
  /* 兼容 Tampermonkey | Violentmonkey | Greasymonkey 4.0+
   * 为了兼容GreasyMonkey 4.0 获取结构化数据,比如 json Array 等,
   * 应当先将字符串还原为对象,再执行后续操作
   * GMgetValue(name,defaultValue).then((result)=>{
   *   let result = JSON.parse(result);
   *   // other code...
   * };
   */
  function GMgetValue(name, defaultValue) {
    if (typeof GM_getValue === 'function') {
      return new Promise((resolve, reject) => {
        resolve(GM_getValue(name, defaultValue));
        // reject();
      });
    } else {
      return GM.getValue(name, defaultValue);
    }
  }
  /* 兼容 Tampermonkey | Violentmonkey | Greasymonkey 4.0+
   * 为了兼容GreasyMonkey 4.0 储存结构化数据,比如 json Array 等,
   * 应当先将对象字符串化,
   * GMsetValue(name, JSON.stringify(defaultValue))
   */
  function GMsetValue(name, defaultValue) {
    if (typeof GM_setValue === 'function') {
      GM_setValue(name, defaultValue);
      return new Promise((resolve, reject) => {
        resolve();
        reject();
      });
    } else {
      return GM.setValue(name, defaultValue);
    }
  }
  //concat cssText: return css Promise
  function concatCss() {
    return GMgetValue('csslist', JSON.stringify(defaultCSSlist))
      .then((ag) => {
        let a = '', enableDefaultCSS = 0;
        csslist = JSON.parse(ag);
        for (let i in csslist) {
          try {
            if (new RegExp(i).test(location.host) && csslist[i].enable === "1") {
              a += csslist[i].css;
              /* 所有匹配规则都不允许默认CSS的时候,才不添加默认CSS */
              enableDefaultCSS = !!(enableDefaultCSS || csslist[i].default === "1");
              console.log(enableDefaultCSS);
            }
          } catch (e) {
            console.log(e);
          }
        }
        if( typeof enableDefaultCSS !== 'number' && !enableDefaultCSS){
          return  a;
        }else{
          return CSS + a;
        }
      });
  }
  //Greasymonkey
  function GMBlackList() {
    if (pageFirstLoad) {
      let a = document.createElement('div'),
        doc = document.body || document.documentElement,
        txt = `#GMBlackListDiv{position:fixed;left:0;bottom:0;width:30px;height:30px;border-radius:20px;background:cyan;opacity:0;z-index:9999999;} #GMBlackListDiv:hover{opacity:1;} `;
      GMaddStyle('GMBlackList', txt);
      a.id = 'GMBlackListDiv';
      doc.appendChild(a);
      $(a).on('click', GMBlackList);
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
        $('#darkTheme').remove();
      } catch (e) {}
    } else {
      concatCss().then((ag) => {
        GMaddStyle('darkTheme', ag);
        init();
      });
    }
  }
  //Tampermonkey | Violentmonkey
  function TMBlackList() {
    GMgetValue('blackList', '{"null":false}')
      .then((blist) => {
        blackList = JSON.parse(blist);
        if (!pageFirstLoad) {
          GM_unregisterMenuCommand(darkThemeSwitch);
          if (blackList[location.host] === undefined) {
            blackList[location.host] = true;
          } else {
            delete blackList[location.host];
          }
          GMsetValue('blackList', JSON.stringify(blackList));
        }
        if (blackList[location.host]) {
          try {
            $('#darkTheme').remove();
          } catch (e) {}
          darkThemeSwitch = GM_registerMenuCommand('DarkTheme  On', TMBlackList);
        } else {
          concatCss().then((ag) => {
            GMaddStyle('darkTheme', ag);
            init();
            darkThemeSwitch = GM_registerMenuCommand('DarkTheme  Off', TMBlackList);
          });
        }
      });
    GM_registerMenuCommand('DK Manage CSS', manage);
  }
  //初始化
  function init() {
    function BGlinks() {
      $('a').each((index, item) => {
        if ($(item).css('background-image') !== 'none') {
          $(item).attr('data-dmbg', '1');
        }
      });
    }
    $(BGlinks);
  }
  //管理 特定的CSS
  function manage() {
    const managePanelCss = `
      #cssManagePanel{width:100%;height:100%;position:fixed;left:0;top:0;margin:0;padding:0;background-color:white;overflow-y:scroll;z-index:999999;}
      #cssManagePanel * :not(pre){border-radius:3px;font-size:16px;background:transparent;}
      #cssManagePanel pre,#cssManagePanel code,#cssManagePanel button[name='saveCSS']{display:none;}
      #cssManagePanel li{width:90%;list-style-type:none;border-bottom:1px dashed rgba(0,0,0,0.3);padding:3px;white-space:nowrap;text-align:center;}
      #cssManagePanel span :not(pre){display:inline-block;width:150px;}
      #cssManagePanel input[type='text']{display:inline-block;width:200px;border:1px solid #999;padding:2px 5px;}
      #cssManagePanel label{display:inline-block;width:80px;padding:3px 6px;}
      #cssManagePanel button{width:70px;background:#aaa;border:0;padding:3px 6px;}
      #cssManagePanel pre{width:100%;}
      #cssManagePanel code{border:1px solid #999;width:98%;height:200px;overflow:scroll;resize:both;min-width:300px;min-height:100px;text-align:left;}
      /* ===================== PrismJS Solarized Color Schemes START ========================= */
      code[class*="language-"],pre[class*="language-"]{color:#657b83; /* base00 */font-family:Consolas,Monaco,'Andale Mono','Ubuntu Mono',monospace;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;word-wrap:normal;line-height:1.5;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none;}
      pre[class*="language-"]::-moz-selection,pre[class*="language-"]::-moz-selection,code[class*="language-"]::-moz-selection,code[class*="language-"]::-moz-selection{background:#073642; /* base02 */}
      pre[class*="language-"]::selection,pre[class*="language-"]::selection,code[class*="language-"]::selection,code[class*="language-"]::selection{background:#073642; /* base02 */}
      /* Code blocks */
      pre[class*="language-"]{padding:1em;margin:.5em 0;overflow:auto;border-radius:0.3em;}
      :not(pre) > code[class*="language-"],pre[class*="language-"]{background-color:#fdf6e3; /* base3 */}
      /* Inline code */
      :not(pre) > code[class*="language-"]{padding:.1em;border-radius:.3em;}
      .token.comment,.token.prolog,.token.doctype,.token.cdata{color:#93a1a1; /* base1 */}
      .token.punctuation{color:#586e75; /* base01 */}
      .namespace{opacity:.7;}
      .token.property,.token.tag,.token.boolean,.token.number,.token.constant,.token.symbol,.token.deleted{color:#268bd2; /* blue */}
      .token.selector,.token.attr-name,.token.string,.token.char,.token.builtin,.token.url,.token.inserted{color:#2aa198; /* cyan */}
      .token.entity{color:#657b83; /* base00 */background:#eee8d5; /* base2 */}
      .token.atrule,.token.attr-value,.token.keyword{color:#859900; /* green */}
      .token.function{color:#b58900; /* yellow */}
      .token.regex,.token.important,.token.variable{color:#cb4b16; /* orange */}
      .token.important,.token.bold{font-weight:bold;}
      .token.italic{font-style:italic;}
      .token.entity{cursor:help;}
      /* ======================== PrismJS Solarized Color Schemes END ============================ */
    `;

    function makeList() {
      let a = '',
        j = 0,
        managePanel;
      GMgetValue('csslist', JSON.stringify(defaultCSSlist))
        .then((ag) => {
          csslist = JSON.parse(ag);
          for (let i in csslist) {
            a += `<li>
              <span data-pattern="${i}">${csslist[i].name}</span>
              <label for="csslist${j}chbx1">
                <input id="csslist${j}chbx1" type="checkbox" name="default" ${csslist[i].default == '1'?' checked':''}>默认CSS
              </label>
              <label for="csslist${j}chbx2">
                <input id="csslist${j}chbx2" type="checkbox" name="enable" ${csslist[i].enable == '1'?' checked':''}>特定CSS
              </label>
              <button name="saveCSS">保存</button>
              <button name="editCSS">编辑CSS</button>
              <button name="deleteCSS">删除CSS</button>
              <button name="addCSS">新增</button>
              <br><pre><code id="csslist${j}" contenteditable="true" class="language-css">${csslist[i].css}</code></pre>
              </li>`;
            j++;
          }
          managePanel = $(`<style>${managePanelCss}</style><div><ul>${a}</ul></div>`, {
            id: "cssManagePanel"
          });
          $('body').append(managePanel);
        })
        .then(() => {
          $('#cssManagePanel button[name=editCSS]').one('click', editButton);
          $('#cssManagePanel button[name=deleteCSS]').one('click', deleteButton);
          $('#cssManagePanel button[name=addCSS]').on('click', addButton);
          // $('#cssManagePanel button[name=saveCSS]').on('click', saveButton);
          hightLight();
        });
    }
    function hightLight(){
      /* PrismJS 1.9.0
      http://prismjs.com/download.html?themes=prism-solarizedlight&languages=css */
      var _self="undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{},Prism=function(){var e=/\blang(?:uage)?-(\w+)\b/i,t=0,n=_self.Prism={manual:_self.Prism&&_self.Prism.manual,disableWorkerMessageHandler:_self.Prism&&_self.Prism.disableWorkerMessageHandler,util:{encode:function(e){return e instanceof r?new r(e.type,n.util.encode(e.content),e.alias):"Array"===n.util.type(e)?e.map(n.util.encode):e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]},objId:function(e){return e.__id||Object.defineProperty(e,"__id",{value:++t}),e.__id},clone:function(e){var t=n.util.type(e);switch(t){case"Object":var r={};for(var a in e)e.hasOwnProperty(a)&&(r[a]=n.util.clone(e[a]));return r;case"Array":return e.map(function(e){return n.util.clone(e)})}return e}},languages:{extend:function(e,t){var r=n.util.clone(n.languages[e]);for(var a in t)r[a]=t[a];return r},insertBefore:function(e,t,r,a){a=a||n.languages;var l=a[e];if(2==arguments.length){r=arguments[1];for(var i in r)r.hasOwnProperty(i)&&(l[i]=r[i]);return l}var o={};for(var s in l)if(l.hasOwnProperty(s)){if(s==t)for(var i in r)r.hasOwnProperty(i)&&(o[i]=r[i]);o[s]=l[s]}return n.languages.DFS(n.languages,function(t,n){n===a[e]&&t!=e&&(this[t]=o)}),a[e]=o},DFS:function(e,t,r,a){a=a||{};for(var l in e)e.hasOwnProperty(l)&&(t.call(e,l,e[l],r||l),"Object"!==n.util.type(e[l])||a[n.util.objId(e[l])]?"Array"!==n.util.type(e[l])||a[n.util.objId(e[l])]||(a[n.util.objId(e[l])]=!0,n.languages.DFS(e[l],t,l,a)):(a[n.util.objId(e[l])]=!0,n.languages.DFS(e[l],t,null,a)))}},plugins:{},highlightAll:function(e,t){n.highlightAllUnder(document,e,t)},highlightAllUnder:function(e,t,r){var a={callback:r,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};n.hooks.run("before-highlightall",a);for(var l,i=a.elements||e.querySelectorAll(a.selector),o=0;l=i[o++];)n.highlightElement(l,t===!0,a.callback)},highlightElement:function(t,r,a){for(var l,i,o=t;o&&!e.test(o.className);)o=o.parentNode;o&&(l=(o.className.match(e)||[,""])[1].toLowerCase(),i=n.languages[l]),t.className=t.className.replace(e,"").replace(/\s+/g," ")+" language-"+l,t.parentNode&&(o=t.parentNode,/pre/i.test(o.nodeName)&&(o.className=o.className.replace(e,"").replace(/\s+/g," ")+" language-"+l));var s=t.textContent,g={element:t,language:l,grammar:i,code:s};if(n.hooks.run("before-sanity-check",g),!g.code||!g.grammar)return g.code&&(n.hooks.run("before-highlight",g),g.element.textContent=g.code,n.hooks.run("after-highlight",g)),n.hooks.run("complete",g),void 0;if(n.hooks.run("before-highlight",g),r&&_self.Worker){var u=new Worker(n.filename);u.onmessage=function(e){g.highlightedCode=e.data,n.hooks.run("before-insert",g),g.element.innerHTML=g.highlightedCode,a&&a.call(g.element),n.hooks.run("after-highlight",g),n.hooks.run("complete",g)},u.postMessage(JSON.stringify({language:g.language,code:g.code,immediateClose:!0}))}else g.highlightedCode=n.highlight(g.code,g.grammar,g.language),n.hooks.run("before-insert",g),g.element.innerHTML=g.highlightedCode,a&&a.call(t),n.hooks.run("after-highlight",g),n.hooks.run("complete",g)},highlight:function(e,t,a){var l=n.tokenize(e,t);return r.stringify(n.util.encode(l),a)},matchGrammar:function(e,t,r,a,l,i,o){var s=n.Token;for(var g in r)if(r.hasOwnProperty(g)&&r[g]){if(g==o)return;var u=r[g];u="Array"===n.util.type(u)?u:[u];for(var c=0;c<u.length;++c){var h=u[c],f=h.inside,d=!!h.lookbehind,m=!!h.greedy,p=0,y=h.alias;if(m&&!h.pattern.global){var v=h.pattern.toString().match(/[imuy]*$/)[0];h.pattern=RegExp(h.pattern.source,v+"g")}h=h.pattern||h;for(var b=a,k=l;b<t.length;k+=t[b].length,++b){var w=t[b];if(t.length>e.length)return;if(!(w instanceof s)){h.lastIndex=0;var _=h.exec(w),P=1;if(!_&&m&&b!=t.length-1){if(h.lastIndex=k,_=h.exec(e),!_)break;for(var A=_.index+(d?_[1].length:0),j=_.index+_[0].length,x=b,O=k,N=t.length;N>x&&(j>O||!t[x].type&&!t[x-1].greedy);++x)O+=t[x].length,A>=O&&(++b,k=O);if(t[b]instanceof s||t[x-1].greedy)continue;P=x-b,w=e.slice(k,O),_.index-=k}if(_){d&&(p=_[1].length);var A=_.index+p,_=_[0].slice(p),j=A+_.length,S=w.slice(0,A),C=w.slice(j),M=[b,P];S&&(++b,k+=S.length,M.push(S));var E=new s(g,f?n.tokenize(_,f):_,y,_,m);if(M.push(E),C&&M.push(C),Array.prototype.splice.apply(t,M),1!=P&&n.matchGrammar(e,t,r,b,k,!0,g),i)break}else if(i)break}}}}},tokenize:function(e,t){var r=[e],a=t.rest;if(a){for(var l in a)t[l]=a[l];delete t.rest}return n.matchGrammar(e,r,t,0,0,!1),r},hooks:{all:{},add:function(e,t){var r=n.hooks.all;r[e]=r[e]||[],r[e].push(t)},run:function(e,t){var r=n.hooks.all[e];if(r&&r.length)for(var a,l=0;a=r[l++];)a(t)}}},r=n.Token=function(e,t,n,r,a){this.type=e,this.content=t,this.alias=n,this.length=0|(r||"").length,this.greedy=!!a};if(r.stringify=function(e,t,a){if("string"==typeof e)return e;if("Array"===n.util.type(e))return e.map(function(n){return r.stringify(n,t,e)}).join("");var l={type:e.type,content:r.stringify(e.content,t,a),tag:"span",classes:["token",e.type],attributes:{},language:t,parent:a};if(e.alias){var i="Array"===n.util.type(e.alias)?e.alias:[e.alias];Array.prototype.push.apply(l.classes,i)}n.hooks.run("wrap",l);var o=Object.keys(l.attributes).map(function(e){return e+'="'+(l.attributes[e]||"").replace(/"/g,"&quot;")+'"'}).join(" ");return"<"+l.tag+' class="'+l.classes.join(" ")+'"'+(o?" "+o:"")+">"+l.content+"</"+l.tag+">"},!_self.document)return _self.addEventListener?(n.disableWorkerMessageHandler||_self.addEventListener("message",function(e){var t=JSON.parse(e.data),r=t.language,a=t.code,l=t.immediateClose;_self.postMessage(n.highlight(a,n.languages[r],r)),l&&_self.close()},!1),_self.Prism):_self.Prism;var a=document.currentScript||[].slice.call(document.getElementsByTagName("script")).pop();return a&&(n.filename=a.src,n.manual||a.hasAttribute("data-manual")||("loading"!==document.readyState?window.requestAnimationFrame?window.requestAnimationFrame(n.highlightAll):window.setTimeout(n.highlightAll,16):document.addEventListener("DOMContentLoaded",n.highlightAll))),_self.Prism}();"undefined"!=typeof module&&module.exports&&(module.exports=Prism),"undefined"!=typeof global&&(global.Prism=Prism);
      Prism.languages.css={comment:/\/\*[\s\S]*?\*\//,atrule:{pattern:/@[\w-]+?.*?(?:;|(?=\s*\{))/i,inside:{rule:/@[\w-]+/}},url:/url\((?:(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,selector:/[^{}\s][^{};]*?(?=\s*\{)/,string:{pattern:/("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},property:/[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,important:/\B!important\b/i,"function":/[-a-z0-9]+(?=\()/i,punctuation:/[(){};:]/},Prism.languages.css.atrule.inside.rest=Prism.util.clone(Prism.languages.css),Prism.languages.markup&&(Prism.languages.insertBefore("markup","tag",{style:{pattern:/(<style[\s\S]*?>)[\s\S]*?(?=<\/style>)/i,lookbehind:!0,inside:Prism.languages.css,alias:"language-css",greedy:!0}}),Prism.languages.insertBefore("inside","attr-value",{"style-attr":{pattern:/\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,inside:{"attr-name":{pattern:/^\s*style/i,inside:Prism.languages.markup.tag.inside},punctuation:/^\s*=\s*['"]|['"]\s*$/,"attr-value":{pattern:/.+/i,inside:Prism.languages.css}},alias:"language-css"}},Prism.languages.markup.tag));
    }
    function saveButton(evt) {
      let a = $(evt.target).parent(),
        b,c;
      b = `<span data-pattern="${a.children().first().val()}">${a.children().first().next().val()}</span>`;
      a.children().first().remove();
      a.children().first().replaceWith(b);
      a.find('button[name=editCSS]').one('click', editButton);
      a.find('button[name=saveCSS],code,pre').attr('style', 'display:none');
      c = {
        name:a.children().first().text(),
        enable: a.find('input[name=enable]').get(0).checked ? "1" : "0",
        default: a.find('input[name=default]').get(0).checked ? "1" : "0",
        css:a.find('code').text()
      }
      GMgetValue('csslist', JSON.stringify(defaultCSSlist))
      .then((ag)=>{
        csslist = JSON.parse(ag);
        csslist[a.children().first().data('pattern')] = c;
        GMsetValue('csslist', JSON.stringify(csslist));
      });
    }

    function editButton(evt) {
      let a = $(evt.target).parent(),
        b;
      b = `<input type="text" name="pattern" value="${a.children().first().data('pattern')}">
           <input type="text" name="cssname" value="${a.children().first().text()}">`;
      a.find('button[name=saveCSS],code,pre').attr('style', 'display:inline-block;');
      a.find('button[name=saveCSS]').one('click', saveButton);
      a.children().first().replaceWith(b);
    }

    function deleteButton(evt) {
      let a = $(evt.target).parent();
      GMgetValue('csslist',JSON.stringify(defaultCSSlist))
      .then((ag)=>{
        ag = JSON.parse(ag);
        delete ag[a.children().first().data('pattern')];
        GMsetValue('csslist', JSON.stringify(ag));
        a.remove();
      });
    }

    function addButton(evt) {
      let t = new Date().getTime(),
        a = '',
        b;
      a = `<li>
        <input type="text" name="pattern" placeholder="match pattern">
        <input type="text" name="cssname" placeholder="name">
        <label for="csslist${t}chbx1">
          <input id="csslist${t}chbx1" type="checkbox" name="default" >默认CSS
        </label>
        <label for="csslist${t}chbx2">
          <input id="csslist${t}chbx2" type="checkbox" name="enable" >特定CSS
        </label>
        <button name="saveCSS" style="display:inline-block;">保存</button>
        <button name="editCSS">编辑CSS</button>
        <button name="deleteCSS">删除CSS</button>
        <button name="addCSS">新增</button>
        <br><pre><code id="csslist${t}" contenteditable="true" style="display:inline-block;" class="language-css"></code></pre>
        </li>`;
      b = $(a);
      $(evt.target).parent().after(b);
      $(b).children('button[name=editCSS]').on('click', editButton);
      $(b).children('button[name=deleteCSS]').on('click', deleteButton);
      $(b).children('button[name=addCSS]').on('click', addButton);
      $(b).children('button[name=saveCSS]').on('click', saveButton);
    }
    makeList();
  }
  //载入页面
  (() => {
    (typeof GM_registerMenuCommand === 'function') ? TMBlackList(): GMBlackList();
    setTimeout(() => {
      pageFirstLoad = false;
    }, 700);
  })();

})();
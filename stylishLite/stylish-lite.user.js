// ==UserScript==
// @name               Stylish Lite
// @name:zh-CN         Stylish 轻捷
// @namespace          https://greasyfork.org/zh-CN/users/104201
// @icon               data:img/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACCzIhnAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAFVBMVEUAAAA0mNsuzHHnTDw0mNvznBL////Mp1gEAAAAAnRSTlMAQABPjKgAAAABYktHRAZhZrh9AAAAB3RJTUUH4QwXBjotfQkeHgAAAElJREFUWMPtyzERgEAQBLBjwAAOGCy8BQTQ4N8KBvYovyHpU2d2VK0jK0VRFEWZW1pKU5Y9+yjblSmK8tPSU3J5sltRFEVR5pYXL1PRF3j4eAwAAAAASUVORK5CYII=
// @version            0.1
// @description        Install and Manage user styles,Just like Stylish.
// @description:zh-CN  像Stylish一样:安装和管理用户样式
// @author             黄盐(Foowon)
// @include            *
// @noframes
// @require            https://cdn.bootcss.com/zepto/1.2.0/zepto.min.js
// @grant              unsafeWindow
// @run-at             document-start
// @grant              GM_setValue
// @grant              GM_getValue
// @grant              GM_openInTab
// @grant              GM_registerMenuCommand
// @grant              GM_unregisterMenuCommand
// @grant              GM_xmlhttpRequest
// ==/UserScript==
/* jshint esversion: 6 */
;
'use strict';
//========如果你一定要用 Greasymonkey 可以把 28 行注释打开,然后把 第 29 行注释掉.
//然后 把脚本所有的 GM_getValue 替换为 await GM.getValue, 所有的 GM_setValue 替换为 await.setValue 或许可用...
//推荐 安装Tampermonkey 使用脚本.
// (async () => {
(function () {

//===============PART ① Add Styles To Tabs======================================//
  const applyCssId = 'stylishLite';const SLSpliter = '\n<<<===SL===>>>\n';
  const ruleReg = /(url|url-prefix|domain|regexp)\(['"]?.*\)/;
  const blockBeginReg = /@\s*(-moz-document|media).+/g;
  const blockEndReg = /\}[^{]*\}/g;
  // parser: use to process rawText form userstyles.org/styles/*
  // use to save styles in manage panel
  let parser={
    css:'',
    partEndReg: /\}[^{]*\}/,
    partBeginReg: /@-moz-document.+\n\{\n/,
    ruleBeginReg: /@-moz-document /,
    ruleLineReg: /@-moz-document.+/,
    matchReg: /(url-prefix|regexp|domain)\((\S)+\)/g,
    ruleReg: /(url|url-prefix|regexp|domain)\((\S)+\)/g,
    ruleTextPreReg: /(url|url-prefix|regexp|domain)\(('|")?/,
    ruleTextEndReg: /('|")?\)/,
    //convert userstyles.org mozilla document format to SL format(my script format)
    moz2SL: function(mozString){
      let string = mozString,
      begins = parser.getIndexs(string,blockBeginReg),
      ends = parser.getIndexs(string,blockEndReg);
      if(!begins.indexs.length) return [string];

      let bidxs = begins.indexs,
      bmches = begins.matches,
      eidxs = ends.indexs,
      emches = ends.matches;
      if(bidxs.length !== eidxs.length){
        //这里只是修补了 [一重嵌套] 问题,更多层的嵌套情况就可能会出错
        if(bidxs.length - eidxs.length > 1) {
          console.info('[Stylish Lite Error]:Parse Mozilla Format Document Error');
          return [string];
        }
        for(let i in emches){
          if(emches[i].match(/\}/g).length>2){
            let p1 = emches[i].indexOf('}',1);
            let n1 = emches[i].slice(0,p1+1);
            emches.splice(i,1,n1,emches[i].slice(p1));
            eidxs.splice(i,1,eidxs[i],eidxs[i]+n1.length);
          }
        }
      }
      let tmp = [];
      for(let i in eidxs){
        tmp[i] = eidxs[i] + ends.matches[i].length;
      }
      eidxs = tmp;
      let blocks = [];
      blocks.push(string.slice(0,bidxs[0]).trim());
      let start = bidxs[0],
      end = eidxs[0];
      for(let i in bmches){
        if(bidxs[parseInt(i)+1]){
          if(bmches[parseInt(i)+1].match(ruleReg)){
            blocks.push(string.slice(start, end).trim());
            blocks.push(string.slice(end,bidxs[parseInt(i)+1]).trim());
            start = bidxs[parseInt(i)+1];
            end = eidxs[parseInt(i)+1];
          }else{
            end = eidxs[parseInt(i)+1];
          }
        }else{
          if(bmches[i].match(ruleReg)){
            blocks.push(string.slice(start, end).trim());
            blocks.push(string.slice(end).trim());
          }else{
            blocks.push(string.slice(start).trim());
          }
        }
      }
      // delete blank block
      tmp = [];
      for(let i in blocks){
        if(/\S/.test(blocks[i])) tmp.push(blocks[i]);
      }
      return tmp.join(SLSpliter);
    },
    //delete repeat value
    unique: function(arr){
      let a = {},
      b = [];
      for(let i in arr){
        if(!a[arr[i]]) {
          a[arr[i]] = true;
          b.push(arr[i]);
        }
      }
      return b;
    },
    //concat all matched css
    concat: function(cssArr){
      this.css = '';
      for(let i = 0; i < cssArr.length; i++){
        this.css += getCss(cssArr[i]);
      }
      return this.css;
    },
    //SLString from moz2SL or form GM_getValue
    split: function(SLString){
      return SLString.split(SLSpliter);
    },
    getIndexs: function(raw, searchRegexp/*global regexp*/){
      if(!raw || !/\S/.test(raw)) return{indexs:[],matches:[]}; //blank string
      let matches = raw.match(searchRegexp);
      if(!matches) return {indexs:[],matches:[]}; //string widthout rule
      let idx, indexs =[], lastIndex = 0;
      for(let i in matches){
        idx = raw.indexOf(matches[i],lastIndex);
        indexs.push(idx);
        lastIndex = idx+matches[i].length;
      }
      return {
        indexs:indexs,
        matches: matches
      };
    },
    // str: striing block form split(rawStr)
    // @-moz-document rul(....) \n xxxxx....
    getCss: function(str, edit){
      let string = $.trim(str),
      ruleLine = string.match(/@-moz-document.+/);
      if(ruleLine === null) return string;
      let css='',
      rules = ruleLine[0].match(/(url|url-prefix|regexp|domain)\((\S)+\)/g);
      if(edit || parser.checkMatch(rules)) css = string.slice(ruleLine[0].length +2, -2).replace(/\n  /g,'\n');
      return $.trim(css);
    },
    getRule: function(ruleStr){
      return ruleStr.slice(0, ruleStr.indexOf('('));
    },
    getRuleText:function(ruleStr){
      return ruleStr.replace(parser.ruleTextPreReg,'').replace(parser.ruleTextEndReg,'');
    },
    checkMatch: function(rulesArr){
      if(rulesArr === null || rulesArr.length === 0) return true;
      let rule = '',
      ruleText = '',
      isMatch = false;
      LbMatch:{
        for(let i in rulesArr){
          rule = parser.getRule(rulesArr[i]);
          ruleText = parser.getRuleText(rulesArr[i]);
          switch (rule) {
            case 'url':
              if(document.location.href == ruleText){
                isMatch = true;
                break  LbMatch;
              }
              break;
            case 'url-prefix':
              if(document.location.href.indexOf(ruleText) == 0){
                isMatch = true;
                break LbMatch;
              }
              break;
            case 'domain':
              if(document.domain == ruleText || document.domain.substring(document.domain.indexOf(ruleText) + 1) == ruleText){
                isMatch = true;
                break LbMatch;
              }
              break;
            default://regexp
              if(new RegExp(ruleText).test(document.location.href)){
                isMatch = true;
                break LbMatch;
              }
              break;
          }
        }
      }
      return isMatch;
    }
  };
  function apply(){
    let tmp,doc,
      cssText = '',
      matchedStyles = [],
      styles = GM_getValue('styles', {}),
      css = GM_getValue('css', {});
    for(let i in styles){
      if(!styles[i].enable) continue;
      if(parser.checkMatch(styles[i].rule)){
        cssText += `\n/*-------------${i}----------------*/\n`;
        tmp = parser.split(css[i]);
        for(let j in tmp){
          cssText += parser.getCss(tmp[j]);
        }
      }
    }
    addStyle(cssText, applyCssId);
  }
  // this addStyle function is better than GM_addStyle
  function addStyle(cssStr,id='styishLite'){
    try {
      let doc = document.body || document.documentElement;
      $(doc).after($(`<style id="${id}" type="text/css"><!--\n${cssStr}\n--></style>`));
    } catch(e) {
      let head = document.head || document.documentElement;
      $(head).after($(`<style id="${id}" type="text/css"><!--\n${cssStr}\n--></style>`));
    }
  }
  function checkList(key){
    let isApply = true,
    list = GM_getValue('nameList',{}),
    // default name list mode: black
    nameListMode = GM_getValue('nameListMode','black');
    if(list[key]){
      if(nameListMode === 'black') isApply = false;
    }else{
      if(nameListMode === 'white') isApply = false;
    }
    return isApply;
  }
  //(onlist && white list) || (not on list && black list)=> apply()
  if(checkList(location.origin)) apply();

//===============PART ② Action on userstyles.org/styles/**id**/**name** ========//
  const LogoSVG = `<svg width="100%" height="100%" viewbox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g><rect x="0" y="0" width="30" height="30" fill="none"/></g><g><rect fill="#2ecc71" stroke="#000" stroke-width="0" width="47" height="70"  y="0" x="0"/><rect fill="#3498db" stroke="#000" stroke-width="0" x="53" y="30" width="47" height="70"/><rect fill="#e74c3c" stroke="#000" stroke-width="0" x="53" y="0" width="47" height="25"/><rect fill="#f39c12" stroke="#000" stroke-width="0" x="0" y="75" width="47" height="25"/><text fill="#ffffff" stroke-width="0" x="20" y="57"  font-size="50" font-family="'Courier New', Courier, monospace" text-anchor="start" xml:space="preserve" font-weight="bold" transform="matrix(1.67,0,0,1.9,-35,-45) " stroke="#000">S</text><text fill="#ffffff" stroke-width="0" x="53" y="71"  font-size="48" font-family="'Courier New', Courier, monospace" text-anchor="start" xml:space="preserve" font-weight="bold" transform="matrix(1.65,0,0,1.9,-35,-45) " stroke="#000">L</text></g></svg>`;

  //works on https://userstyles.org/styles/*
  let utorg = {
    locationReg: /https:\/\/userstyles.org\/styles\/\d+\/.*/,
    siteMatched: function(){
      return this.locationReg.test(location.href);
    },
    createButton: function(){
      if( !$ && ($('div#install_style_button').length<1 || $('div#buttons').length < 1)) {
        setTimeout(utorg.createButton, 500);
        return;
      }else{
        let tar = $('div#buttons'),
          styles = GM_getValue('styles',{}),
          name = $('h1[id=stylish-description]').text(),
          version = $('div#infomation_value_left').last().text(),
          buttonClass = '',
          buttonText = '';
        if(styles[name]){
          if(styles[name].version === version){
            buttonClass = 'slCheck';
            buttonText = 'Installed';
          }else{
            buttonClass = 'slRefresh';
            buttonText = 'Update Style';
          }
        }else{
          buttonClass = 'slDownload';
          buttonText = 'Install Style';
        }

        if(tar.length ===0){
          setTimeout(utorg.createButton, 500);
          return;
        }
        let a = $('div#buttons').children().first().before(`<div id="SLInstall" style="display:flex;flex-direction:row;align-items:center;justify-content:center;border-radius:4px;background-color:#2ECC71;box-shadow:0 6px 16px 0 rgba(80, 178, 243, 0.35);color:white;font-size:16px;cursor:pointer;font-weight:bold;width:173px;height:48px;margin-left:9px;"><div id="SLBtnIcon" class="${buttonClass}" style="font:30px;margin-right:10px;"></div><div>${buttonText}</div></div>`);

        $('#SLInstall').off();
        $('#SLInstall').on('click', utorg.install);
      }
    },
    // get raw text from userstyles.org
    getRawCss: function(){
      return $('#stylish-code').val();
    },
    install: function(){
      let rawCss = utorg.getRawCss();
      if(!rawCss){
        setTimeout(utorg.install, 500);
        return;
      }
      let ruleLines = rawCss.match(parser.ruleLineReg),
      name = $('h1[id=stylish-description]').text(),
      styles = GM_getValue('styles', {}),
      css = GM_getValue('css', {});
      if(name.length < 1) return false;
      GM_setValue('styles',styles);
      css[name] = $.trim(parser.moz2SL(rawCss));
      GM_setValue('css',css);
      stylesObj = {
        name: name,
        rule: parser.unique(ruleLines.join('\n').match(parser.ruleReg)),
        enable: true,
        version: $('div#infomation_value_left').last().text(),
        stylesOrgId: location.href.split('/')[4]
      };
      styles[name] = stylesObj;
      $('#SLInstall').text('Installed');
      $('#SLBtnIcon').attr('class','slCheck');
    }
  };
  //https://userstyles.org/styles
  $(()=>{
    if(utorg.siteMatched()){
      addStyle(SLFontCSS,'SLFontCSS');
      utorg.createButton();
    }
  });

//===============PART ③ Manage Styles ==========================================//
  const SLFontCSS = `
    /* =================== SLClass ==================== */
    @font-face {font-family: 'SL';src: url(data:application/font-woff;charset=utf-8;base64,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) format('woff');}
    .slSpace::before       {content:' ';font-family:SL;display:inline-block;width:30px;}
    .slAdd::before         {content:'A';font-family:SL;}
    .slMinus::before       {content:'B';font-family:SL;}
    .slCheck::before       {content:'C';font-family:SL;}
    .slClose::before       {content:'D';font-family:SL;}
    .slCopy::before        {content:'E';font-family:SL;}
    .slDeleteNormal::before{content:'F';font-family:SL;}
    .slEdit::before        {content:'G';font-family:SL;}
    .slSave::before        {content:'H';font-family:SL;}
    .slOn::before          {content:'I';font-family:SL;color:#2ACD71;}
    .slOff::before         {content:'J';font-family:SL;color:#E84A39;}
    .slCube::before        {content:'K';font-family:SL;}
    .slCubes::before       {content:'M';font-family:SL;}
    .slDownload::before    {content:'N';font-family:SL;}
    .slRefresh::before     {content:'O';font-family:SL;}
    .slLink::before        {content:'P';font-family:SL;}
    .slList::before        {content:'Q';font-family:SL;}
    .slReturn::before      {content:'R';font-family:SL;}
    .slTag::before         {content:'T';font-family:SL;padding-right:10px;}
    .slMagic::before       {content:'U';font-family:SL;}
    .slCode::before        {content:'V';font-family:SL;}
    .slPin::before         {content:'W';font-family:SL;}
    .slApp::before         {content:'X';font-family:SL;}
    .slVerDots::before     {content:'Y';font-family:SL;}
    .slDeleteBold::before  {content:'Z';font-family:SL;}
    .slVisible::before     {content:'a';font-family:SL;}
    .slHidden::before      {content:'b';font-family:SL;}
    .slMidThinger::before  {content:'c';font-family:SL;}
    /* ===================SLClass End==================== */
  `;
  //======== prism ===  css_beautfy =========
    /* PrismJS 1.9.0 http://prismjs.com/download.html?themes=prism-solarizedlight&languages=css */
    var _self="undefined"!=typeof window?window:"undefined"!=typeof WorkerGlobalScope&&self instanceof WorkerGlobalScope?self:{},Prism=function(){var e=/\blang(?:uage)?-(\w+)\b/i,t=0,n=_self.Prism={manual:_self.Prism&&_self.Prism.manual,disableWorkerMessageHandler:_self.Prism&&_self.Prism.disableWorkerMessageHandler,util:{encode:function(e){return e instanceof r?new r(e.type,n.util.encode(e.content),e.alias):"Array"===n.util.type(e)?e.map(n.util.encode):e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/\u00a0/g," ")},type:function(e){return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]},objId:function(e){return e.__id||Object.defineProperty(e,"__id",{value:++t}),e.__id},clone:function(e){var t=n.util.type(e);switch(t){case"Object":var r={};for(var a in e)e.hasOwnProperty(a)&&(r[a]=n.util.clone(e[a]));return r;case"Array":return e.map(function(e){return n.util.clone(e)})}return e}},languages:{extend:function(e,t){var r=n.util.clone(n.languages[e]);for(var a in t)r[a]=t[a];return r},insertBefore:function(e,t,r,a){a=a||n.languages;var l=a[e];if(2==arguments.length){r=arguments[1];for(var i in r)r.hasOwnProperty(i)&&(l[i]=r[i]);return l}var o={};for(var s in l)if(l.hasOwnProperty(s)){if(s==t)for(var i in r)r.hasOwnProperty(i)&&(o[i]=r[i]);o[s]=l[s]}return n.languages.DFS(n.languages,function(t,n){n===a[e]&&t!=e&&(this[t]=o)}),a[e]=o},DFS:function(e,t,r,a){a=a||{};for(var l in e)e.hasOwnProperty(l)&&(t.call(e,l,e[l],r||l),"Object"!==n.util.type(e[l])||a[n.util.objId(e[l])]?"Array"!==n.util.type(e[l])||a[n.util.objId(e[l])]||(a[n.util.objId(e[l])]=!0,n.languages.DFS(e[l],t,l,a)):(a[n.util.objId(e[l])]=!0,n.languages.DFS(e[l],t,null,a)))}},plugins:{},highlightAll:function(e,t){n.highlightAllUnder(document,e,t)},highlightAllUnder:function(e,t,r){var a={callback:r,selector:'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'};n.hooks.run("before-highlightall",a);for(var l,i=a.elements||e.querySelectorAll(a.selector),o=0;l=i[o++];)n.highlightElement(l,t===!0,a.callback)},highlightElement:function(t,r,a){for(var l,i,o=t;o&&!e.test(o.className);)o=o.parentNode;o&&(l=(o.className.match(e)||[,""])[1].toLowerCase(),i=n.languages[l]),t.className=t.className.replace(e,"").replace(/\s+/g," ")+" language-"+l,t.parentNode&&(o=t.parentNode,/pre/i.test(o.nodeName)&&(o.className=o.className.replace(e,"").replace(/\s+/g," ")+" language-"+l));var s=t.textContent,g={element:t,language:l,grammar:i,code:s};if(n.hooks.run("before-sanity-check",g),!g.code||!g.grammar)return g.code&&(n.hooks.run("before-highlight",g),g.element.textContent=g.code,n.hooks.run("after-highlight",g)),n.hooks.run("complete",g),void 0;if(n.hooks.run("before-highlight",g),r&&_self.Worker){var u=new Worker(n.filename);u.onmessage=function(e){g.highlightedCode=e.data,n.hooks.run("before-insert",g),g.element.innerHTML=g.highlightedCode,a&&a.call(g.element),n.hooks.run("after-highlight",g),n.hooks.run("complete",g)},u.postMessage(JSON.stringify({language:g.language,code:g.code,immediateClose:!0}))}else g.highlightedCode=n.highlight(g.code,g.grammar,g.language),n.hooks.run("before-insert",g),g.element.innerHTML=g.highlightedCode,a&&a.call(t),n.hooks.run("after-highlight",g),n.hooks.run("complete",g)},highlight:function(e,t,a){var l=n.tokenize(e,t);return r.stringify(n.util.encode(l),a)},matchGrammar:function(e,t,r,a,l,i,o){var s=n.Token;for(var g in r)if(r.hasOwnProperty(g)&&r[g]){if(g==o)return;var u=r[g];u="Array"===n.util.type(u)?u:[u];for(var c=0;c<u.length;++c){var h=u[c],f=h.inside,d=!!h.lookbehind,m=!!h.greedy,p=0,y=h.alias;if(m&&!h.pattern.global){var v=h.pattern.toString().match(/[imuy]*$/)[0];h.pattern=RegExp(h.pattern.source,v+"g")}h=h.pattern||h;for(var b=a,k=l;b<t.length;k+=t[b].length,++b){var w=t[b];if(t.length>e.length)return;if(!(w instanceof s)){h.lastIndex=0;var _=h.exec(w),P=1;if(!_&&m&&b!=t.length-1){if(h.lastIndex=k,_=h.exec(e),!_)break;for(var A=_.index+(d?_[1].length:0),j=_.index+_[0].length,x=b,O=k,N=t.length;N>x&&(j>O||!t[x].type&&!t[x-1].greedy);++x)O+=t[x].length,A>=O&&(++b,k=O);if(t[b]instanceof s||t[x-1].greedy)continue;P=x-b,w=e.slice(k,O),_.index-=k}if(_){d&&(p=_[1].length);var A=_.index+p,_=_[0].slice(p),j=A+_.length,S=w.slice(0,A),C=w.slice(j),M=[b,P];S&&(++b,k+=S.length,M.push(S));var E=new s(g,f?n.tokenize(_,f):_,y,_,m);if(M.push(E),C&&M.push(C),Array.prototype.splice.apply(t,M),1!=P&&n.matchGrammar(e,t,r,b,k,!0,g),i)break}else if(i)break}}}}},tokenize:function(e,t){var r=[e],a=t.rest;if(a){for(var l in a)t[l]=a[l];delete t.rest}return n.matchGrammar(e,r,t,0,0,!1),r},hooks:{all:{},add:function(e,t){var r=n.hooks.all;r[e]=r[e]||[],r[e].push(t)},run:function(e,t){var r=n.hooks.all[e];if(r&&r.length)for(var a,l=0;a=r[l++];)a(t)}}},r=n.Token=function(e,t,n,r,a){this.type=e,this.content=t,this.alias=n,this.length=0|(r||"").length,this.greedy=!!a};if(r.stringify=function(e,t,a){if("string"==typeof e)return e;if("Array"===n.util.type(e))return e.map(function(n){return r.stringify(n,t,e)}).join("");var l={type:e.type,content:r.stringify(e.content,t,a),tag:"span",classes:["token",e.type],attributes:{},language:t,parent:a};if(e.alias){var i="Array"===n.util.type(e.alias)?e.alias:[e.alias];Array.prototype.push.apply(l.classes,i)}n.hooks.run("wrap",l);var o=Object.keys(l.attributes).map(function(e){return e+'="'+(l.attributes[e]||"").replace(/"/g,"&quot;")+'"'}).join(" ");return"<"+l.tag+' class="'+l.classes.join(" ")+'"'+(o?" "+o:"")+">"+l.content+"</"+l.tag+">"},!_self.document)return _self.addEventListener?(n.disableWorkerMessageHandler||_self.addEventListener("message",function(e){var t=JSON.parse(e.data),r=t.language,a=t.code,l=t.immediateClose;_self.postMessage(n.highlight(a,n.languages[r],r)),l&&_self.close()},!1),_self.Prism):_self.Prism;var a=document.currentScript||[].slice.call(document.getElementsByTagName("script")).pop();return a&&(n.filename=a.src,n.manual||a.hasAttribute("data-manual")||("loading"!==document.readyState?window.requestAnimationFrame?window.requestAnimationFrame(n.highlightAll):window.setTimeout(n.highlightAll,16):document.addEventListener("DOMContentLoaded",n.highlightAll))),_self.Prism}();"undefined"!=typeof module&&module.exports&&(module.exports=Prism),"undefined"!=typeof global&&(global.Prism=Prism);
    Prism.languages.css={comment:/\/\*[\s\S]*?\*\//,atrule:{pattern:/@[\w-]+?.*?(?:;|(?=\s*\{))/i,inside:{rule:/@[\w-]+/}},url:/url\((?:(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,selector:/[^{}\s][^{};]*?(?=\s*\{)/,string:{pattern:/("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},property:/[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,important:/\B!important\b/i,"function":/[-a-z0-9]+(?=\()/i,punctuation:/[(){};:]/},Prism.languages.css.atrule.inside.rest=Prism.util.clone(Prism.languages.css),Prism.languages.markup&&(Prism.languages.insertBefore("markup","tag",{style:{pattern:/(<style[\s\S]*?>)[\s\S]*?(?=<\/style>)/i,lookbehind:!0,inside:Prism.languages.css,alias:"language-css",greedy:!0}}),Prism.languages.insertBefore("inside","attr-value",{"style-attr":{pattern:/\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,inside:{"attr-name":{pattern:/^\s*style/i,inside:Prism.languages.markup.tag.inside},punctuation:/^\s*=\s*['"]|['"]\s*$/,"attr-value":{pattern:/.+/i,inside:Prism.languages.css}},alias:"language-css"}},Prism.languages.markup.tag));
      //======== css_beautfy min.js=======
    (function(){function a(R,v){function S(U,T){return U===undefined?T:U}v=v||{};var M=v.indent_size||4;var r=v.indent_char||" ";var K=S(v.selector_separator_newline,true);var H=S(v.end_with_newline,false);var F=S(v.newline_between_rules,true);var k=S(v.newline_between_properties,true);var L=S(v.newline_before_open_brace,false);var B=S(v.newline_after_open_brace,true);var s=S(v.newline_before_close_brace,true);if(typeof M==="string"){M=parseInt(M,10)}var q=/^\s+$/;var u=/[\w$\-_]/;var A=-1,z;var t=0;function e(){z=R.charAt(++A);return z||""}function i(T){var U=A;if(T){C()}result=R.charAt(A+1)||"";A=U-1;e();return result}function D(U){var T=A;while(e()){if(z==="\\"){e()}else{if(U.indexOf(z)!==-1){break}else{if(z==="\n"){break}}}}return R.substring(T,A+1)}function j(V){var U=A;var T=D(V);A=U-1;e();return T}function C(){var T="";while(q.test(i())){e();T+=z}return T}function n(){var T="";if(z&&q.test(z)){T=z}while(q.test(e())){T+=z}return T}function Q(T){var U=A;T=i()==="/";e();while(e()){if(!T&&z==="*"&&i()==="/"){e();break}else{if(T&&z==="\n"){return R.substring(U,A)}}}return R.substring(U,A)+z}function h(T){return R.substring(A-T.length,A).toLowerCase()===T}function I(){for(var T=A+1;T<R.length;T++){var U=R.charAt(T);if(U==="{"){return true}else{if(U===";"||U==="}"||U===")"){return false}}}return false}var b=R.match(/^[\t ]*/)[0];var c=new Array(M+1).join(r);var l=0;var N=0;function p(){l++;b+=c}function g(){l--;b=b.slice(0,-M)}var O={};O["{"]=function(T){L?w.push("\n"):O.singleSpace();w.push(T);B?O.newLine():O.singleSpace()};O["}"]=function(T){s?O.newLine():O.singleSpace();w.push(T);O.newLine()};O._lastCharWhitespace=function(){return q.test(w[w.length-1])};O.newLine=function(T){if(!T){O.trim()}if(w.length){w.push("\n")}if(b){w.push(b)}};O.singleSpace=function(){if(w.length&&!O._lastCharWhitespace()){w.push(" ")}};O.trim=function(){while(O._lastCharWhitespace()){w.pop()}};var w=[];if(b){w.push(b)}var G=false;var m=false;var d="";var E="";while(true){var y=n();var x=y!=="";var J=y.indexOf("\n")!==-1;E=d;d=z;if(!z){break}else{if(z==="/"&&i()==="*"){var f=h("");O.newLine();w.push(Q());O.newLine();if(f){O.newLine(true)}}else{if(z==="/"&&i()==="/"){if(!J&&E!=="{"){O.trim()}O.singleSpace();w.push(Q());O.newLine()}else{if(z==="@"){if(x){O.singleSpace()}w.push(z);var o=j(": ,;{}()[]/='\"");if(o.match(/[ :]$/)){e();o=D(": ").replace(/\s$/,"");w.push(o);O.singleSpace()}o=o.replace(/\s$/,"");if(o in a.NESTED_AT_RULE){N+=1;if(o in a.CONDITIONAL_GROUP_RULE){m=true}}}else{if(z==="{"){if(i(true)==="}"){C();e();O.singleSpace();w.push("{}");O.newLine();if(F&&l===0){O.newLine(true)}}else{p();O["{"](z);if(m){m=false;G=(l>N)}else{G=(l>=N)}}}else{if(z==="}"){g();O["}"](z);G=false;if(N){N--}if(F&&l===0){O.newLine(true)}}else{if(z===":"){C();if((G||m)&&!(h("&")||I())){w.push(":");O.singleSpace()}else{if(i()===":"){e();w.push("::")}else{w.push(":")}}}else{if(z==='"'||z==="'"){if(x){O.singleSpace()}w.push(D(z))}else{if(z===";"){w.push(z);k?O.newLine():O.singleSpace()}else{if(z==="("){if(h("url")){w.push(z);C();if(e()){if(z!==")"&&z!=='"'&&z!=="'"){w.push(D(")"))}else{A--}}}else{t++;if(x){O.singleSpace()}w.push(z);C()}}else{if(z===")"){w.push(z);t--}else{if(z===","){w.push(z);C();if(!G&&K&&t<1){O.newLine()}else{O.singleSpace()}}else{if(z==="]"){w.push(z)}else{if(z==="["){if(x){O.singleSpace()}w.push(z)}else{if(z==="="){C();z="=";w.push(z)}else{if(x){O.singleSpace()}w.push(z)}}}}}}}}}}}}}}}}var P=w.join("").replace(/[\r\n\t ]+$/,"");if(H){P+="\n"}return P}a.NESTED_AT_RULE={"@page":true,"@font-face":true,"@keyframes":true,"@media":true,"@supports":true,"@document":true};a.CONDITIONAL_GROUP_RULE={"@media":true,"@supports":true,"@document":true};if(typeof define==="function"&&define.amd){define([],function(){return{css_beautify:a}})}else{if(typeof exports!=="undefined"){exports.css_beautify=a}else{if(typeof window!=="undefined"){window.css_beautify=a}else{if(typeof global!=="undefined"){global.css_beautify=a}}}}}());
  let cmdOnOff=null,
  //manage styles panel
  ui = {
    ruleLiHTML: `
      <li>
        <select name="ruletype" id="">
          <option value="url">URL</option>
          <option value="url-prefix">URL Prefix</option>
          <option value="domain">domain</option>
          <option value="regexp">Regular Expresion</option>
        </select>
        <input type="text" value="">
        <i class="slDeleteNormal" name="deleteRule" title="Delete Rule"></i>
        <i class="slAdd" name="addRule" title = "Add Rule"></i>
      </li>
    `,
    codeBlockDivHTML: `
      <div>
        <li name="number">Block %%BLOCKNUMBER%%</li>
        <pre><code name="applyTo" contenteditable="true" class="language-css">%%CSSCODE%%</code></pre>
        <div name="rules">
          <div name="applyto">
            <div><b>Apply To:</b></div>
            <div>
            %%ruleLiHTML%%
            </div>
          </div>
        </div>
        <i name="deletePart" title="Delete Code Block"><b class="slDeleteBold"> </b><b class="slCode"> </b></i>
        <i name="addPart" title="Add Code Block"><b class="slAdd"> </b><b class="slCode"> </b></i>
        <i name="beautify" title="Beautify Code"><b class="slMagic"> </b><b class="slCode"> </b></i>
      </div>
    `,
    SLMenuDivHTML:`
      <div id="SLMenu">
        <span id="SLLogo" title="Go To Userstyles.org"><a href="https://userstyles.org/" target="_blank">%%LOGOSVG%%</a></span>
        <span id="SLAbout" class="slAdd" name="addStyle" title="Add New Style"></span>
        <span id="SLReturn" class="slReturn" name="return" title="Return"></span>
        <span id="SLClose" class="slClose" name="close" title="Close"></span>
      </div>
    `,
    SLEditDivHTML:`
      <div id="SLEdit">
        <div name="setting">
          <h1>Edit Style</h1>
          <li contenteditable="true" name="editingStyleName" data-name="" data-version="" data-stylesOrgId=""></li>
          <input type="checkbox" id="enableStyle"><label for="enableStyle" class="slOn" title="Enable/Disabled This Style"> </label><i name="saveStyle" class="slSave" title="Save Changes"> </i>
        </div>
        <div name="codeblocks">
        </div>
      </div>
    `,
    makeList: function(){
      let styles = GM_getValue('styles',{}),
      k = 0,
      text = `
        <div id="SLList">
          <div name="tool">
            <input type="text" id="slFilter" placeholder="Search Styles By Name">
            <span id="slHideOn" name="filterbtn" title="Hide Enabled Styles"><b class="slHidden"></b><b class="slSpace"></b><b class="slOn"></b></span>
            <span id="slHideOff" name="filterbtn" title="Hide Disabled Styles"><b class="slHidden"></b><b class="slSpace"></b><b class="slOff"></b></span>
            <span id="slShowAll" name="filterbtn" title="Show All Styles"><b class="slVisible"></b> <b class="slOn"></b><b class="slOff"></b></span>
          </div>
          <div name="list">`;
      for(let i in styles){
        text += `
            <div>
              <li name="styleName" data-version="${styles[i].version}" data-stylesOrgId="${styles[i].stylesOrgId}" class="slTag">${i}</li>
              <li name="applyTo"><span><b>Apply To:</b></span>${styles[i].rule.length ? ui.concatRules(styles[i].rule) : '<span>All</span>'}</li>
              <li>
                <i name="edit" class="slEdit"title="Edit" title="Edit"></i>
                <input type="checkbox" name="enableThis" id="chbx${k}" ${styles[i].enable ? "checked" : ''}><label for="chbx${k++}" class="${styles[i].enable ? 'slOn' : 'slOff'}" title="Enable/Disable"></label>
                <i name="delete" class="slDeleteNormal" title="Delete"></i>
                <i name="update" data-usoid="${styles[i].stylesOrgId ? styles[i].stylesOrgId : ''}" style="visibility:${styles[i].stylesOrgId ? 'visible' : 'hidden'};" class="slLink" title="Open This Style's Home Page"></i>
              </li>
            </div>
              `;
      }
      return text +`
          </div>
        </div>`;
    },
    makePanel: function(){
      if($('#SLManage,#SLManageCss')) $('#SLManage,#SLManageCss').remove();
      let text = `
        <style id="SLManageCss" type="text/css">
          ${SLFontCSS}
          html,body{margin:0;padding:0;}
          #SLManage{z-index:999999;position:fixed;top:0;left:0;width:100%;height:100%;font-size:14px;}
          #SLManage li{list-style-type:none;}
          #SLManage li:hover,#SLManage li[name="styleName"]:hover{font-style:italic;}
          #SLManage h1{color:#268BD2;}
          #SLManage input[type=checkbox]{display:none;}
          #SLMenu span{display:inline-block;float:left;}
          #SLLogo svg{border-radius:10px;width:60px;height:60px;margin:10px;}
          #SLMenu span:not(#SLLogo){width:40px;height:40px;padding:10px;margin:10px 0;color:#3199DC;font-size:40px;}
          #SLMenu span:hover{cursor:pointer;color:#2ACD71!important;}
          #SLManage #SLMenu{position:absolute;top:0;left:0;width:25%;min-width:200px;height:80px;padding:0 10px;background:#001f3f;color:white!important;}
          #SLList,#SLEdit{width:100%;height:100%;}
          /*SLList*/
          #SLManage div[name="list"]>div{border-bottom:2px dashed #839594;padding-bottom:10px;}
          #SLManage li[name="styleName"]{font:25px bolder;color:#3199DC;}
          #SLManage li[name="applyTo"]{margin:3px 3px 3px 10px;}
          #SLManage li[name="applyTo"] span{color:#657B83;margin:2px 3px;font-size:14px;background-color:#657b8333;border-radius:5px;}
          #SLManage li[name="applyTo"] span:first-child{background-color:transparent;}
          #slFilter{width:80%;font-size:20px;padding:4px 5px;}
          /*SLEdit*/
          #SLList>div,#SLEdit>div{height:100%;position:fixed;top:0;padding:10px;margin:0;display:inline-block;background:#EEE8D5;}
          #SLManage div[name="tool"],#SLManage div[name="setting"]{width:25%;left:0;margin-top:80px!important;}
          #SLManage div[name="tool"]>span{display:block;width:80%;font-size:23px;text-align:center;padding:0 5px;margin:6px 0;}
          #SLManage div[name="list"],#SLManage div[name="codeblocks"]{width:75%;right:0;border-left:2px dashed #839594;overflow-y:auto;}
          #SLManage li[name="editingStyleName"]{padding:2px 5px;width:80%;}
          #SLManage li[name="number"]{padding:2px 10px;display:inline-block;}
          #SLManage i,#SLManage label{padding:0 15px;margin:2px 5px;font-size:20px;font-style:normal;}
          #SLManage i:hover,#SLManage label:hover,#SLManage div[name="tool"]>span:hover{background:#3199DC;cursor:pointer;}
          #SLManage i,#SLManage label,#SLManage select,#SLManage input[type=text],#SLManage li[name="editingStyleName"],#SLManage li[name="number"],#SLManage div[name="tool"]>span{border:1px solid #839594;border-radius:5px;}
          #SLEdit pre{width:90%;margin-left:50px;overflow:auto;height:300px;resize:vertical;border:1px solid #839594;}
          #SLEdit code{display:block;width:100%;height:100%;}
          #SLManage div[name="applyto"]{white-space:nowrap;}
          #SLManage div[name=applyto] div:first-child{display:inline-block;width:15%;vertical-align:top;text-align:center;padding-right:15px;padding:3px}
          #SLManage div[name=applyto] div:nth-child(2){display:inline-block;width:80%;}
          #SLManage div[name=applyto] li{white-space:nowrap;width:100%;}
          #SLManage div[name=applyto] select{width:20%;padding:4px 0;}
          #SLManage div[name=applyto] input{width:60%;padding:4px 5px;}
          #SLManage div[name=codeblocks]>div{border-bottom:2px dashed #839594;padding-bottom:5px;}

          #SLEdit,span#SLReturn{display: none;}

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
        </style>
        `;
      text += `
        <div id="SLManage">
          ${ui.SLMenuDivHTML.replace('%%LOGOSVG%%',LogoSVG.replace('WIDTH','width="60px"').replace('HIGHT','height="60px"'))}
          ${ui.makeList()}
          ${ui.SLEditDivHTML}
        </div>`;
      $('body').append(text);
      $('#SLManage').on('click',ui.click);
      $('input[name=enableThis],input#enableStyle').on('change',ui.enableButton);
      //styles filter
      $('#slFilter').bind('input propertychange',()=>{
        $('div[name=list]>div').show();
        $('li[name=styleName]').each((idx,item)=>{
          if(!$(item).text().match(new RegExp($('#slFilter').val(), "i"))) $(item).parent().hide();
        });
      });
    },
    editButton: function(evt,mark = ''){
      let a = $(evt.target).parent().parent(),
      tarLi = a.find('li[name=styleName]');
      if(mark === 'menuAdd') tarLi = $('null');
      let name = tarLi.text() || null,
      version = tarLi.data('version') || null,
      stylesOrgId = tarLi.data('stylesOrgId') || null,
      enable = a.find('input[name=enableThis]').prop('checked') || true,
      cssRaw = GM_getValue('css',{})[name] || '',
      blocks = parser.split(cssRaw),
      k = 1,tmp = null,tmp1 = null,
      html = '';
      for(let i in blocks){
        html +=`
            <div>
              <li name="number">Block ${k++}</li>
              <pre><code name="applyTo" contenteditable="true" class="language-css">${parser.getCss(blocks[i],1)}</code></pre>
              <div name="rules">
                <div name="applyto">
                  <div><b>Apply To:</b></div>
                  <div>
        `;
        tmp = blocks[i].match(parser.ruleLineReg);
        if(tmp){
          tmp = tmp[0].match(parser.ruleReg);
        }else{
          tmp = [''];
        }
        for(let j in tmp){
          tmp1 = parser.getRule(tmp[j]);
          html += ui.ruleLiHTML.replace(`value="${tmp1}"`,`value="${tmp1}" selected="selected"`).replace('<input type="text" value="">',`<input type="text" value="${parser.getRuleText(tmp[j])}">`);
        }
        html +=`  </div>
                </div>
              </div>
              <i name="deletePart" title="Delete Code Block"><b class="slDeleteBold"> </b><b class="slCode"> </b></i>
              <i name="addPart" title="Add Code Block"><b class="slAdd"> </b><b class="slCode"> </b></i>
              <i name="beautify" title="Beautify Code"><b class="slMagic"> </b><b class="slCode"> </b></i>
            </div>`;
      }
      $('#SLList,#SLAbout').hide();
      $('#SLEdit,#SLReturn').show();
      $('li[name=editingStyleName]').data('name',name).data('version',version).data('stylesOrgId',stylesOrgId).text(name);
      $('li[name=editingStyleName]').data('name',name);
      $('#enableStyle').prop('checked',enable);
      $('#enableStyle').next().attr('class',(enable ? 'slOn' : 'slOff'));
      $('div[name=codeblocks]').html(html);
      Prism.highlightAll();
    },
    enableButton: function(evt){
      let name,enable;
      let a = $(evt.target);
      if($(evt.target).attr('id') === 'enableStyle'){
        name = $('li[name=editingStyleName]').text();
      }else{
        name = a.parent().parent().find('li[name=styleName]').text();
      }
      enable = a.prop('checked');
      let styles = GM_getValue('styles',{});
      styles[name].enable = enable;
      GM_setValue('styles', styles);
      if(enable){
        a.next().attr('class','slOn');
      }else{
        a.next().attr('class','slOff');
      }
    },
    deleteButton: function(evt){
      let a = $(evt.target).parent().parent(),
      name = a.find('li[name=styleName]').text(),
      styles = GM_getValue('styles',{}),
      css = GM_getValue('css',{});
      delete styles[name];
      delete css[name];
      GM_setValue('styles', styles);
      GM_setValue('css', css);
      a.remove();
    },
    updateButton: function(evt){
      let link = 'https://userstyles.org/styles/' + $(evt.target).data('usoid');
      GM_openInTab(link,{active:true,insert:true,setParent:true});
    },
    concatRules: function(ruleArr){
      let arr = ruleArr;
      for(let i in arr){
        arr[i] = parser.getRuleText(arr[i]);
      }
      return '<span>'+arr.join(' ,</span><span>')+'</span>';
    },
    saveButton: function(){
      let txt = '',
      blocks = [],
      ruleLine ='',
      ruleLines =[],
      stylesObj = {},
      tarLi = $('li[name=editingStyleName]'),
      name = tarLi.text();
      if(!name.trim()){
        alert('Style Name Can not be Empty !!!');
        return true;
      }
      $('div[name=codeblocks]>div').each((idx,item)=>{
        ruleLine = '';
        $(item).find('input').each((idx1,item1)=>{
          if(/\S/.test($(item1).val())) ruleLine += ' '+$(item1).prev().val()+'("'+($(item1).val())+'")';
        });
        if(/\S/.test(ruleLine)){
          ruleLine = '@-moz-document' + ruleLine;
          txt = $.trim($(item).find('code').html().replace(/<div>|<\/?span[^>]*>/g,'').replace(/<\/div>|<br>/g,'\n'));

          blocks.push(ruleLine +'\n{\n  ' + txt + '\n}');
          ruleLines.push(ruleLine);
        }else{
          blocks.push($.trim($(item).find('code').html().replace(/<div>|<\/?span[^>]*>/g,'').replace(/<\/div>|<br>/g,'\n')));
        }
      });
      let css = GM_getValue('css',{});
      let styles = GM_getValue('styles',{});
      css[name] = blocks.join(SLSpliter);
      GM_setValue('css',css);
      stylesObj = {
          name: name,
          rule: parser.unique(ruleLines.join('\n').match(parser.ruleReg)),
          enable: $('#enableStyle').prop('checked'),
          version: tarLi.data('version'),
          stylesOrgId: tarLi.data('stylesOrgId')
        };
      styles[name] = stylesObj;
      GM_setValue('styles',styles);

      ui.updateULList();
      $('#SLList,#SLAbout').show();
      $('#SLEdit,#SLReturn').hide();
    },
    updateULList: function(){
      let txt = ui.makeList();
      $('#SLList').remove();
      $('#SLEdit').before(txt);
    },
    addRule: function(ele,ruleType = null){
      let a = $(ui.ruleLiHTML);
      ele.parent().after(a);
      if(ruleType) a.find(`option[value="${ruleType}"]`).prop('selected','selected');
    },
    deleteRule: function(ele){
      if(ele.parent().parent().find('li').length > 1)  ele.parent().remove();
    },
    deleteCodeBlock: function(ele){
      if($('div[name=codeblocks]>div').length > 1) $(ele).parent().remove();
    },
    addCodeBlock: function(ele){
      $(ele).parent().after(ui.codeBlockDivHTML.replace('%%BLOCKNUMBER%%','new').replace('%%CSSCODE%%','').replace('%%ruleLiHTML%%',ui.ruleLiHTML));
      Prism.highlightAll();
    },
    beautifyCodeBlock: function(ele){
      ele.parent().find('code').html(css_beautify(ele.parent().find('code').text()));
      Prism.highlightAll();
    },
    click: function(evt){
      function getName(zeptoCol){
        if(zeptoCol.attr('name')){
          return zeptoCol;
        }else{
          return zeptoCol.parent();
        }
      }
      let ele = getName($(evt.target));
      switch (ele.attr('name')) {
        case 'addStyle':
          ui.editButton(evt, 'menuAdd');
          break;
        case 'return':
          $('#SLList,#SLAbout').show();
          $('#SLEdit,#SLReturn').hide();
          break;
        case 'close':
          $('#SLManage').remove();
          break;
        case 'filterbtn':
          $('div[name=list]>div').show();
          $('#SLList input[id*=chbx]').each((idx,it)=>{
            if(evt.target.id === 'slHideOn' || evt.target.parentElement.id === 'slHideOn'){
              if($(it).prop('checked')) $(it).parent().parent().hide();
            }
            if(evt.target.id === 'slHideOff' || evt.target.parentElement.id === 'slHideOff'){
              if(!$(it).prop('checked')) $(it).parent().parent().hide();
            }
          });
          break;
        case 'edit':
          ui.editButton(evt);
          break;
        case 'delete':
          ui.deleteButton(evt);
          break;
        case 'update':
          ui.updateButton(evt);
          break;
        case 'saveStyle':
          ui.saveButton();
          break;
        case 'deletePart':
          ui.deleteCodeBlock(ele);
          break;
        case 'addPart':
          ui.addCodeBlock(ele);
          break;
        case 'beautify':
          ui.beautifyCodeBlock(ele);
          break;
        case 'deleteRule':
          ui.deleteRule(ele);
          break;
        case 'addRule':
          ui.addRule(ele);
          break;
        default:
          break;
      }
    }
  };
  function stylesOnOff(){
    GM_unregisterMenuCommand(cmdOnOff);
    if($('#'+applyCssId).length > 0){
      $('#'+applyCssId).remove();
      updateList('add',location.origin);
      cmdOnOff = GM_registerMenuCommand('SL On',stylesOnOff);
    }else{
      apply();
      updateList('delete',location.origin);
      cmdOnOff = GM_registerMenuCommand('SL Off',stylesOnOff);
    }
  }
  function updateList(op, name){
    let key = name || location.origin,
    list = GM_getValue('nameList',{});
    if(op === 'delete'){
      delete list[key];
    }else{
      list[key] = 1;
    }
    GM_setValue('nameList',list);
  }

  $(()=>{
    //register menu
    GM_registerMenuCommand('SL Manage',ui.makePanel);
    if(checkList(location.origin)){
      cmdOnOff = GM_registerMenuCommand('SL Off',stylesOnOff);
    }else{
      cmdOnOff = GM_registerMenuCommand('SL On',stylesOnOff);
    }
  });



})();
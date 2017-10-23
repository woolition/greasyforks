// ==UserScript==
    // @name         Markdown Viewer Lite
    // @namespace    http://tampermonkey.net/
    // @version      0.5
    // @description  view Markdown in Chrome,23 common language surportted
    // @require      https://cdn.staticfile.org/zepto/1.2.0/zepto.min.js
    // @require      https://greasyfork.org/scripts/34223-doccodestyle/code/docCodeStyle.js?version=225061
    // @require      https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.6/marked.min.js
    // @require      https://greasyfork.org/scripts/34224-prism23-js/code/prism23js.js?version=224302
    // @resource     http://netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css
    // ==============  katex  ===============
    // @description     https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-alpha1/katex.min.css
    // @description      https://greasyfork.org/scripts/34253-katex/code/KaTeX.js?version=224512
    // @description      https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-alpha1/contrib/auto-render.min.js
    // ==============  flowchart ============
    // @description      https://cdn.staticfile.org/raphael/2.2.7/raphael.min.js
    // @description      http://cdnjs.cloudflare.com/ajax/libs/raphael/2.2.0/raphael-min.js
    // @description      https://cdn.staticfile.org/flowchart/1.6.5/flowchart.min.js
    // ==============  Sequence Diagram ============
    // -@description-    https://greasyfork.org/scripts/34307-sequence-diagrams/code/sequence-diagrams.js?version=224764
    // @description      https://cdnjs.cloudflare.com/ajax/libs/raphael/2.2.7/raphael.min.js
    // @description      http://apps.bdimg.com/libs/webfont/1.3.0/webfont.js
    // @description      https://cdn.staticfile.org/snap.svg/0.5.1/snap.svg-min.js
    // @description      http://apps.bdimg.com/libs/underscore.js/1.7.0/underscore-min.js
    // @description      https://bramp.github.io/js-sequence-diagrams/js/sequence-diagram-min.js

    // @description      https://cdn.staticfile.org/js-sequence-diagrams/1.0.6/sequence-diagram-min.js
    // @description      https://raw.githubusercontent.com/bramp/js-sequence-diagrams/master/src/sequence-diagram.js
    // @description      https://bramp.github.io/js-sequence-diagrams/js/sequence-diagram-snap-min.js

    // @author       黄盐
    // @match        file:///*md
    // @grant        GM_addStyle
    // @grant        GM_setValue
    // @grant        GM_getValue
    // @grant        unsafeWindow
    // @run-at       document-end
// ==/UserScript==
(function() {
     'use strict';
    var codeStyleElementId = 'prismCT';   //prism code theme
    var docStyleElementId = 'docTheme';
    var TIMESTEP = 500; //setInterval argument milliseconds
    var addonRsc = {
        'EMOJI':['emojiJs','emojiCss'],
        'KATEX':['katexCss', 'katexJs', 'autoRenderJs'],
        'FLOWCHART':['raphaelJs', 'flowchartJs'],
        'FONTAWESOME':['fontAwesomeCss'],
        'MERMAID':['mermaidJs'],
        'SEQUENCEDIAGRAM':['webfont', 'snapSVG', 'underscore', 'sqcDiagr']
    };
    var addonDefaultState = {
        'EMOJI':false,
        'KATEX':false,
        'FLOWCHART':false,
        'FONTAWESOME':false,
        'MERMAID':false,
        'SEQUENCEDIAGRAM':false
    };
    var resource = {
        'zEpto': 'https://cdn.staticfile.org/zepto/1.2.0/zepto.min.js',
        /*EMOJI*/
        'emojiCss': {
            'type': 'link',
            'id': 'emojiCss',
            'rel': 'stylesheet',
            'href': 'https://cdn.jsdelivr.net/npm/emojione@3.1.2/extras/css/emojione.min.css'
        },
        'emojiJs': {
            'type': 'script',
            'id': 'emojiJs',
            'src': 'https://cdn.jsdelivr.net/npm/emojione@3.1.2/lib/js/emojione.min.js'
        },
        /*FONT AWESOME*/
        'fontAwesomeCss': {
            'type': 'link',
            'id': 'fontAwesomeCss',
            'rel': 'stylesheet',
            'href': 'http://netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'
        },
        /*KATEX*/
        'katexCss': {
            'type': 'link',
            'id': 'katexCss',
            'rel': 'stylesheet',
            'href': 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-alpha1/katex.min.css'
        },
        'katexJs': {
            'type': 'script',
            'id': 'katexJs',
            'src': 'https://greasyfork.org/scripts/34253-katex/code/KaTeX.js?version=224512'
        },
        'autoRenderJs': {
            'type': 'script',
            'id': 'autoRenderJs',
            'src': 'https://cdn.staticfile.org/KaTeX/0.7.1/contrib/auto-render.min.js'
        },
        /*FLOWCHART*/
        'flowchartJs': {
            'type': 'script',
            'id': 'flowchartJs',
            'src': 'https://cdn.staticfile.org/flowchart/1.6.5/flowchart.min.js'
        },
        'raphaelJs': {
            'type': 'script',
            'id': 'raphaelJs',
            'src': 'http://cdnjs.cloudflare.com/ajax/libs/raphael/2.2.0/raphael-min.js'
        },
        /*MERMAID*/
        'mermaidJs':{
            'type':'script',
            'id':'mermaidJs',
            'src':'https://unpkg.com/mermaid@7.1.0/dist/mermaid.min.js'
        },
        /*SEQUENCEDIAGRAM*/
        'webfont': {
            'type': 'script',
            'id': 'webfont',
            'src': 'http://apps.bdimg.com/libs/webfont/1.3.0/webfont.js'
        },
        'snapSVG': {
            'type': 'script',
            'id': 'snapSVG',
            'src': 'https://cdn.staticfile.org/snap.svg/0.5.1/snap.svg-min.js'
        },
        'underscore': {
            'type': 'script',
            'id': 'underscore',
            'src': 'http://apps.bdimg.com/libs/underscore.js/1.7.0/underscore-min.js'
        },
        'sqcDiagr': {
            'type': 'script',
            'id': 'sqcDiagr',
            'src': 'https://bramp.github.io/js-sequence-diagrams/js/sequence-diagram-min.js'
        }
    };
    var optionsDefault = {
        'breaks': false,
        'gfm': true,
        'pedantic': false,
        'sanitize': false,
        'smartLists': true,
        'smartypants': false,
        'tables': true,
    };
    var autoKatexOptDefault = {
            'throwOnError': true,
            'errorColor': '#f92672',
            'macros': '',
            'colorIsTextColor': false,
            'maxSize': 500,
            'ignoredTags': ["script", "noscript", "style", "textarea"],
            'delimiters': [{
                left: "$$",
                right: "$$",
                display: true
            }, {
                left: "\\[",
                right: "\\]",
                display: true
            }, {
                left: "\\(",
                right: "\\)",
                display: true
            }]
        };
/*  check/set GM_*Value  */
    void function checkSetStorage(){
        (GM_getValue('prismCT') === undefined) ? GM_setValue('prismCT', prismCT) : null;
        (GM_getValue('docTheme') === undefined) ? GM_setValue('docTheme', docTheme) : null;
        (GM_getValue('options') === undefined) ? GM_setValue('options', optionsDefault) : null;
        (GM_getValue('curPismCodeTheme') === undefined) ? GM_setValue('curPismCodeTheme', 'solarized') : null;
        (GM_getValue('curDocTheme') === undefined) ? GM_setValue('curDocTheme', 'github') : null;
        (GM_getValue('addonState') === undefined) ? GM_setValue('addonState', addonDefaultState) : null;
        (GM_getValue('emojiMode') === undefined) ? GM_setValue('emojiMode', 'shortnameToImage') : null;
        (GM_getValue('autoKatexOpt') === undefined) ? GM_setValue('autoKatexOpt', autoKatexOptDefault) : null;
    }();
/*  check and set div#_html class #require docCodeStyle.js */
    function _htmlClass() {
        var a = GM_getValue('curDocTheme');
        if (a === 'github' || a === 'github_dark') {
            $('#_html').addClass('markdown-body');
        } else {
            $('#_html').addClass('markdown-theme');
        }
    }
/*  addons : Add styleshtte/script to <head>    */
    function addonPrepare(addonName){
        addonRsc[addonName].forEach(function(curVal) {
            if(!$('#'+curVal).length){
                if (resource[curVal].type === 'script') {
                    $('head').append($('<script>', {
                        id: resource[curVal].id,
                        src: resource[curVal].src
                    }));
                } else {
                    $('head').append($('<link />', {
                        id: resource[curVal].id,
                        href: resource[curVal].href,
                        rel: resource[curVal].rel
                    }));
                }
            }
        });
    }
/*  change code style or document style */
    function changeStyle(e) {
        var a = e.target.dataset.type; //docTheme|prismCT
        var b = e.target.dataset.theme; //themename
        var tmp = GM_getValue(a);
        $('#' + a).html(tmp[b]);
        //changeElementStyle
        a === 'docTheme' ? (GM_setValue('curDocTheme', b), _htmlClass()) : GM_setValue('curPismCodeTheme', b);
        $(`#g legend[data-type=${a}`).each(function() {
            this.dataset.using = false;
        });
        $(`#g legend[data-theme=${b}`).data('using', true);
    }
/*  parse according to options */
    function changeOption(e) {
        var a = e.target.dataset.opt;
        var opt = GM_getValue('options');
        opt[a] = !opt[a];
        GM_setValue('options', opt);
        var htmlTxt = marked($('#markdownText').val(), opt);
        $('#_html').html(htmlTxt);
        setTimeout(() => Prism.highlightAll(), 20);
        //changeElementStyle
        $(`#g legend[data-opt=${a}]`).data('using', opt[a]);
    }
/*  turn off/turn on addons  */
    function toggleAddons(e){
        var a = e.target.dataset.name;
        $(e.target).toggleClass('adoff');
        var b = GM_getValue('addonState');
        b[a] = !b[a];
        var c = b[a];
        GM_setValue('addonState',b);
        reflesh();
        function reflesh(){
            var renderer = new marked.Renderer();
            var markedOptions = GM_getValue('options');
            $('body script').remove();
            $('#_html').html(marked($('#markdownText').val(),markedOptions));
            checkRunAddons();
            setTimeout(() => Prism.highlightAll(), 20);
        }
    }
/*  parse text to emoji */
    function useEmoji(){
        addonPrepare('EMOJI');
        function procEmoji(){
            if (typeof(emojione) === 'object'){
                try {
                         $('#_html').html( emojione.shortnameToImage($('#_html').html()) );
                    } catch(e) {
                        console.log(e);
                    }
                } else{
                    procENum += 1;
                    console.log(procENum);
                    if(procENum>10){
                        console.log('Time out,please try to reflash !');
                        return;
                    }
                    setTimeout(procEmoji, 100);

                }
        }
        if($('#excEmoji').length){$('#excEmoji').remove()};
        $('body').append($('<script>',{
            id:'excEmoji',
            text:`
            var procENum = 0;
            ${procEmoji.toString()};
            setTimeout(procEmoji, 200);
            `
        }));
    }
/*  Use katex  */
    function useKaTeX() {
        addonPrepare('KATEX');
       function trigOnKatex(){
            $('code[class*=lang]').forEach(function(item){
                var language = item.className.slice(9);
                var code = $(item).text();
                if(language.match(/(katex|math)/i)!==null){
                    var tmp = $(item).text();
                    var num = item.parentNode.dataset.num;
                    $(item).unwrap();
                    $(item).replaceWith(`<div class='ktmath' data-num=${num}>\\[${(tmp.replace(/\n\W*\n/g,'\n\\]\\[\n'))}\\]</div>`);
                 }
            })
            renderMathInElement($('#_html')[0], option);
        }
        function procKatexCode() {
            if (typeof(katex) === 'object') {
                try {
                    trigOnKatex();
                } catch(e) {
                    console.log(e);
                    procktNum += 1;
                    if (procktNum > 15) {
                        console.log('Use kaTeX Fail, try to Reflush! ');
                        return;
                    }
                    setTimeout(procKatexCode,500);
                }
            } else {
                procktNum += 1;
                if (procktNum > 10) {
                    console.log('Use kaTeX Fail, try to Reflush! ');
                    return;
                }
                setTimeout(procKatexCode,500);
            }
        }
        if($('#excAutoRender').length){$('#excAutoRender').remove()}
        $('body').append($('<script>', {
            id: 'excAutoRender',
            text: `
                var procktNum;
                var option = ${JSON.stringify(GM_getValue('autoKatexOpt'))};
                ${trigOnKatex.toString()}
                ${procKatexCode.toString()}
                setTimeout(procKatexCode, ${TIMESTEP});
            `
        }));
    }
/*  use flowchart  */
    function useFlowchart() {
        addonPrepare('FLOWCHART');

        function procFlowchartCode() {
            if (typeof(flowchart) === 'object') {
                try {
                    $('pre[class$=flow]').each(function(index) {
                        var txt = $(this.firstElementChild).text();
                        var a = $('<div>', {
                            id: "fl" + index
                        });
                        $(this).append(a);
                        flowchart.parse(txt).drawSVG(a[0]);
                        $(this).replaceWith(a);
                    });
                } catch(e) {
                    procFcNum += 1;
                    if (procFcNum > $('pre[class$=flow]').length+5){

                    console.log(e);
                    console.log(`convert FlowChart falid! try to Reflush!\\n[Error]:` );
                    return ;
                }
                    setTimeout(procFlowchartCode, 500);
                }
            } else {
                t1 = new Date();
                procFcNum += 1;
                if (procFcNum>10) {
                    console.log(`convert FlowChart falid! try to Reflush!` );
                    return;
                }
            }
        }
        if($('#excflowchart').length) {$('#excflowchart').remove()};
        $('body').append($('<script>', {
            id: 'excflowchart',
            text: `
                var procFcNum = 0;
                ${procFlowchartCode.toString()}
                setTimeout(procFlowchartCode, ${TIMESTEP});
            `
        }));
    }

/*  use mermaid  flowchart|sequence diagram|gantt diagram  */
    function useMermaid(opt){
        addonPrepare('MERMAID');
        addonPrepare('FONTAWESOME');
        /*add class name mermaid*/
        function trigOnMermaid(){
            $('code[class*=lang]').forEach(function(item){
                var language = item.className.slice(9);
                var code = $(item).text();
                if(code.match(/(^gantt|^sequenceDiagram|^graph|^classDiagram)/)!==null){
                    $(item).addClass('mermaid');
                }
                if(language.match(/gantt/)!==null){
                    $(item).addClass('mermaid');
                }
            })
            mermaid.init();
            setTimeout(function(){
                $('.mermaid svg').unwrap().unwrap().wrap('<div class="mermaidDiv"></div>');
            },200);
        }

        function excMermaid(){
            if(typeof(mermaid) !== 'undefined'){
                try {
                    trigOnMermaid();
                } catch(e) {
                    excMmNum += 1;
                    if(excMmNum > 15){
                        console.log('Use Mermaid Failed ! try to reflush !');
                        return;
                    }
                    console.log(e);
                }
            } else{
                excMmNum += 1;
                if(excMmNum > 10){
                    console.log('Use Mermaid Failed ! try to reflush !');
                    return;
                }
                setTimeout(excMermaid, 500);
            }
        }
        // if($('#excMermaid').length){
        //     $('#excMermaid').remove();
        // }
        $('#_html').append($('<script>',{
            id:'excMermaid',
            text:`
            var excMmNum = 0;
            ${excMermaid.toString()};
            ${trigOnMermaid.toString()};
            setTimeout(excMermaid, 10);
            `
        }));
    }

/*  use sequence diagram  */
    function useSeqcDiagram() {
        addonPrepare('SEQUENCEDIAGRAM');

        function procSeqcdiagram() {
            if (typeof(Diagram) === 'function' || typeof(Diagram) === 'object') {
                clearInterval(timerSd);
                $('pre[class$=seq]').each(function(index) {
                    try {
                        var a = $('<div>',{id:'seq'+index})[0];
                        var b = Diagram.parse($(this.firstElementChild).text());
                        $(this).replaceWith(a);
                        b.drawSVG(a);
                        // $(this).replaceWith(a);
                    } catch(e) {
                        console.log(e);
                    }
                });
            } else {
                t1 = new Date();
                if ((t1 - t) > 10000) {
                    clearInterval(timerSd);
                    console.log('Use sequence-diagrams Fail, try to Reflush! ');
                }
            }
        }
        if($('#excAutoRender').length){$('#excAutoRender').remove()};
        $('body').append($('<script>', {
            id: 'excAutoRender',
            text: `
                var t = new Date(),t1;
                ${procSeqcdiagram.toString()}
                timerSd = setInterval(procSeqcdiagram, ${TIMESTEP});
            `
        }));
    }


/*  set marked.options.renderer  */
    function setRenderer(){
        var renderer = new marked.Renderer();
        window.codenum = 0;
        renderer.code = function(code, language) {
            return `<pre class="language-${language}"><code class="language-${language}">${code}</code></pre>`;
        };
        return renderer;
    }


/*  Add <link rel='stylesheet'> <script src='*'> element */
    $('head').append($('<script>',{id:'zeptojs',src:'https://cdn.staticfile.org/zepto/1.2.0/zepto.min.js'}));
    $('head').append($('<style>', {
        id: docStyleElementId,
        text: docTheme[GM_getValue('curDocTheme')]
    }));
    $('head').append($('<style>', {
        id: codeStyleElementId,
        text: prismCT[GM_getValue('curPismCodeTheme')]
    }));
//

    /* storage the raw-markdown text */
    var mdSource = $('body').text();
    var mdSourceNode = $('<textarea style="display:none !important;" id="markdownText">').val(mdSource);
    /* load marked options */
    var markedOptions = GM_getValue('options');
    // markedOptions.renderer = setRenderer();
    /*  empty <body>  */
    $('body').empty();
    /* transfer codes, set container, replace Markdown code, add stylesheet */
    var htmlTxt = marked(mdSource,markedOptions);
    $('body').append($('<div>',{id:'_html'}));
    $('#_html').html(htmlTxt);
    $('pre[data-language]').hide();
    _htmlClass();
//
    function checkRunAddons(){
        GM_getValue('addonState')['FLOWCHART'] ? useFlowchart() : null;
        GM_getValue('addonState')['KATEX'] ? useKaTeX() : null;
        GM_getValue('addonState')['SEQUENCEDIAGRAM'] ? useSeqcDiagram() : null;
        /* parse to emoji  */
        GM_getValue('addonState')['EMOJI'] ? useEmoji() : null;
        GM_getValue('addonState')['MERMAID'] ? useMermaid() : null;
    }
    checkRunAddons();



    /*  highlight code block  */
    setTimeout(() => Prism.highlightAll(), 20);
    /*append mdSourceNode*/
    $('body').append(mdSourceNode);
//  stylesheet
    /* global Css & Settings Css*/
    GM_addStyle(`html,body{padding:0 !important;margin:0 !important;width:auto !important;max-width:100% !important;}pre#_markdown{word-wrap:break-word;white-space:pre-wrap;}.markdown-body{overflow:auto;min-width:888px;max-width:888px;background-color:#fff;border:1px solid #ddd;padding:45px;margin:20px auto;}.markdown-body #_html>*:first-child{margin-top:0 !important;}.markdown-body #_html>*:last-child{margin-bottom:0 !important;}.markdown-body img{background-color:transparent;}.markdown-theme{box-sizing:border-box;max-width:100% !important;padding:20px !important;margin:0 auto !important;}@media (max-width:767px){.markdown-theme{width:auto !important;}}@media (min-width:768px) and (max-width:992px){.markdown-theme{width:713px !important;}}@media (min-width:992px) and (max-width:1200px){.markdown-theme{width:937px !important;}}@media (min-width:1200px){.markdown-theme{width:1145px !important;}}body{display:flex;}body._toc-left{padding-left:300px !important;}body._toc-right{padding-right:300px !important;}#_toc{position:fixed;top:0;bottom:0;left:0;width:300px;height:100%;background:#fafafa;overflow-y:auto;overflow-x:hidden;}#_toc #_ul{padding:0 0 0 20px !important;margin:0 !important;}#_toc #_ul a{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif !important;font-size:14px !important;line-height:17px !important;color:#364149 !important;font-weight:normal !important;font-style:normal !important;text-decoration:none !important;text-transform:none !important;letter-spacing:0.2px !important;background:none !important;border:0 !important;padding:10px 15px !important;display:block !important;}#_toc #_ul a:hover{text-decoration:underline !important;}@font-face{font-family:octicons-link;src:url(data:font/woff;charset=utf-8;base64,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) format('woff');}.octicon{font:normal normal 16px 'octicons-link';line-height:1;display:inline-block;text-decoration:none;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}.octicon-link:before{content:'\\f05c';}.octicon-link{display:none;color:#000;vertical-align:middle;}.anchor{display:flex;flex-direction:column;justify-content:center;}.markdown-body h1:hover .anchor,.markdown-body h2:hover .anchor,.markdown-body h3:hover .anchor,.markdown-body h4:hover .anchor,.markdown-body h5:hover .anchor,.markdown-body h6:hover .anchor{height:1em;padding-left:8px;margin-left:-28px;line-height:1;text-decoration:none;}.markdown-body h1:hover .octicon-link,.markdown-body h2:hover .octicon-link,.markdown-body h3:hover .octicon-link,.markdown-body h4:hover .octicon-link,.markdown-body h5:hover .octicon-link,.markdown-body h6:hover .octicon-link{display:inline-block;}.emojione{font-size:inherit;height:3ex;width:3.1ex;min-height:20px;min-width:20px;display:inline-block;margin:-.2ex .15em .2ex;line-height:normal;vertical-align:middle;}img.emojione{width:auto;}/*mermaid svg begin*/.mermaidDiv{background:white;border-radius:10px;} .mermaidDiv svg{height:auto;}/*mermaid svg end*/

    #setting {cursor:pointer;font-size:25px!important;min-width:35px;max-width:35px;padding:0 3px 5px 3px;min-height:35px;max-height:35px;text-align:center;color:cyan;background:#222;position:fixed;right:10px;top:10px;opacity:0.3;-moz-opacity:0.3;filter:alpha(opacity=30);border:2px solid cyan;border-radius:30px;transition:All 0.4s ease-in-out;-webkit-transition:All 0.4s ease-in-out;-moz-transition:All 0.4s ease-in-out;-o-transition:All 0.4s ease-in-out;}
    #setting:hover {opacity:1;-moz-opacity:1;filter:alpha(opacity=100);transform:rotate(360deg);-webkit-transform:rotate(360deg);-moz-transform:rotate(360deg);-o-transform:rotate(360deg);-ms-transform:rotate(360deg);}
    /*setting menu css */
    #g{display:none;position: fixed; top:20px;right:20px;width:125px;height:auto;list-style-type: none;}
    #g *{color:#2196F3;font-size:16px;text-align:center;}
    #g legend{display:block;text-align:center;background:#333;height:35px;border:0;padding:5px;margin:0;}
    #g li:hover, #g legend:hover{background:yellowgreen;color:white!important;font-weight:bold!important;}
    #g li{width:130px;right:0;background:#333;padding: 3px 5px;}
    #g fieldset {position:absolute;right:120px;top:0;width:320px;min-height:252px;margin:0;border:0;padding:0;border-radius:10px;display:none;}
    #g li:hover fieldset{display:block;}
    #g legend{background:#444;width:150px;float:right;border-radius:5px;}
    #g li:first-of-type{border-radius:10px 10px 0 0;}
    #g li:last-of-type{border-radius:0 0 10px 10px;}
    #g>li>span{width:100%;display: block;height:30px;}
    #g>li:hover>span{display: block;right:100px;color:white;}
    /*#s>label>fieldset:hover>label{display: block;}*/
    .adoff {text-align:right!important;color:#FFEB3B!important;border-left:20px solid #FFEB3B !important;width:110px !important;}
    .adoff fieldset{display:none!important;}
    .using{background:yellowgreen;}
    legend[data-using="true"]{background:yellowgreen!important;}
            `);
//
/*  Seting button */
    function gear() {
        var j = GM_getValue('options');
        var k = GM_getValue('autoKatexOpt');
        var a = $('<div>')[0];
        a.name = 'gear';
        a.setAttribute('style', 'styleCss');
        var tmp = `<ul id='g'><li><span>Doc Theme</span><fieldset>`;
        for (var i in docTheme) {
            tmp += `<legend data-theme='${i}'data-type='docTheme' data-using=${i == GM_getValue('curDocTheme')}>${i}</legend>`;
        }
        tmp += `</fieldset></li><li><span>Code Theme</span><fieldset>`;
        for (var i in prismCT) {
            tmp += `<legend data-theme='${i}'data-type='prismCT' data-using=${i == GM_getValue('curPismCodeTheme')}>${i}</legend>`;
        }
        tmp += `</fieldset></li><li><span>Options</span><fieldset>`;
        for (var i in j) {
            tmp += `<legend data-opt='${i}'data-type='options' data-using='${j[i]}'>${i}</legend>`;
        }
        tmp += `</fieldset></li><li><span data-name='EMOJI' class='${GM_getValue('addonState')['EMOJI']?'adon':'adoff'}'>Emoji</span></li>`;
        tmp += `<li><span data-name='KATEX' class='${GM_getValue('addonState')['KATEX']?'adon':'adoff'}'>KaTeX</span><fieldset>`;

        for (var i in k) {
            tmp += `<legend data-opt='${k}'data-type='autoKatexOpt' data-using='${k[i]}'>${i}</legend>`;
        }
        tmp += `</fieldset></li><li><span data-name='FLOWCHART' class='${GM_getValue('addonState')['FLOWCHART']?'adon':'adoff'}'>FlowChar</span></li>`;
        tmp += `<li><span data-name='SEQUENCEDIAGRAM' class='${GM_getValue('addonState')['SEQUENCEDIAGRAM']?'adon':'adoff'}'>Seqc Digrm</span></li>`;

        tmp += `<li><span data-name='MERMAID' class='${GM_getValue('addonState')['MERMAID']?'adon':'adoff'}'>Mermaid</span></li>`;

        tmp += `</ul></div><div id='setting'onclick="$('#g').toggle()">▞</div>`;

        a.innerHTML = tmp;
        $('body').append(a);
    }
    gear();
    $('#g legend[data-theme]').each(function() {
        this.addEventListener('click', changeStyle, false);
    });

    $('#g legend[data-opt]').each(function() {
        this.addEventListener('click', changeOption, false);
    });
    $('#g span[data-name]').each(function() {
        this.addEventListener('click', toggleAddons, false);
    });
    $('legend[data-using="true"]').addClass('using');



})();
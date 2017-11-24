// ==UserScript==
// @name               MouseGesture-That's the way to DRAG
// @name:zh-CN         鼠标手势--就是这么拽!
// @namespace          https://greasyfork.org/users/104201
// @description        HY's mouse gesture script,supports ringt-key draw track functions and left-key drag functions.Drag target can be [Text] & [Links] & [Image]  Customizenable → Right click to draw ⇄(left,right) to setting
// @description:zh-CN  鼠标手势脚本,就是这么拽:支持右键轨迹手势和左键拖拽功能.可以拖拽[文本],[链接]和[图片],支持自定义设置:鼠标画⇄(右左)路径,进入设置
// @version            1.3
// @include            *
// @noframes
// @run-at             document-end
// @grant              GM_openInTab
// @grant              GM_addStyle
// @grant              GM_setValue
// @grant              GM_getValue
// @grant              GM_setClipboard
// @grant              GM_download
// @grant              GM_addValueChangeListener
// @grant              GM_notification
// @grant              window.close
// @grant              GM_getResourceText
// @grant              GM_xmlhttpRequest
// Thanks to: Peer Zeng's script:  https://greasyfork.org/zh-CN/scripts/4776-my-mouse-gestures [no License] [for right click gesture handle]
// Thanks to: crxMouse Chrome™ Gestures [chrome crxID:jlgkpaicikihijadgifklkbpdajbkhjo] [for: drag processing]
// Thanks to: Robbendebiene's project Gesturefy [https://github.com/Robbendebiene/Gesturefy] [for canvas line style]
// Thanks to: Jim Lin's userscript 有道划词翻译 [https://greasyfork.org/zh-CN/scripts/15844] [License MIT][for 划词翻译]
// ==/UserScript==
/* jshint esversion: 6 */

const MouseGesture = (function() {
    let dObj = {};// the Object Element being draged
    let x, y, startX, startY, screenX, screenY, canvas, tips, ctx,
     track = "", symbol = '', symbolTrack = '';

    //_*:  default cfg values
    let _cfg = {
        // t2n: track <==> function name
        t2n:{
            U: "toTop",
            D: "toBottom",
            L: "back",
            R: "forward",
            DR: "close",
            LU: "reopenLatestCloseTab",
            RL: 'setting'
        },
        //dt2n: dragText <==> function name
        dt2n: {
            L: "copySelectedText",
            R: "searchSelectedText"
        },
        //dl2n: drag link <==> function name
        dl2n: {
            R: 'openLink',
            L: 'copyLink'
        },
        //li2n: drag image <==> function
        di2n: {
            D: 'saveImg',
            R: 'searchImg',
            U: 'copyImgURL',
            L: 'selectTheImage'
        },
        // configuration
        usr:{
            //canvas setting
            minLineWidth: 1,
            lineGrowth: 0.6,
            maxLineWidth: 10,
            lineColor: '00AAA0',
            //tips setting
            fontSize: 50, //tips font size
            tipsBackground: "00000055", //div background
            funNotDefine: "  (◔ ‸◔)？", //function not define tips
            //language 0:Chinese 1:English
            language: 0,
            sensitivity: 10, // minLength
            searchEnging: "http://www.baidu.com/s?wd=",
            // 0:open new tab background 1:open new tab active
            notBackground: 1,
            translateTo: 'zh-CHS',
            translateTimeout: 5,
            vipApi: 'http://goudidiao.com/?url=',
            zoom: 2,
            //drag config
            dragType: "",
            // isDrag:false,
            dragtext: true,
            draginput: true,
            draglink: true,
            dragimage: true,
            imgfirst: false,
            imgfirstcheck: true,
            setdragurl: true,
            // image searching
            // forground:true background false
            isImgSearchTabActive: true,
            // image searching enging
            imgSearchEnging: 'https://image.baidu.com/n/pc_search?queryImageUrl=%URL&uptype=urlsearch'
        }
    };
    let cfg = GM_getValue('cfg', _cfg);

    //function name <==> tips
    let fn = {
        // gesture
        t2n: {
        // gesture: {
            stopLoading: ['停止加载', 'StopLoading'],
            reload: ['刷新', 'Refresh'],
            reloadWithoutCache: ['清缓存刷新', 'Refresh Without Cache'],
            close: ['关闭', 'Close'],
            back: ['后退', 'Back'],
            forward: ['前进', 'Forward'],
            toTop: ['到顶部', 'Scroll to Top'],
            toBottom: ['到底部', 'Scroll to Bottom'],
            reopenLatestCloseTab: ['打开最近关闭窗口', 'Reopen Latest Closed Window'],
            setting: ['设置', 'Settings'],
            URLLevelUp: ['网址向上一层', 'URL hierarchy up'],
            cloneTab: ['克隆标签页', 'Duplicate This Tab'],
            openBlankTab: ['打开空白页', 'Open New Blank Tab'],
            translate: ['翻译网页', 'Translate This Page'],
            fkVip: ['破解VIP视频', 'Crack to Watch VIP Video'],
            closeOtherTabs: ['关闭其他标签', 'Close Other Tabs'],
            selectAndTranslateOn: ['开启划词翻译', 'Turn on Select And Translate']
        },
        dt2n: {
            searchSelectedText: ['搜索选中文本', 'Search Selected Text'],
            copySelectedText: ['复制选中文本', 'Copy Selected Text']
        },
        dl2n: {
            openLink: ['打开链接', 'Open Link'],
            copyLink: ['复制链接', 'Copy Link'],
            copyLinkText: ['复制链接文字', 'Copy Link Text']
        },
        di2n: {
            saveImg: ['保存图片', 'Save Image'],
            searchImg: ['搜索图片', 'Search Image'],
            copyImage: ['复制图片', 'Copy Image to ClickBoard'],
            copyImgURL: ['复制图片链接', 'Copy ImageURL'],
            openImgNewTab: ['新标签打开图片', 'Open Image in New Tab'],
            image2DataURL: ['复制图片为DataURL', 'Copy Image as DataURL'],
            selectTheImage: ['选中图片', 'Select This Image']
        }
    };
    //function name <==> function declaration  ==> execute it
    let funs = {
        stopLoading: function() {
            window.stop();
        },
        reload: function() {
            history.go(0);
            //window.location.reload();
        },
        reloadWithoutCache: function() {
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
        reopenLatestCloseTab: function() {
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
        translate: function() {

            if (typeof Microsoft === 'undefined' || typeof Microsoft.Translator === 'undefined') {
                let d = document.createElement('div');
                d.id = "MicrosoftTranslatorWidget";
                d.style.cssText = 'visibility:hidden;';
                d.setAttribute('class', 'Lignt');
                // let src =
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
                    text: cfg.usr.language ? "出了问题,无法完成翻译" : "Oops,Something wrong Hapend...",
                    timoeout: 2000
                });
                tips.parentNode.removeChild(tips);
            };
            onComplete = function() {
                tips.parentNode.removeChild(tips);
            };
            onProgress = function() {
                document.documentElement.appendChild(tips);
                tips.innerHTML = cfg.usr.language ? "翻译中..." : "Translating...";
            };
            let doTranslate = function() {
                if (typeof Microsoft === 'undefined' || typeof Microsoft.Translator === 'undefined') return;
                clearInterval(loadTranslatorTimer);
                Microsoft.Translator.Widget.Translate('', cfg.usr.translateTo || _cfg.usr.translateTo, onProgress, onError, onComplete, () => {}, (cfg.usr.translateTimeout || _cfg.usr.translateTimeout) * 1000);
            };
            loadTranslatorTimer = setInterval(doTranslate, 200);
            setTimeout(() => clearTimeout(loadTranslatorTimer), (cfg.usr.translateTimeout || _cfg.usr.translateTimeout) * 1000);
        },
        fkVip: function() {
            // window.open((cfg.usr.vipApi || _cfg.usr.vipApi)+location.href,'_blank');
            GM_openInTab((cfg.usr.vipApi || _cfg.usr.vipApi)+location.href, {active:true});
        },
        closeOtherTabs: function() {
            GM_setValue('closeAll', Date());
        },
        selectAndTranslateOn: function() {
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
                    var query = dict['query'];
                    var errorCode = dict['errorCode'];
                    if (dict['basic']) {
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
                        var basic = dict['basic'];
                        var header = document.createElement('p');
                        var span = document.createElement('span');
                        span.innerHTML = query;
                        header.appendChild(span);
                        var phonetic = basic['phonetic'];
                        if (phonetic) {
                            var phoneticNode = document.createElement('span');
                            phoneticNode.innerHTML = '[' + phonetic + ']';
                            phoneticNode.style.cursor = 'pointer';
                            header.appendChild(phoneticNode);
                            phoneticNode.addEventListener('mouseup', function(e) {
                                e.stopPropagation()
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
                                            })
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
                        basic['explains'].map(function(trans) {
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
                        dict['translation'].map(function(trans) {
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

        /*
        //not torking
        zoomIn: function(){
           setTimeout(zoomer, 200);
            function zoomer(evt){
                let a, b,isZoom = true;
                a = document.elementFromPoint(evt.clientX,evt.clientY).style.zoom=cfg.usr.zoom;
                a.setAttribute('data-zoom', 'true');
                [].every.forEach(document.querySelectorAll('*[data-zoom=true]'), function(item){
                    if (item !== a) item.style.zoom = null;
                });
            }
        },*/

        searchSelectedText: function(searchEnging) {
            //get text
            let txt = window.getSelection().toString();
            txt = encodeURIComponent(txt);
            //get search enging
            openURL = cfg.usr.searchEnging + txt || _cfg.usr.searchEnging + txt;
            GM_openInTab(openURL, {
                active: cfg.usr.notBackground || _cfg.usr.notBackground
            });
        },
        copySelectedText: function() {
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
        searchImg: function() {
            //TamperMonkey
            GM_openInTab(cfg.usr.imgSearchEnging.replace(/%URL/, dObj.img), {
                active: cfg.usr.isImgSearchTabActive
            });
        },
        selectTheImage: function() {
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
            createSeetingUi();
        }
    };

    let flag = {
        actionType: '',
        //if drag ,isDrag = true
        isDrag: false,
        //if mouse right key is press,ispress = true
        isPress: false,
        //if document has <canvas> hascanvas = true
        hascanvas: false,
        //zoom mode
        isZoom: false
    };
    //============ supportive functions ==> used by funs{}'s function
    //check if string is an url
    function isURL(string) {
        try {
            new URL(string);
        } catch (e) {
            return false;
        }
        return true;
    }
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
    // when a gesture is not define, show this tips
    function showGestureNotDefineTips() {
        tips.innerHTML = symbolTrack + '<br/>' + (cfg.usr.funNotDefine || _cfg.usr.funNotDefine);
    }
    //draw track & show tips
    function tracer(e) {
     // const tracer = function(e) {
        let cx = e.clientX,
            cy = e.clientY,
            dx = Math.abs(cx - x),
            dy = Math.abs(cy - y),
            distance = dx * dx + dy * dy;
        if (distance < cfg.usr.sensitivity * cfg.usr.sensitivity) {
            return;
        }
        //if mouse right key is press and document has no <canvas>,then creaet <canvas> and append it
        //到里面才添加元素是为了避免 鼠标一按下,还没有移动就已经图层了
        if (flag.isPress && !flag.hascanvas) addCanvas(e);
        let direction = '',
            symbol = "";
        if (dx < dy) {
            direction = cy > y ? "D" : "U";
            symbol = cy > y ? "⬇" : "⬆";
        } else {
            direction = cx > x ? "R" : "L";
            symbol = cx > x ? "➞" : "⬅";
        }
        if (track.charAt(track.length - 1) !== direction) {
            track += direction;
            symbolTrack += symbol;

            //show action tips
            switch (flag.actionType) {
                case "drag":
                    switch (cfg.usr.dragType) {
                        case "text":
                            if (cfg.dt2n[track] !== undefined) {
                                tips.innerHTML = symbolTrack + '<br/>' + fn.dt2n[cfg.dt2n[track]][cfg.usr.language];
                            } else {
                                showGestureNotDefineTips();
                            }
                            break;
                        case "link":
                            if (cfg.dl2n[track] !== undefined) {
                                tips.innerHTML = symbolTrack + '<br/>' + fn.dl2n[cfg.dl2n[track]][cfg.usr.language];
                            } else {
                                showGestureNotDefineTips();
                            }
                            break;
                        case "image":
                            if (cfg.di2n[track] !== undefined) {
                                tips.innerHTML = symbolTrack + '<br/>' + fn.di2n[cfg.di2n[track]][cfg.usr.language];
                            } else {
                                showGestureNotDefineTips();
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case "common":
                    if (cfg.t2n[track] !== undefined) {
                        //show gesture track and function name
                        tips.innerHTML = symbolTrack + '<br/>' + fn.t2n[cfg.t2n[track]][cfg.usr.language];
                    } else {
                        showGestureNotDefineTips();
                    }
                    break;
                default:
                    break;
            }
        }

        //draw track on canvas
        if (flag.hascanvas) {
            ctx.lineWidth = Math.min(cfg.usr.maxLineWidth, ctx.lineWidth += cfg.usr.lineGrowth);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(e.clientX, e.clientY);
            ctx.stroke();
            ctx.closePath();
        }
        // update (x,y)
        x = cx;
        y = cy;
    }
    //<canvas> & tips<div> is ready, when mousemove or drag, append to show track & tips
    function addCanvas(e) {
        //append tips <div>
        document.documentElement.appendChild(tips);
        //append <canvas>
        document.documentElement.appendChild(canvas);
        //set canvas attribute to clear content
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        if(cfg.usr.lineColor.length>6)canvas.style.opacity = parseInt(cfg.usr.lineColor.slice(6),16)/255;
        ctx.lineWidth = cfg.usr.minLineWidth;
        ctx.strokeStyle = '#' + cfg.usr.lineColor.slice(0,6); //like delicious link color//line color

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
        canvas.style.cssText = "position:fixed;top:0;left:0;z-index:9999999;";
        ctx = canvas.getContext("2d");
        //create tips<div>
        tips = document.createElement('div');
        tips.style.cssText = `
            all: initial !important;
            position: fixed !important;
            z-index: 9999998 !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            font-family: "Orkney Regular", "Arial", sans-serif !important;
            /*font-size: 50px !important;*/
            font-size: ${cfg.usr.fontSize  || _cfg.usr.fontSize}px !important;
            color:white !important;
            white-space: nowrap !important;
            line-height: normal !important;
            text-shadow: 1px 1px 5px rgba(0,0,0, 0.8) !important;
            text-align: center !important;
            padding: 25px 20px 20px 20px !important;
            border-radius: 5px !important;
            font-weight: bold !important;
            background:#${cfg.usr.tipsBackground || _cfg.usr.tipsBackground} !important;
        `;
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
            symbolTrack = "";
            flag.isPress = true;
            flag.actionType = "common";
            window.addEventListener('mousemove', tracer, false);
        }
    }, false);
    window.addEventListener('contextmenu', function(e) {
        reset();
        window.removeEventListener('mousemove', tracer, false);
        if (track !== "") {
            e.preventDefault();
            if (cfg.t2n.hasOwnProperty(track)) {
                funs[cfg.t2n[track]]();
            }
        }
    }, false);

    //left click ==> drag
    window.addEventListener('dragstart', function(e) {
        startX = x = e.clientX;
        startY = y = e.clientY;
        track = "";
        symbolTrack = '';
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
        if (track !== "") {
            // dragType + track => function
            // console.log(dObj);
            switch (cfg.usr.dragType) {
                case "text":
                    if (cfg.dt2n.hasOwnProperty(track)) {
                        funs[cfg.dt2n[track]]();
                    }
                    break;
                case "link":
                    if (cfg.dl2n.hasOwnProperty(track)) {
                        funs[cfg.dl2n[track]]();
                    }
                    break;
                case "image":
                    if (cfg.di2n.hasOwnProperty(track)) {
                        funs[cfg.di2n[track]](e);
                    }
                    break;
                default:
                    break;
            }
        }
    }, false);

    function processDrag(e) {
        //========这部分借鉴 crxMouse Chrome™ Gestures, crxID:jlgkpaicikihijadgifklkbpdajbkhjo===========
        dObj.target = e.target;
        let nodetype = e.target.nodeType;
        //confirm dragType
        if (nodetype === 3) {
            let isLink = e.target.parentNode.href;
            if (cfg.usr.dragtext && !isLink) {
                cfg.usr.dragType = "text";
            } else if (isLink) { //use regular express to match?
                e = e.target.parentNode;
                cfg.usr.dragType = "link";
            }
        }
        if (nodetype === 1) {
            if (e.target.value && cfg.usr.dragtext && cfg.usr.draginput) {
                cfg.usr.dragType = "text";
            } else if (e.target.href) {
                if (window.getSelection().toString() == "" || e.target.textContent.length > window.getSelection().toString().lenght) {
                    if (cfg.usr.draglink) {
                        cfg.usr.dragType = "link";
                    }
                } else {
                    if (cfg.usr.dragtext) {
                        cfg.usr.dragType = "text";
                    }
                }
                if (!cfg.usr.dragtext && cfg.usr.draglink) {
                    cfg.usr.dragType = "link";
                }
            } else if (e.target.src) {
                if (e.target.parentNode.href) {
                    if (cfg.usr.dragimage && (e[cfg.usr.imgfirst + "Key"] || cfg.usr.imgfirstcheck)) {
                        cfg.usr.dragType = "image";
                    } else if (cfg.usr.draglink) {
                        cfg.usr.dragType = "link";
                        e = e.target.parentNode;
                    }

                } else if (cfg.usr.dragimage) {
                    cfg.usr.dragType = "image";
                }
            }

        }


        if (!cfg.usr.dragType) {
            flag.isDrag = false;
            return;
        }
        dObj.text = window.getSelection().toString() || e.target.innerHTML;
        dObj.link = e.href || e.target.href;
        dObj.img = e.target.src;
        if (cfg.usr.setdragurl && cfg.usr.dragType == "text") {
            var tolink;
            if (dObj.text.indexOf("http://") != 0 && dObj.text.indexOf("https://") != 0 && dObj.text.indexOf("ftp://") != 0 && dObj.text.indexOf("rtsp://") != 0 && dObj.text.indexOf("mms://") != 0 && dObj.text.indexOf("chrome-extension://") != 0 && dObj.text.indexOf("chrome://") != 0) {
                tolink = "http://" + dObj.text;
            } else {
                tolink = dObj.text;
            }
            var urlreg = /^((chrome|chrome-extension|ftp|http(s)?):\/\/)([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
            if (urlreg.test(tolink)) {
                cfg.usr.dragType = "link";
                dObj.link = tolink;
            }
        }
        //========== crxID:jlgkpaicikihijadgifklkbpdajbkhjo END===========
        return dObj;
    }

    //when close a tab, save it's url, in order to reopen it: reopenLatestCloseTab
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
    //


    //========== Setting UI
    let createSeetingUi = function(){
        let CSS = `
            #HYetting { z-index: 999997 !important; background: white; width: 100% !important; height: 100% !important; font-family: "微软雅黑" !important; position: fixed !important; top: 0 !important; left: 0 !important; }
            #enu *, .HYontent * { border-radius: 5px !important; font-size: 16px !important; }
            #ogo { background: white !important; box-shadow: inset 0 0 25px 15px yellowgreen !important; width: 80px !important; height: 80px !important; padding: 0 10px 30px 10px !important; display: block !important; font-size: 80px !important; color: cyan !important; text-shadow: 6px 5px 15px black !important; }
            #enu { z-index: 999999 !important; height: 100% !important; width: 100px !important; background: yellowgreen !important; color: white !important; text-align: center !important; }
            #enu li { list-style-type: none !important; border-top: 1px dashed white !important; margin: 10px 15px !important; }
            .elected { box-shadow: inset 2px 2px 1px 4px rgba(16, 12, 12, 0.6) !important; }
            #enu li:hover { background: #05FDE7 !important; color: #FF841D !important; }
            #enu li span { display: block !important; width: 40px !important; height: 40px !important; font-size: 35px !important; font-weight: bold !important; padding: 0 15px !important; }
            #enu b { display: block !important; width: 70px !important; text-align: center !important; margin-top: 10px !important; }
            .HYontent { height: 100% !important; width: 100% !important; overflow-y: scroll !important; position: absolute !important; left: 100px !important; top: 0 !important; z-index: 999998 !important; padding: 20px !important; }
            .HYontent h1 { display: block !important; width: 800px !important; font-size: 30px !important; float: left !important; top: 0 !important; left: 90px !important; padding: 5px 12px !important; margin: 0 10px !important; border-left: 5px solid yellowgreen !important; background: #9acd3259 !important; }
            .HYontent li { list-style-type: none !important; width: 800px !important; height: 56px !important; padding: 5px !important; margin: 5px 20px !important; float: left !important; }
            .HYontent li:hover { box-shadow: inset 1px 1px 1px 3px #9acd32de !important; }
            .HYontent li span:first-child { display: inline-block !important;text-align: left; font-size: 18px !important; font-weight: bold !important; padding: 2px 10px !important; width: 100% !important; height: 24px !important; float: left !important; }
            .HYontent li span:nth-child(2) { display: inline-block !important;text-align: left; padding: 2px 10px !important; height: 20px !important; width: 100% !important; float: left !important; }
            .HYontent li span:nth-child(3) { display: inline-block !important; width: 200px !important; height: 30px !important; padding: 5px !important; margin: 8px 20px !important; position: relative !important; float: right !important; right: 0 !important; top: -56px !important; }
            .HYontent input[type="text"] { width: 100% !important; height: 100% !important; text-align: center !important; border: 1px solid #66666652 !important; font-size: 20px !important; }
            .HYontent input[type="checkbox"] { width: 0 !important; }
            .HYontent select { width: 100% !important; height: 100% !important; }
            .HYontent label { width: 50px !important; height: 100% !important; display: block !important; border: 1px solid #66666652 !important; }
        `;
        let setting = {
            mg1Start: {
                type: '1',
                id: 'mg1'
            },
            mg1title1: {
                item: ['界面', 'UI'],
                type: '2'
            },
            maxLineWidth: {
                item: ['轨迹宽度', 'Line Width'],
                description: ['鼠标轨迹最大宽度,单位"px"'],
                data: {
                    type: 'input',
                    name: 'maxLineWidth',
                    more: 'num'
                }
            },
            lineGrowth: {
                item: ["轨迹增长", 'Line Grow'],
                description: ['轨迹增长速度,单位"px"'],
                data: {
                    type: 'input',
                    name: 'lineGrowth',
                    more: 'num'
                }
            },
            fontSize: {
                item: ["提示字体大小", 'Tips Font Size'],
                description: ['功能提示字体的大小,单位"px"'],
                data: {
                    type: 'input',
                    name: 'fontSize',
                    more: ''
                }
            },
            lineColor: {
                item: ["轨迹颜色", 'Line Color'],
                description: ['允许3或6位16进制值,如 0f0 或 00ff00 都表示绿色'],
                data: {
                    type: 'input',
                    name: 'lineColor',
                    more: 'color'
                }
            },
            funNotDefine: {
                item: ["未定义提示", 'Not Define Tips'],
                description: ['手势或者功能未定义时的提示信息'],
                data: {
                    type: 'input',
                    name: 'funNotDefine',
                    more: ''
                }
            },
            language: {
                item: ["语言", 'Language'],
                description: ['0 表示中文 1 for English'],
                data: {
                    type: 'input',
                    name: 'language',
                    more: 'num'
                }
            },
            sensitivity: {
                item: ["识别距离", 'Sensitivigy'],
                description: ['方向变化计算距离'],
                data: {
                    type: 'input',
                    name: 'sensitivity',
                    more: 'num'
                }
            },
            tipsBackground: {
                item: ["提示文字背景颜色", 'Tis Background Color'],
                description: ['提示文字的背景颜色'],
                data: {
                    type: 'input',
                    name: 'tipsBackground',
                    more: 'color'
                }
            },
            translateTo: {
                item: ["目标语言", 'Language'],
                description: ['要翻译成的语言'],
                data: {
                    type: 'select',
                    name: 'translateTo',
                    more: ''
                }
            },
            vipApi: {
                item: ["破解视频接口", 'Parse Video API'],
                description: ['VIP视频及杰解析接口'],
                data: {
                    type: 'input',
                    name: 'vipApi',
                    more: ''
                }
            },
            translateTimeout: {
                item: ["等待时间", 'Timeout'],
                description: ['翻译等待时间,超时作废'],
                data: {
                    type: 'input',
                    name: 'translateTimeout',
                    more: ''
                }
            },
            mg1title2: {
                item: ['设定', 'Setting'],
                type: '2'
            },
            notBackground: {
                item: ["新标签在前台", 'Open Tab Foreground'],
                description: ['打开新标签后马上转到新标签'],
                data: {
                    type: 'checkbox',
                    name: 'notBackground',
                    more: ''
                }
            },
            searchEnging: {
                item: ["文字搜索引擎", 'Search Enging'],
                description: ['搜索文字的引擎'],
                data: {
                    type: 'select',
                    name: 'searchEnging',
                    more: ''
                }
            },
            imgSearchEnging: {
                item: ["图片搜索引擎", 'Image Search Enging'],
                description: ['用 %URL 代替 图片'],
                data: {
                    type: 'select',
                    name: 'imgSearchEnging',
                    more: ''
                }
            },
            dragtext: {
                item: ["启用拖拽文字", 'Enable Drag Text'],
                description: ['选中文字并且拖拽时候的功能'],
                data: {
                    type: 'checkbox',
                    name: 'dragtext',
                    more: ''
                }
            },
            draginput: {
                item: ["启用拖拽文本框文字", 'Enable Drag Text'],
                description: ['文本框中选中文字并且拖拽时候,使用拖拽的功能'],
                data: {
                    type: 'checkbox',
                    name: 'draginput',
                    more: ''
                }
            },
            draglink: {
                item: ["启用拖拽链接", 'Enable Drag Link'],
                description: ['拖拽链接时候的功能'],
                data: {
                    type: 'checkbox',
                    name: 'draglink',
                    more: ''
                }
            },
            dragimage: {
                item: ["启用拖拽图片", 'Enable Drag Image'],
                description: ['拖拽图片时候的功能'],
                data: {
                    type: 'checkbox',
                    name: 'dragimage',
                    more: ''
                }
            },
            //imgfirst:{item:["启用拖拽图片优先",'Enable Drag Image Priority'],description:['拖拽有链接的图片时候,优先识别为图片'],data:{type:'checkbox',name:'imgfirst',more:''}},
            imgfirstcheck: {
                item: ["图片链接识别为图片", 'Enable Drag Image'],
                description: ['拖拽图片链接时候,识别为拖拽图片的功能'],
                data: {
                    type: 'checkbox',
                    name: 'imgfirstcheck',
                    more: ''
                }
            },
            setdragurl: {
                item: ["拖拽文本链接", 'Enable Drag Image'],
                description: ['拖拽文本为链接时候,识别为拖拽链接'],
                data: {
                    type: 'checkbox',
                    name: 'setdragurl',
                    more: ''
                }
            },
            mg1end: {
                type: '3'
            }
        };
        let selectobjs = {
            //languages
            translateTo: {"Afrikaans":"af","Haitian Creole":"ht","Querétaro Otomi":"otq","Arabic":"ar","Hebrew":"he","Romanian":"ro","Bangla":"bn","Hindi":"hi","Russian":"ru","Bosnian (Latin)":"bs-Latn","Hmong Daw":"mww","Samoan":"sm","Bulgarian":"bg","Hungarian":"hu","Serbian (Cyrillic)":"sr-Cyrl","Cantonese (Traditional)":"yue","Indonesian":"id","Serbian (Latin)":"sr-Latn","Catalan":"ca","Italian":"it","Slovak":"sk","Chinese Simplified":"zh-CHS","Japanese":"ja","Slovenian":"sl","Chinese Traditional":"zh-CHT","Kiswahili":"sw","Spanish":"es","Croatian":"hr","Klingon":"tlh","Swedish":"sv","Czech":"cs","Korean":"ko","Tahitian":"ty","Danish":"da","Latvian":"lv","Tamil":"ta","Dutch":"nl","Lithuanian":"lt","Thai":"th","English":"en","Malagasy":"mg","Tongan":"to","Estonian":"et","Malay":"ms","Turkish":"tr","Fijian":"fj","Maltese":"mt","Ukrainian":"uk","Filipino":"fil","Norwegian Bokmål":"no","Urdu":"ur","Finnish":"fi","Persian":"fa","Vietnamese":"vi","French":"fr","Polish":"pl","Welsh":"cy","German":"de","Portuguese":"pt","Yucatec Maya":"yua","Greek":"el"},
            // image searching
            imgSearchEnging: {
                BaiduImage: "https://image.baidu.com/n/pc_search?queryImageUrl=%URL&uptype=urlsearch",
                GoogleImage: "https://www.google.com/searchbyimage?image_url=%URL",
                TinEye: "http://www.tineye.com/search?url=%URL"
            },
            // text searching
            searchEnging: {
                google: "http://www.google.com/search?q=",
                baidu: "http://www.baidu.com/s?wd=",
                yandex: "http://www.yandex.com/yandsearch?text=",
                Bing: "http://www.bing.com/search?q=",
                yahoo: "http://search.yahoo.com/search?p=",
                wiki: "http://en.wikipedia.org/w/index.php?search=",
                taobao: "http://s.taobao.com/search?q=",
                amazon: "http://www.amazon.com/s/&field-keywords=",
                sogou: "https://www.sogou.com/web?query=",
                s360: "http://www.haosou.com/s?q="
            }
        };
        //UI menu
        let span = '',
            xx = '',
            isOn = '',
            isChecked = '',
            t = '',
            txt = `
                <div id="enu">
                    <span id="ogo">☈</span>
                    <li data-target="mg1"><span>◧</span><b>Config</b></li>
                    <li data-target="mg2"><span>↯</span><b>Gesture</b></li>
                    <li data-target="mg3"><span>⎘</span><b>Drag</b></li>
                    <li data-target="mg4"><span>❓</span><b>About</b></li>
                    <li id="lose"><span>🗙</span><b>Close</b></li>
                </div>
            `;
        //Setting main: config
        for (let i in setting) {
            if (setting[i].type) {
                switch (setting[i].type) {
                    case '1':
                        txt += `<div id="${setting[i].id}" class="HYontent">`;
                        break;
                    case '2':
                        txt += `<h1>${setting[i].item[0]}</h1>`;
                        break;
                    case 1:
                        txt += `<div id="${setting[i].id}" class="HYontent">`;
                        break;
                    default:
                        txt += `</div>`;
                        break;
                }
            } else {
                if (setting[i].data.type === 'input') {
                    if (setting[i].data.more === 'color') {
                        span = `<input type="text" name="${setting[i].data.name}" value="${GM_getValue(setting[i].data.name,cfg.usr[setting[i].data.name] || _cfg.usr[setting[i].data.name])}" style="background:#${GM_getValue(setting[i].data.name,cfg.usr[setting[i].data.name])};"  data-mark="color">`;
                    } else if (setting[i].data.more === 'num') {
                        span = `<input type="text" name="${setting[i].data.name}" value="${GM_getValue(setting[i].data.name,cfg.usr[setting[i].data.name] || _cfg.usr[setting[i].data.name])}" data-mark="num">`;
                    } else {
                        span = `<input type="text" name="${setting[i].data.name}" value="${GM_getValue(setting[i].data.name,cfg.usr[setting[i].data.name] || _cfg.usr[setting[i].data.name])}" data-mark="normal">`;
                    }
                } else if (setting[i].data.type === 'select') {
                    // setting[i]
                    span = makeSelectEle(selectobjs[setting[i].data.name], setting[i].data.name);
                } else {
                    isChecked = GM_getValue(setting[i].data.name, cfg.usr[setting[i].data.name]) ? 'checked' : '';
                    isOn = GM_getValue(setting[i].data.name, cfg.usr[setting[i].data.name]) ? 'style = "background:yellowgreen;"' : 'style = "background:gray;"';
                    span = `<label for="${setting[i].data.name}" ${isOn}><input type="checkbox" id="${setting[i].data.name}"  ${isChecked}></label>`;

                }
                txt += `<li><span>${setting[i].item[0]}</span><span>${setting[i].description[0]}</span><span>${span}</span></li>`;
            }
        }

        //setting main: gestures
        let _local = {
            t2n: ['手势', 'Gesture'],
            dt2n: ['拖拽文本', 'Drag Text'],
            dl2n: ['拖拽链接', 'Drag Link'],
            di2n: ['拖拽图片', 'Drag Image'],
        };

        function makeSelectEle(obj, name) {
            let select = `<select name="${name}" data-mark="select">`;
            let val = GM_getValue(cfg.usr[name], _cfg.usr[name]);
            for (let i in obj) {
                select += `<option value ="${obj[i]}">${i}</option>`;
            }
            select = select.replace(`\"${val}\"`, `\"${val}\" selected`);
            select += '</select>';

            return select;
        }

        let letter2arrow = function(str){
            // function letter2arrow(str){
            return str.replace(/[^uUdDlLrR⬅➞⬇⬆]/g, '').replace(/[lL]/g, '⬅').replace(/[rR]/g, '➞').replace(/[dD]/g, '⬇').replace(/[uU]/g, '⬆');
        };
        let arrow2letter = function(str){
            return str.replace(/⬅/g, 'L').replace(/➞/g, 'R').replace(/⬇/g, 'D').replace(/⬆/g, 'U');
        };

        function makeDragUI(type, curren) {
            let tt = '';
            tt += `<h1>${_local[type][cfg.usr.language]}</h1>`;
            for (let i in fn[type]) {
                t = '';
                for (let j in curren) {
                    if (i === curren[j]) {
                        t = j;
                    }
                }
                tt += `<li><span>${i}</span><span>${fn[type][i][cfg.usr.language]}</span><span><input type="text" name="${i}" value="${letter2arrow(t)}" data-mark="${type}"></span></li>`;
            }
            return tt;
        }
        //gesture
        txt += '<div id="mg2" class="HYontent">' + makeDragUI('t2n', cfg.t2n) + '</div>';

        txt += '<div id="mg3" class="HYontent">' + makeDragUI('dt2n', cfg.dt2n) + makeDragUI('dl2n', cfg.dl2n) + makeDragUI('di2n', cfg.di2n) + '</div>';
        txt += '<div id="mg4" class="HYontent"><a href="https://github.com/woolition/greasyforks/blob/master/mouseGesture/HY-MouseGesture.md" style="display:block;width: 90%;height: auto;font-size: 60px;text-decoration: none;font-weight: bolder;padding: 50px 30px; color:yellowgreen;"> (●￣(ｴ)￣●)づ <br>点我看更多介绍! </a></div>';

        GM_addStyle(CSS);
        let a = document.createElement('div');
        a.id = "HYetting";
        a.innerHTML = txt;
        document.documentElement.appendChild(a);
        let selected = function(e) {
         // this.selected = function(e) {
            let tar;
            if (e.target.tagName === "LI") {
                tar = e.target;
            } else {
                tar = e.target.parentNode;
            }
            [].forEach.call(document.querySelectorAll('#enu li'), function(item) {
                item.setAttribute('class', '');
            });
            tar.setAttribute('class', 'elected');
            [].forEach.call(document.querySelectorAll('.HYontent'), function(item) {
                item.style.display = "none";
            });
            document.getElementById(tar.dataset.target).setAttribute('style', 'display:block;');
        };
        let setConfig = function(e) {
         // this.setConfig = function(e) {
            // this.updateFns = function(cssSelector){
            function updateFns(cssSelector) {
                let a = {};
                [].forEach.call(document.querySelectorAll(cssSelector), function(item) {
                    if (item.value) {
                        a[arrow2letter(item.value)] = item.name;
                        item.style.background = 'yellowgreen';
                    } else {
                        item.style.background = 'gray';
                    }
                });
                return a;
            }
            switch (e.target.dataset.mark) {
                case 'color':
                    cfg.usr[e.target.name] = e.target.value;
                    // GM_setValue('cfg', cfg);
                    e.target.style.background = '#' + e.target.value + '!important';
                    break;
                case 'num':
                    let b;
                    switch (e.target.name) {
                        case 'language':
                            b = (e.target.value == 1 || e.target.value == 0) ? e.target.value : cfg.usr[e.target.name];
                            break;
                        case 'sensitivity':
                        case 'fontSize':
                            b = parseInt(e.target.value);
                            break;
                        default:
                            b = parseFloat(parseFloat(e.target.value).toFixed(2));
                            break;
                    }
                    cfg.usr[e.target.name] = b;
                    // GM_setValue('cfg', cfg);
                    break;
                case 'select':
                case 'normal':
                    cfg.usr[e.target.name] = e.target.value;
                    // GM_setValue('cfg', cfg);
                    break;
                default:
                    cfg[e.target.dataset.mark] = updateFns(`input[data-mark="${e.target.dataset.mark}"]`);
                    break;
            }
            GM_setValue('cfg', cfg);
            GM_setValue('configChanged', Date());
        };
        let onOff = function(e) {
         // this.onOff = function(e) {
            cfg.usr[e.target.id] = e.target.checked;
            GM_setValue('cfg', cfg);
            GM_setValue('configChanged', Date());
            if (cfg.usr[e.target.id]) {
                e.target.parentNode.style.background = "yellowgreen";
            } else {
                e.target.parentNode.style.background = "gray";
            }
        };
        [].forEach.call(document.querySelectorAll('#enu li'), function(item) {
            item.addEventListener('click', selected, false);
        });
        [].forEach.call(document.querySelectorAll('#HYetting input[type=text]'), function(item) {
            item.addEventListener('blur', setConfig, false);
        });
        [].forEach.call(document.querySelectorAll('#HYetting select'), function(item) {
            item.addEventListener('change', setConfig, false);
        });
        [].forEach.call(document.querySelectorAll('#HYetting input[data-mark*="2n"]'), function(item) {
            item.addEventListener('keyup', function(event) {
                event.target.value = letter2arrow(event.target.value);
            }, false);
        });
        [].forEach.call(document.querySelectorAll('#HYetting input[type=checkbox]'), function(item) {
            item.addEventListener('change', onOff, false);
        });
        //init
        [].forEach.call(document.querySelectorAll('.HYontent'), function(item) {
            item.style.display = "none";
        });
        document.getElementById('mg1').style.display = 'block';
        document.getElementById('lose').addEventListener('click', function() {
            document.documentElement.removeChild(document.getElementById("HYetting"));
        }, false);

    };
    // return;

})();
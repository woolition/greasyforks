// ==UserScript==
// @name               HY-MouseGesture
// @name:zh-CN         鼠标手势
// @description        HY's mouse gesture script,supports ringt-key draw track functions and left-key drag functions.Drag target can be [Text] & [Links] & [Image]  Customizenable → Right click to draw 'S' to costomize, track:ULDRDLU
// @description:zh-CN  鼠标手势脚本,支持右键轨迹手势和左键拖拽功能.可以拖拽[文本],[链接]和[图片],支持自定义设置:鼠标画S形,路径 ULDRDLU
// @version            1.1
// @include            *
// @noframes
// @run-at             document-start
// @grant              GM_openInTab
// @grant              GM_addStyle
// @grant              GM_setValue
// @grant              GM_getValue
// @grant              GM_setClipboard
// @grant              GM_download
// @grant              window.close
// @namespace          https://greasyfork.org/users/104201
// ==/UserScript==
/* jshint esversion: 6 */
// due to modul pattern: http://www.adequatelygood.com/JavaScript-Module-Pattern-In-Depth.html


const MouseGesture = (function() {
    // let MG = {};
    this.MG = {};
    let defaultTrack2name = {
            U: "toTop",
            D: "toBottom",
            L: "back",
            R: "forward",
            DR: "close",
            LU: "reopenLatestCloseTab",
            ULDRDLU: 'setting'
        },
        defaultDragText2name = {
            L: "copySelectedText",
            R: "searchSelectedText"
        },
        defaultDragLink2name = {
            R: 'openLink',
            L: 'copyLink'
        },
        defaultDragImg2name = {
            D: 'saveImg',
            R: 'searchImg',
            U: 'copyImgURL',
            L: 'selectTheImage'
        },
        defaultConfig = {
            //canvas setting
            minLineWidth: 1,
            lineGrowth: 0.6,
            maxLineWidth: 10,
            lineColor: '00AAA0',
            //tips setting
            fontSize: 50,//tips font size
            tipsBackground: "00000055",//div background
            funNotDefine: "  (◔ ‸◔)？",//function not define tips
            //language 0:Chinese 1:English
            language: 1,
            SENSITIVITY: 10, // minLength
            searchEnging: "https://www.baidu.com/s?ie=UTF-8&wd=%s",
            // 0:open new tab background 1:open new tab active
            notBackground: 1,
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
            imgSearchEnging: "https://image.baidu.com/n/pc_search?queryImageUrl=%URL&uptype=urlsearch"
        };
    //save the latest closed tab Url, used in : reopenLatestCloseTab
    window.addEventListener('unload', function() {
        GM_setValue('latestTab', window.location.href);
    }, false);
    MG.config = GM_getValue('config', defaultConfig);

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
    let funcValues = {
        // image searching
        imgBaidu: {
            s: "https://image.baidu.com/n/pc_search?queryImageUrl=%URL&uptype=urlsearch",
            name: "Baidu Image"
        },
        imgGoogle: {
            s: "https://www.google.com/searchbyimage?image_url=%URL",
            name: "Google Image"
        },
        imgTinEye: {
            s: "http://www.tineye.com/search?url=",
            name: "TinEye"
        },
        // common searching
        google: {
            s: "http://www.google.com/search?q=",
            name: "Google"
        },
        baidu: {
            s: "http://www.baidu.com/s?wd=",
            name: "Baidu"
        },
        yandex: {
            s: "http://www.yandex.com/yandsearch?text=",
            name: "Yandex"
        },
        Bing: {
            s: "http://www.bing.com/search?q=",
            name: "Bing"
        },
        yahoo: {
            s: "http://search.yahoo.com/search?p=",
            name: "Yahoo"
        },
        wiki: {
            s: "http://en.wikipedia.org/w/index.php?search=",
            name: "Wiki"
        },
        taobao: {
            s: "http://s.taobao.com/search?q=",
            name: "Taobao"
        },
        amazon: {
            s: "http://www.amazon.com/s/&field-keywords=",
            name: "Amazon"
        },
        sogou: {
            s: "https://www.sogou.com/web?query=",
            name: "sougou"
        },
        s360: {
            s: "http://www.haosou.com/s?q=",
            name: "360"
        }
    };
    let fn = {
        gesture: {
            stopLoading: ['停止加载', 'StopLoading'],
            reload: ['刷新', 'Refresh'],
            close: ['关闭', 'Close'],
            back: ['后退', 'Back'],
            forward: ['前进', 'Forward'],
            toTop: ['到顶部', 'Scroll to Top'],
            toBottom: ['到底部', 'Scroll to Bottom'],
            reopenLatestCloseTab: ['打开最近关闭窗口', 'Reopen Latest Closed Window'],
            setting: ['设置', 'Settings'],
            URLLevelUp: ['网址向上一层', 'URL hierarchy up'],
            cloneTab: ['克隆标签页', 'Duplicate tab'],
            openBlankTab: ['打开空白页', 'Open New Blank Tab'],
        },
        dragText: {
            searchSelectedText: ['搜索选中文本', 'Search Selected Text'],
            copySelectedText: ['复制选中文本', 'Copy Selected Text']
        },
        dragLink: {
            openLink: ['打开链接', 'Open Link'],
            copyLink: ['复制链接', 'Copy Link']
        },
        dragImg: {
            saveImg: ['保存图片', 'Save Image'],
            searchImg: ['搜索图片', 'Search Image'],
            copyImage: ['复制图片', 'Copy Image to ClickBoard'],
            copyImgURL: ['复制图片链接', 'Copy ImageURL'],
            openImgNewTab: ['新标签打开图片', 'Open Image in New Tab'],
            image2DataURL: ['复制图片为DataURL', 'Copy Image as DataURL'],
            selectTheImage: ['选中图片', 'Select This Image']
        }
    };
    //gesture functions
    MG.name2func = {
        stopLoading: function() {
            window.stop();
        },
        reload: function() {
            history.go(0);
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
            GM_openInTab(GM_getValue('latestTab','about:blank'), {
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

        /*
        //not torking
        zoomIn: function(){
           setTimeout(zoomer, 200);
            function zoomer(evt){
                let a, b,isZoom = true;
                a = document.elementFromPoint(evt.clientX,evt.clientY).style.zoom=MG.config.zoom;
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
            openURL = MG.config.searchEnging.replace(/%s/, txt) || defaultConfig.config.searchEnging.replace(/%s/, txt);
            // openURL = searchEnging.replace(/%s/,txt);
            GM_openInTab(openURL, {
                active: MG.config.notBackground || defaultConfig.config.notBackground
            });
        },
        copySelectedText: function() {
            GM_setClipboard(MG.dragObject.text, "text");
        },
        openLink: function() {
            //TamperMonkey
            GM_openInTab(MG.dragObject.link, {
                active: true
            });
        },
        copyLink: function() {
            //TamperMonkey
            GM_setClipboard(MG.dragObject.link, "text");
        },
        saveImg: function() {
            //TamperMonkey
            let arr = MG.dragObject.img.split('/');
            let name = arr[arr.length - 1];
            GM_download(MG.dragObject.img, name);
            //method 2
            /*
            let a = document.createElement('a');
            a.href = MG.dragObject.img; a.setAttribute('download', MG.dragObject.img.split('/').pop());
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
            GM_openInTab(MG.config.imgSearchEnging.replace(/%URL/, MG.dragObject.img), {
                active: MG.config.isImgSearchTabActive
            });
        },
        selectTheImage: function() {
            // it may not working on some browsers [develping standard]
            //TamperMonkey
            document.execCommand('selectAll');
            let sel = document.getSelection();
            sel.collapse(MG.dragObject.target, 0);
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
            GM_setClipboard(MG.dragObject.img, "text");
        },
        openImgNewTab: function() {
            //TamperMonkey
            GM_openInTab(MG.dragObject.img, {
                active: true
            });
        },
        setting: function() {
            if (document.getElementById('HYMGSetting')) {
                return;
            }
            createSeetingUi();
        }
    };
    // support functions========================
    //check if string is an url
    function isURL(string) {
        try {
            new URL(string);
        } catch (e) {
            return false;
        }
        return true;
    }
    //==>> return: {canvas:canvas,type:fileType,mime:mimeType}
    function canvasDrawTheImage(e) {
        // let img = e.target,
        let img = MG.dragObject.target,
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
        let i, rw, rh;
        if (typeof ele.naturalWidth == 'undefined') { // IE 6/7/8
            i = new Image();
            i.src = ele.src;
            rw = i.width;
            rh = i.height;
        } else { // HTML5 browsers
            rw = ele.naturalWidth;
            rh = ele.naturalHeight;
        }
        return {
            width: rw,
            height: rh
        };
    }
    //========================================

    MG.track2name = GM_getValue('track2name', defaultTrack2name);
    //dragType = "text"
    MG.dragText2name = GM_getValue('dragText2name', defaultDragText2name);
    //dragType = "link"
    MG.dragLink2name = GM_getValue('dragLink2name', defaultDragLink2name);
    //dragType = "img"
    MG.dragImg2name = GM_getValue('dragImg2name', defaultDragImg2name);
    //canvas start coordinate
    MG.startX = 0;
    MG.startY = 0;

    //create <canvas>
    MG.canvas = document.createElement("canvas");
    MG.canvas.style.cssText = "position:fixed;top:0;left:0;z-index:9999999;";
    MG.ctx = MG.canvas.getContext("2d");

    //create tips<div>
    MG.tips = document.createElement('div');
    MG.tips.style.cssText = `
        all: initial !important;
        position: fixed !important;
        z-index: 9999998 !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        font-family: "Orkney Regular", "Arial", sans-serif !important;
        /*font-size: 50px !important;*/
        font-size: ${MG.config.fontSize  || defaultConfig.fontSize}px !important;
        color:white !important;
        white-space: nowrap !important;
        line-height: normal !important;
        text-shadow: 1px 1px 5px rgba(0,0,0, 0.8) !important;
        text-align: center !important;
        padding: 25px 20px 20px 20px !important;
        border-radius: 5px !important;
        font-weight: bold !important;
        background:#${MG.config.tipsBackground || defaultConfig.tipsBackground} !important;
    `;

    let x, y, track = "",
        //use to show tips
        symbol = '',
        symbolTrack = '';
    MG.dragObject = {};
    // when a gesture is not define, show this tips
    function showGestureNotDefineTips() {
        MG.tips.innerHTML = symbolTrack + '<br/>'+(MG.config.funNotDefine || defaultConfig.funNotDefine);
        // MG.tips.innerHTML = symbolTrack + '<br/>  (◔ ‸◔)？';
    }

    const tracer = function(e) {
        let cx = e.clientX,
            cy = e.clientY,
            dx = Math.abs(cx - x),
            dy = Math.abs(cy - y),
            distance = dx * dx + dy * dy;
        if (distance < MG.config.SENSITIVITY * MG.config.SENSITIVITY) {
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
                    switch (MG.config.dragType) {
                        case "text":
                            if (MG.dragText2name[track] !== undefined) {
                                MG.tips.innerHTML = symbolTrack + '<br/>' + fn.dragText[MG.dragText2name[track]][MG.config.language];
                            } else {
                                showGestureNotDefineTips();
                            }
                            break;
                        case "link":
                            if (MG.dragLink2name[track] !== undefined) {
                                MG.tips.innerHTML = symbolTrack + '<br/>' + fn.dragLink[MG.dragLink2name[track]][MG.config.language];
                            } else {
                                showGestureNotDefineTips();
                            }
                            break;
                        case "image":
                            if (MG.dragImg2name[track] !== undefined) {
                                MG.tips.innerHTML = symbolTrack + '<br/>' + fn.dragImg[MG.dragImg2name[track]][MG.config.language];
                            } else {
                                showGestureNotDefineTips();
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case "common":
                    if (MG.track2name[track] !== undefined) {
                        //show gesture track and function name
                        MG.tips.innerHTML = symbolTrack + '<br/>' + fn.gesture[MG.track2name[track]][MG.config.language];
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
            MG.ctx.lineWidth = Math.min(MG.config.maxLineWidth, MG.ctx.lineWidth += MG.config.lineGrowth);
            console.log(MG.ctx.lineWidth);
            MG.ctx.beginPath();
            MG.ctx.moveTo(x, y);
            MG.ctx.lineTo(e.clientX, e.clientY);
            MG.ctx.stroke();
            MG.ctx.closePath();
        }
        // update (x,y)
        x = cx;
        y = cy;
    };

    window.addEventListener('mousedown', function(e) {
        // 3 : mouse.right ; 1:mouse.left
        if (e.which === 3) {
            x = e.clientX;
            y = e.clientY;
            track = "";

            symbolTrack = "";
            flag.isPress = true;
            flag.actionType = "common";
            window.addEventListener('mousemove', tracer, false);
        }
    }, false);

    //create <canvas> to show track,create <div> to show tips
    function addCanvas(e) {
        //append tips <div>
        document.documentElement.appendChild(MG.tips);
        //append <canvas>
        document.documentElement.appendChild(MG.canvas);
        //set canvas attribute or clear content
        MG.canvas.left = 0 + "px";
        MG.canvas.top = 0 + "px";
        MG.canvas.width = window.innerWidth;
        MG.canvas.height = window.innerHeight;
        MG.ctx.lineCap = "round";
        MG.ctx.lineJoin = "round";
        MG.ctx.lineWidth = MG.config.minLineWidth;
        MG.ctx.strokeStyle = '#' + MG.config.lineColor; //like delicious link color//line color
        MG.startX = e.clientX;
        MG.startY = e.clientY;

        flag.hascanvas = true;

        //clear track & symbolTrack
        track = "";
        symbolTrack = "";
    }
    //remove <canvas> and tips<div> .ect
    function reset() {
        if (flag.hascanvas) {
            document.documentElement.removeChild(MG.canvas);
            document.documentElement.removeChild(MG.tips);
            flag.hascanvas = false;
        }
        flag.isPress = false;
    }

    window.addEventListener('contextmenu', function(e) {
        reset();
        window.removeEventListener('mousemove', tracer, false);
        if (track !== "") {
            e.preventDefault();
            if (MG.track2name.hasOwnProperty(track)) {
                MG.name2func[MG.track2name[track]]();
            }
        }
    }, false);

    window.addEventListener('dragstart', function(e) {
        x = e.clientX;
        y = e.clientY;
        track = "";
        symbolTrack = '';
        flag.isPress = true;
        flag.isDrag = true;
        flag.actionType = "drag";
        processDrag(e);
        console.log(MG.dragObject);
        window.addEventListener('drag', tracer, false);
        //避免释放鼠标时候,坐标跑到(0,0) window.allowDrop
        this.allowDrop = function(event) {
            event.preventDefault();
        };
        MG.tips.addEventListener("dragover", allowDrop, false);
        MG.canvas.addEventListener("dragover", allowDrop, false);
    }, false);

    window.addEventListener('dragend', function(e) {
        window.removeEventListener('drag', tracer, false);
        MG.tips.removeEventListener("dragover", allowDrop, false);
        MG.canvas.removeEventListener("dragover", allowDrop, false);
        reset();
        isDrag = false;
        if (track !== "") {
            // dragType + track => function
            switch (MG.config.dragType) {
                case "text":
                    if (MG.dragText2name.hasOwnProperty(track)) {
                        console.log('text');
                        MG.name2func[MG.dragText2name[track]]();
                    }
                    break;
                case "link":
                    if (MG.dragLink2name.hasOwnProperty(track)) {
                        console.log('link');
                        MG.name2func[MG.dragLink2name[track]]();
                    }
                    break;
                case "image":
                    if (MG.dragImg2name.hasOwnProperty(track)) {
                        console.log('img');
                        MG.name2func[MG.dragImg2name[track]](e);
                    }
                    break;
                default:
                    break;
            }
        }

    }, false);

    function processDrag(e) {
        //========这部分借鉴 crxMouse Chrome™ Gestures, crxID:jlgkpaicikihijadgifklkbpdajbkhjo===========
        MG.dragObject.target = e.target;
        let nodetype = e.target.nodeType;
        //confirm dragType
        if (nodetype === 3) {
            let isLink = e.target.parentNode.href;
            if (MG.config.dragtext && !isLink) {
                MG.config.dragType = "text";
            } else if (isLink) { //use regular express to match?
                e = e.target.parentNode;
                MG.config.dragType = "link";
            }
        }
        if (nodetype === 1) {
            if (e.target.value && MG.config.dragtext && MG.config.draginput) {
                MG.config.dragType = "text";
            } else if (e.target.href) {
                if (window.getSelection().toString() == "" || e.target.textContent.length > window.getSelection().toString().lenght) {
                    if (MG.config.draglink) {
                        MG.config.dragType = "link";
                    }
                } else {
                    if (MG.config.dragtext) {
                        MG.config.dragType = "text";
                    }
                }
                if (!MG.config.dragtext && MG.config.draglink) {
                    MG.config.dragType = "link";
                }
            } else if (e.target.src) {
                if (e.target.parentNode.href) {
                    if (MG.config.dragimage && (e[MG.config.imgfirst + "Key"] || MG.config.imgfirstcheck)) {
                        MG.config.dragType = "image";
                    } else if (MG.config.draglink) {
                        MG.config.dragType = "link";
                        e = e.target.parentNode;
                    }

                } else if (MG.config.dragimage) {
                    MG.config.dragType = "image";
                }
            }

        }


        if (!MG.config.dragType) {
            flag.isDrag = false;
            return;
        }
        MG.dragObject.text = window.getSelection().toString() || e.target.innerHTML;
        MG.dragObject.link = e.href || e.target.href;
        MG.dragObject.img = e.target.src;
        if (MG.config.setdragurl && MG.config.dragType == "text") {
            var tolink;
            if (MG.dragObject.text.indexOf("http://") != 0 && MG.dragObject.text.indexOf("https://") != 0 && MG.dragObject.text.indexOf("ftp://") != 0 && MG.dragObject.text.indexOf("rtsp://") != 0 && MG.dragObject.text.indexOf("mms://") != 0 && MG.dragObject.text.indexOf("chrome-extension://") != 0 && MG.dragObject.text.indexOf("chrome://") != 0) {
                tolink = "http://" + MG.dragObject.text;
            } else {
                tolink = MG.dragObject.text;
            }
            var urlreg = /^((chrome|chrome-extension|ftp|http(s)?):\/\/)([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
            if (urlreg.test(tolink)) {
                MG.config.dragType = "link";
                MG.dragObject.link = tolink;
            }
        }
        //========== crxID:jlgkpaicikihijadgifklkbpdajbkhjo END===========
        return MG.dragObject;
    }

    // Setting UI
    function createSeetingUi() {
        let CSS = `
            #HYMGSetting {z-index:999997;width:960px;height:540px;margin:0;padding:0;font-family:"微软雅黑";background:white;border:7px solid yellowgreen;border-radius:10px;position:fixed;top:50px;left:50px;box-shadow:2px 2px 2px 4px darkcyan;}
            #MGlogo {width:90px;height:85px;display:block;font-size:90px;font-weight:bolder;text-align:center;position:relative;top:-23px;color:#000;vertical-align:top;text-decoration:blink;text-shadow:5px 5px 3px #05fde7;}
            #MGmenu {z-index:999999;height:100%;width:90px;background:yellowgreen;color:white;}
            #MGmenu li {list-style-type:none;background:yellowgreen;border-top:1px dashed white;}
            .MGselected {box-shadow:inset 2px 2px 1px 4px rgba(16,12,12,0.6);}
            #MGmenu li:hover {background:#05FDE7 !important;color:#FF841D;animation:MGmenuLi 0.4s;-moz-animation:MGmenuLi 0.4s;-webkit-animation:MGmenuLi 0.4s;-o-animation:myfirst 0.4s;}
            @keyframes MGmenuLi {from {background:yellowgreen;color:white;} to {background:#05FDE7;} }
            @-moz-keyframes MGmenuLi {from {background:yellowgreen;} to {background:#05FDE7;} }
            @-webkit-keyframes MGmenuLi {from {background:yellowgreen;} to {background:#05FDE7;} }
            @-o-keyframes MGmenuLi {from {background:#16DA00;} to {background:#05FDE7;} }
            #MGmenu li span {display:block;width:50px;height:50px;font-size:50px;padding:5px 20px;text-align:center;}
            #MGmenu b {display:block;height:30px;font-size:20px;width:90px;text-align:center;}
            /*#mg1,#mg2,#mg3,#mg4,#mg5*/.HYMGcontent {height:540px;overflow-x:hidden;width:870px;font-size:16px;font-family:"微软雅黑";overflow-y:scroll;position:absolute;left:90px;top:0;z-index:999998;padding:10px,20px;}
            .HYMGcontent * {border-radius:8px;}
            .HYMGcontent h1 {display:block;width:820px;font-size:30px;float:left;top:0;left:90px;padding:5px;margin:0 10px;border-left:5px solid yellowgreen;background:#9acd3259;}
            .HYMGcontent li {list-style-type:none;width:810px;height:56px;padding:5px 5px;margin:5px 20px;float:left;}
            .HYMGcontent li:hover {box-shadow:inset 1px 1px 1px 3px #9acd32de;}
            .HYMGcontent li span:first-child {display:inline-block;font-size:18px;font-weight:bold;padding:2px 10px;width:450px;height:24px;float:left;}
            .HYMGcontent li span:nth-child(2) {display:inline-block;padding:2px 10px;height:20px;width:530px;float:left;}
            .HYMGcontent li span:nth-child(3) {display:inline-block;width:200px;height:30px;padding:5px;margin:8px 20px;position:relative;right:0;top:0;border:1px solid #66666652;}
            .HYMGcontent input[type="text"] {width:100%;height:100%;text-align:center;background:transparent;border:0;font-size:20px;}
            .HYMGcontent input[type="checkbox"] {width:0px;}
            .HYMGcontent label {width:100%;height:100%;display:block;}
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
                    more: 'num'
                }
            },
            lineColor: {
                item: ["轨迹颜色", 'Line Color'],
                description: ['允许3|6|8位16进值,如 0f0 或 00ff00 都表示绿色,8位值后2位表示透明度'],
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
            SENSITIVITY: {
                item: ["识别距离", 'Sensitivigy'],
                description: ['方向变化计算距离'],
                data: {
                    type: 'input',
                    name: 'SENSITIVITY',
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
            mg1title2: {
                item: ['设定', 'Setting'],
                type: '2'
            },
            notBackground: {
                item: ["新标签在前台", 'Tis Background Color'],
                description: ['打开新标签后马上转到新标签'],
                data: {
                    type: 'checkbox',
                    name: 'notBackground',
                    more: ''
                }
            },
            imgSearchEnging: {
                item: ["图片搜索引擎", 'Image Search Enging'],
                description: ['用 %URL 代替 图片'],
                data: {
                    type: 'input',
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
        //UI menu
        let span = '',
            xx = '',
            isOn = '',
            isChecked = '',
            t = '',
            txt = `
                <div id="MGmenu">
                    <span id="MGlogo">☈</span>
                    <li data-target="mg1"><span>◧</span><b>Config</b></li>
                    <li data-target="mg2"><span>↯</span><b>Gesture</b></li>
                    <li data-target="mg3"><span>⎘</span><b>Drag</b></li>
                    <li data-target="mg4"><span>❓</span><b>About</b></li>
                    <li data-target="mg5" id="MGClose"><span>🗙</span><b>Close</b></li>
                </div>
            `;
        //Setting main: config
        for (let i in setting) {
            if (setting[i].type) {
                switch (setting[i].type) {
                    case '1':
                        txt += `<div id="${setting[i].id}" class="HYMGcontent">`;
                        break;
                    case '2':
                        txt += `<h1>${setting[i].item[0]}</h1>`;
                        break;
                    case 1:
                        txt += `<div id="${setting[i].id}" class="HYMGcontent">`;
                        break;
                    default:
                        txt += `</div>`;
                        break;
                }
            } else {
                if (setting[i].data.type === 'input') {
                    if (setting[i].data.more === 'color') {
                        span = `<input type="text" name="${setting[i].data.name}" value="${GM_getValue(setting[i].data.name,MG.config[setting[i].data.name] || defaultConfig[setting[i].data.name])}" style="background:#${GM_getValue(setting[i].data.name,MG.config[setting[i].data.name])};"  data-mark="color">`;
                    } else if(setting[i].data.more === 'num'){
                        span = `<input type="text" name="${setting[i].data.name}" value="${GM_getValue(setting[i].data.name,MG.config[setting[i].data.name] || defaultConfig[setting[i].data.name])}" data-mark="num">`;
                    } else {
                        span = `<input type="text" name="${setting[i].data.name}" value="${GM_getValue(setting[i].data.name,MG.config[setting[i].data.name] || defaultConfig[setting[i].data.name])}" data-mark="normal">`;
                    }
                } else {
                    isChecked = GM_getValue(setting[i].data.name, MG.config[setting[i].data.name]) ? 'checked' : '';
                    isOn = GM_getValue(setting[i].data.name, MG.config[setting[i].data.name]) ? 'style = "background:yellowgreen;"' : 'style = "background:gray;"';
                    // console.log(isOn);
                    span = `<label for="${setting[i].data.name}" ${isOn}><input type="checkbox" id="${setting[i].data.name}"  ${isChecked}></label>`;

                }
                txt += `<li><span>${setting[i].item[0]}</span><span>${setting[i].description[0]}</span><span>${span}</span></li>`;
            }
        }

        //setting main: gestures
        let _local = {
            gesture: ['手势', 'Gesture'],
            dragText: ['拖拽文本', 'Drag Text'],
            dragLink: ['拖拽链接', 'Drag Link'],
            dragImg: ['拖拽图片', 'Drag Image'],
        };
        this.letter2arrow = function(str) {
            // function letter2arrow(str){
            return str.replace(/[^uUdDlLrR⬅➞⬇⬆]/g, '').replace(/[lL]/g, '⬅').replace(/[rR]/g, '➞').replace(/[dD]/g, '⬇').replace(/[uU]/g, '⬆');
        };
        this.arrow2letter = function(str) {
            // function arrow2letter(str){
            return str.replace(/⬅/g, 'L').replace(/➞/g, 'R').replace(/⬇/g, 'D').replace(/⬆/g, 'U');
        };

        function makeDragUI(type, curren) {
            let tt = '';
            tt += `<h1>${_local[type][MG.config.language]}</h1>`;
            for (let i in fn[type]) {
                t = '';
                for (let j in curren) {
                    if (i === curren[j]) {
                        t = j;
                    }
                }
                tt += `<li><span>${i}</span><span>${fn[type][i][MG.config.language]}</span><span><input type="text" name="${i}" value="${letter2arrow(t)}" data-mark="${type}"></span></li>`;
            }
            return tt;
        }
        //gesture
        txt += '<div id="mg2" class="HYMGcontent">' + makeDragUI('gesture', MG.track2name) + '</div>';

        txt += '<div id="mg3" class="HYMGcontent">' + makeDragUI('dragText', MG.dragText2name) + makeDragUI('dragLink', MG.dragLink2name) + makeDragUI('dragImg', MG.dragImg2name) + '</div>';
        txt += '<div id="mg4" class="HYMGcontent"><a href="https://github.com/woolition/greasyforks/blob/master/mouseGesture/HY-MouseGesture.md" style="display:block;width: 90%;height: auto;font-size: 60px;text-decoration: none;font-weight: bolder;padding: 50px 30px; color:yellowgreen;"> (●￣(ｴ)￣●)づ <br>点我看更多介绍! </a></div>';

        GM_addStyle(CSS);
        let a = document.createElement('div');
        a.id = "HYMGSetting";
        a.innerHTML = txt;
        document.documentElement.appendChild(a);
        this.selected = function(e) {
            let tar;
            if (e.target.tagName === "LI") {
                tar = e.target;
            } else {
                tar = e.target.parentNode;
            }
            [].forEach.call(document.querySelectorAll('#MGmenu li'), function(item) {
                item.setAttribute('class', '');
            });
            tar.setAttribute('class', 'MGselected');
            [].forEach.call(document.querySelectorAll('.HYMGcontent'), function(item) {
                item.style.display = "none";
            });
            document.getElementById(tar.dataset.target).setAttribute('style', 'display:block;');
        };
        this.setConfig = function(e) {
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
                    MG.config[e.target.name] = e.target.value;
                    GM_setValue('config', MG.config);
                    e.target.style.background = '#' + e.target.value;
                    break;
                case 'num':
                    let b;
                    switch (e.target.name) {
                        case 'language':
                            b = (e.target.value == 1 || e.target.value == 0) ? e.target.value : MG.config[e.target.name];
                            break;
                        case 'SENSITIVITY':
                        case 'fontSize':
                            b = parseInt(e.target.value);
                            break;
                        default:
                            b = parseFloat(parseFloat(e.target.value).toFixed(2));
                            break;
                    }
                    MG.config[e.target.name] = b;
                    GM_setValue('config', MG.config);
                    e.target.style.background = '#' + e.target.value;
                    break;
                case 'normal':
                    MG.config[e.target.name] = e.target.value;
                    console.log(MG.config[e.target.name]);
                    GM_setValue('config', MG.config);
                    break;
                case 'gesture':
                    MG.track2name = updateFns('input[data-mark="gesture"]');
                    GM_setValue('track2name', MG.track2name);
                    break;
                case 'dragText':
                    e.target.value = letter2arrow(e.target.value);
                    MG.dragText2name = updateFns('input[data-mark="dragText"]');
                    GM_setValue('dragText2name', MG.dragText2name);
                    break;
                case 'dragLink':
                    e.target.value = letter2arrow(e.target.value);
                    MG.dragLink2name = updateFns('input[data-mark="dragLink"]');
                    GM_setValue('dragLink2name', MG.dragLink2name);
                    break;
                case 'dragImg':
                    e.target.value = letter2arrow(e.target.value);
                    MG.dragImg2name = updateFns('input[data-mark="dragImg"]');
                    GM_setValue('dragImg2name', MG.dragImg2name);
                    break;
                default:
                    break;
            }
        };
        this.onOff = function(e) {
            MG.config[e.target.id] = e.target.checked;
            GM_setValue('config', MG.config);
            if (MG.config[e.target.id]) {
                e.target.parentNode.style.background = "yellowgreen";
            } else {
                e.target.parentNode.style.background = "gray";
            }
        };
        [].forEach.call(document.querySelectorAll('#MGmenu li'), function(item) {
            item.addEventListener('click', selected, false);
        });
        [].forEach.call(document.querySelectorAll('#HYMGSetting input[type=text]'), function(item) {
            item.addEventListener('blur', setConfig, false);
        });
        [].forEach.call(document.querySelectorAll('#HYMGSetting input[data-mark*=drag],#HYMGSetting input[data-mark=gesture]'), function(item) {
            item.addEventListener('keyup', function(event) {
                event.target.value = letter2arrow(event.target.value);
            }, false);
        });
        [].forEach.call(document.querySelectorAll('#HYMGSetting input[type=checkbox]'), function(item) {
            item.addEventListener('change', onOff, false);
        });
        //init
        [].forEach.call(document.querySelectorAll('.HYMGcontent'), function(item) {
            item.style.display = "none";
        });
        document.getElementById('mg1').style.display = 'block';
        document.getElementById('MGClose').addEventListener('click', function() {
            document.documentElement.removeChild(document.getElementById("HYMGSetting"));
        }, false);

    }
    return MG;

})();
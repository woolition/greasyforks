// ==UserScript==
// @name         破解VIP会员视频集合
// @namespace    https://greasyfork.org/zh-CN/users/104201
// @version      4.0.1
// @description  破解[优酷|腾讯|乐视|爱奇艺|芒果|AB站|音悦台]等VIP或会员视频，解析接口贵精不贵多，绝对够用。有直接跳转＋备用接口列表。详细方法看说明还有图片。包含了[破解全网VIP视频会员-去广告▶ttmsjx][VIP会员视频解析▶龙轩][酷绘-破解VIP会员视频▶ahuiabc2003]以及[VIP视频破解▶hoothin]的部分接口。
// @author       黄盐
// @noframes
// @match        *://*.iqiyi.com/*
// @match        *://*.youku.com/*
// @match        *://*.le.com/*
// @match        *://*.letv.com/*
// @match        *://v.qq.com/*
// @match        *://*.tudou.com/*
// @match        *://*.mgtv.com/*
// @match        *://film.sohu.com/*
// @match        *://tv.sohu.com/*
// @match        *://*.acfun.cn/v/*
// @match        *://*.bilibili.com/*
// @match        *://vip.1905.com/play/*
// @match        *://*.pptv.com/*
// @match        *://v.yinyuetai.com/video/*
// @match        *://v.yinyuetai.com/playlist/*
// @match        *://*.fun.tv/vplay/*
// @match        *://*.wasu.cn/Play/show/*
// @match        *://*.56.com/*
// @exclude      *://*.bilibili.com/blackboard/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// ==/UserScript==

(function() {
    'use strict';
    var tMscript = document.createElement('script');
    tMscript.innerText = `q = function(cssSelector){return document.querySelector(cssSelector);};qa = function(cssSelector){return document.querySelectorAll(cssSelector);};`;
    document.head.appendChild(tMscript);
    q = function(cssSelector) {return document.querySelector(cssSelector);};
    qa = function(cssSelector) {return document.querySelectorAll(cssSelector);};
    var replaceRaw = GM_getValue("replaceRaw");
    var episodes = GM_getValue("episodes");
    GM_getValue('userApis') === undefined ? GM_setValue('userApis', [{}]) : null;
    GM_getValue('userApisOn') === undefined ? GM_setValue('userApisOn', false) : null;
    GM_addStyle(`
        #TManays{z-index:999999; position:absolute; left:0px; top:0px; width:100px; height:auto; border:0; margin:0;}
        #TMiframe{position:absolute;}
        #parseUl{position:fixed;top:80px; left:0px;}
        #parseUl li{list-style:none;}
        .TM1{opacity:0.3; position:relative;padding: 0 7px 0 0; min-width: 19px; cursor:pointer;}
        .TM1:hover{opacity:1;}
        .TM1 span{display:block; border-radius:0 5px 5px 0; background-color:#ffff00; border:0; font:bold 15px "微软雅黑" !important; color:#ff0000; margin:0; padding:15px 2px;}
        .TM3{position:absolute; top:0; left:19px; display:none; border-radius:5px; margin:0; padding:0;}
        .TM3 li{float:none; width:80px; margin:0; font-size:14px; padding:3px 10px 2px 15px; cursor:pointer; color:#3a3a3a !important; background:rgba(255,255,0,0.8)}
        .TM3 li:hover{color:white !important; background:rgba(0,0,0,0.8);}
        .TM3 li:last-child{border-radius: 0 0 5px 5px;}
        .TM3 li:first-child{border-radius: 5px 5px 0 0;}
        .TM1:hover .TM3{display:block}
        /*2017-10-24 对应自定义解析接口部分*/
		#tMuserDefine {display:none;width:500px;height:auto;background:rgba(255,255,0,1);padding:5px;border-radius:5px;text-align:center;position:fixed;left:20%;top:20%;font-size:16px;z-index:999999;}
		#tMuserDefine li {margin:5px;width:100%;list-style-type:none;}
		#tMuserDefine input[type="text"] {width:70%;height:30px;border:1px solid #3a3a3a;margin:0 10px;padding:0 5px;background:transparent;font-size:16px!important;color:#3a3a3a;border-radius:5px}
		#tMuserDefine button {background:transparent;color:#3a3a3a;border:1px solid;border-radius:5px;width:20%;height:30px;margin:5px;cursor:pointer;}
		#tMuserDefine button:hover {background:#555;color:yellow;border:0;}
		.ilink {width:80%;}
		.idelete {float: left;  display: inline-block; color: red; padding: 0 20px !important; cursor: pointer;}
		.iname {padding-right:10px;}
		li:hover .idelete,li:hover .ilink,li:hover .iname {background:rgba(224,175,17,0.62);}
    `);
    var apis =[
        {name:"vParse[腾]",url:"https://api.vparse.org/?url=",title:"支持腾讯"},
        //{name:"FLVSP[腾讯]",url:"https://api.flvsp.com/?url=",title:"支持腾讯"},//解析源同上
        {name:"噗噗电影",url:"http://pupudy.com/play?make=url&id=",title:"综合接口，破解全网VIP视频会员-去广告【作者ttmsjx】脚本的接口"},
        {name:"PU.tn",url:"http://api.pu.tn/qq1/?url=",title:"据说可以看优酷布袋戏"},
        {name:"酷绘",url:"http://appapi.svipv.kuuhui.com/svipjx/liulanqichajian/browserplugin/qhjx/qhjx.php?id=",title:"综合接口，酷绘*【作者ahuiabc2003】脚本的接口"},
        {name:"百域阁",url:"http://api.baiyug.cn/vip/index.php?url=",title:"转圈圈就换线路"},
        {name:"旋风解析",url:"http://api.xfsub.com/index.php?url=",title:"1905优先使用"},
        {name:"石头解析",url:"https://jiexi.071811.cc/jx.php?url=",title:"手动点播放"},
        {name:"无名小站",url:"http://www.sfsft.com/admin.php?url=",title:"无名小站同源"},
        {name:"VIP看看",url:"http://q.z.vip.totv.72du.com/?url=",title:"更换线路成功率会提高"},
        {name:"ODFLV",url:"http://aikan-tv.com/?url=",title:"不稳定，广告过滤软件可能有影响"},
        {name:"163人",url:"http://jx.api.163ren.com/vod.php?url=",title:"偶尔支持腾讯"},
        {name:"CKFLV",url:"http://www.0335haibo.com/tong.php?url=",title:"CKFLV云,部分站点不支持"},
        // {name:"舞动秋天",url:"http://qtzr.net/s/?qt=",title:"qtzr.net"},
        {name:"无名小站2",url:"http://www.wmxz.wang/video.php?url=",title:"转圈圈就换线路"},
        {name:"眼睛会下雨",url:"http://www.vipjiexi.com/yun.php?url=",title:"www.vipjiexi.com"},
        {name:"1008影视",url:"http://api.1008net.com/v.php?url=",title:"据说可以看布袋游戏视频"},
        {name:"人人发布",url:"http://v.renrenfabu.com/jiexi.php?url=",title:"综合，多线路"}
    ];
    var userApisOn = GM_getValue('userApisOn');
    var defaultapi = {
        title: "龙轩脚本的接口，默认用浮空解析，失效请更换接口", url: "http://goudidiao.com/?url="
    };
    //嵌入页面播放
    function openInTab(evt) {
        var iframe = document.createElement("iframe");
        iframe.id = "TMiframe";
        var video;
        //iframe.style.cssText="width:100%;height:100%;text-align:center;border:none;";
        iframe.style.border = "none";
        iframe.textAlign = "center";
        iframe.src = evt.target.dataset.url + location.href;
        var timer = setInterval(function() { //-------------检测视频元素思路借鉴他人 License MIT Begin--------------
            [].every.call(qa("object,embed,video"), function(item) { //LINK:https://greasyfork.org/zh-CN/scripts/26556-vip视频破解
                var style = getComputedStyle(item, null); //Homepage: http://hoothin.com
                if (style.width.replace("px", "") > 100 && style.height.replace("px", "") > 100) { //Email: rixixi@gmail.com
                    video = item;
                    return false; //有播放窗
                }
                return true;
            });
            if (video || q("#TMiframe")) {
                if (q("#TMiframe")) {
                    video = q("#TMiframe");
                }
                clearInterval(timer);
                var videoStyle = getComputedStyle(video, null);
                iframe.width = videoStyle.width;
                iframe.height = videoStyle.height;
                var videoParent = video.parentNode;
                iframe.style.lineHeight = getComputedStyle(videoParent).height;
                if (video.parentNode) {
                    video.parentNode.replaceChild(iframe, video);
                }
            }
        }, 500); //-------------检测视频元素思路借鉴他人  End--------------------
        if (window.location.href.indexOf("youku") != -1) {
            qa(".vpactionv5_iframe_wrap").style.display = "none";
        }
    }

    function noNewTabCheck() {
        var x, arr = qa(".TM4 li");
        replaceRaw = q("#inTabChekbx").checked;
        GM_setValue("replaceRaw", replaceRaw);
        for (x = 0; x < arr.length; x++) {
            if (replaceRaw) {
                arr[x].addEventListener("click", openInTab, false);
                arr[x].onclick = '';
            } else {
                arr[x].removeEventListener("click", openInTab, false);
                arr[x].onclick = function() {
                    window.open(this.dataset.url + location.href);
                };
            }
        }
    }
/*  爱奇艺正确选集  */
    function rightEpsLinkCheck() {
        episodes = q("#realLinkChekbx").checked;
        GM_setValue("episodes", episodes);
        if (episodes) {
            q('#widget-dramaseries').addEventListener('click', function getLink(e) { //-------------iqiyi剧集真实播放页面方法  Begin------------------//Homepage: http://hoothin.com    Email: rixixi@gmail.com
                var target = e.target.parentNode.tagName == "LI" ? e.target.parentNode : (e.target.parentNode.parentNode.tagName == "LI" ? e.target.parentNode.parentNode : e.target.parentNode.parentNode.parentNode);
                if (target.tagName != "LI") return;
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: "http://cache.video.qiyi.com/jp/vi/" + target.dataset.videolistTvid + "/" + target.dataset.videolistVid + "/?callback=crackIqiyi",
                    onload: function(result) {
                        var crackIqiyi = function(d) {
                            location.href = d.vu;
                        };
                        eval(result.responseText);
                    }
                });
            }); //-------------iqiyi剧集真实播放页面方法  End------------------
        } else {
            q('#widget-dramaseries').removeEventListener('click', getLink);
        }
    }
/*  勾选自定义接口  */
    function addApiCheck() {
        userApisOn = q('#addApiChekBx').checked;
        GM_setValue('userApisOn', userApisOn);
        selfDefine();
        if (userApisOn) {
            showAddApiPanel();
        }
    }

/*  执行  */
    var div = document.createElement("div");
    div.id = "TManays";
    var txt = '', i = 0;
    /*看看是否需要加载自定义的接口列表*/
    if (userApisOn) {
        var userApis = GM_getValue('userApis');
        for (var j in userApis) {
            try {
                if (userApis[j].link !== null) {
                    txt += '<li data-order=' + j + ' data-url="' + userApis[j].link + '" onclick="window.open(this.dataset.url+location.href)">' + userApis[j].name + '</li>';
                }
            } catch (e) {
                console.log(e);
            }
        }
        selfDefine();
    }
    /*提供的接口列表*/
    for (i in apis) {
        txt += '<li data-order=' + i + ' data-url="' + apis[i].url + '" title="' + apis[i].title + '" onclick="window.open(this.dataset.url+location.href)">' + apis[i].name + '</li>';
    }
    div.innerHTML = '<ul id="parseUl">' +
        '<li class="TM1"><span id="TMList"  title="' + defaultapi.title + '" onclick="window.open(\'' + defaultapi.url + '\'+window.location.href)">▶</span><ul class="TM3 TM4">' + txt + '</ul></li>' +
        '<li class="TM1"><span id="TMSet">▣</span><ul class="TM3"><li><label><input type="checkbox" id="inTabChekbx">本页解析</label></li><li><label><input type="checkbox" id="realLinkChekbx">爱奇艺正确选集</label></li><li><input type="checkbox" id="addApiChekBx"><label id="addApiBtn">增加接口</label></li></ul></li>' +
        '</ul>';
    document.body.appendChild(div);
    // console.log(div.parentNode.parentNode.parentNode.tagName);
    q("#inTabChekbx").addEventListener("click", noNewTabCheck, false);
    q("#inTabChekbx").checked = replaceRaw;
    q("#realLinkChekbx").addEventListener("click", rightEpsLinkCheck, false);
    q("#realLinkChekbx").checked = episodes;
    q("#addApiChekBx").checked = userApisOn;
    q("#addApiChekBx").addEventListener('click', addApiCheck, false);
    q("#addApiBtn").addEventListener('click', showAddApiPanel, false);

    if (episodes && window.location.href.indexOf("iqiyi") != -1) {
        rightEpsLinkCheck();
    }
    if (replaceRaw && window.location.protocol != "https:") {
        noNewTabCheck();
        document.getElementById("TMSet").click();
    } //https和http页面不能镶嵌。

/** 2017-10-24  自定义解析接口  */
/*  显示增加接口的面板  */
    function showAddApiPanel() {
        if (q('#tMuserDefine')) {
            q('#tMuserDefine').style.display = "block";
        } else {
/*  草泥马字符画,任性一次了,
    在 Alert 窗口出来之后应该是这样的:
     *    ┏┓      ┏┓
     *   ┏┛┻━━━━━━┛┻┓
     *   ┃          ┃
     *   ┃    ━     ┃
     *   ┃  ┳┛  ┗┳  ┃
     *   ┃          ┃
     *   ┃    ┻     ┃
     *   ┃          ┃
     *   ┗━┓      ┏━┛
     *     ┃      ┃
     *     ┃      ┃
     *     ┃      ┗━━━┓
     *     ┃          ┣┓
     *     ┃          ┏┛
     *     ┗┓┓┏━━━━┳┓┏┛
     *      ┃┫┫    ┃┫┫
     *      ┗┻┛    ┗┻┛*/
            alert(`
      ┏┓            ┏┓
    ┏┛┻━━━━━━┛┻┓
    ┃                    ┃
    ┃        ━          ┃
    ┃    ┳┛    ┗┳    ┃
    ┃                    ┃
    ┃        ┻          ┃
    ┃                    ┃
    ┗━┓            ┏━┛
        ┃            ┃      未启用[增加接口]功能
        ┃            ┃      请把 '☑增加接口'' 前面对应的' ▣ ' 选项勾上 !
        ┃            ┗━━━┓
        ┃                    ┣┓
        ┃                    ┏┛
        ┗┓┓┏━━━━┳┓┏┛
          ┃┫┫        ┃┫┫
          ┗┻┛        ┗┻┛
                    `);
        }
    }
/*  生成增加接口面板  */
    function selfDefine() {
        var a = document.createElement('div');
        a.id = 'tMuserDefine';
        var txt = `
            <li><span>解析接口名称:</span><input type="text" id="tMname" placeholder="显示的名称"></li>
            <li><span>解析接口地址:</span><input type="text" id="tMparseLink" placeholder="接口需要包含 http 或者 https"></li>
            <li id="tMbtnLi">
                <button id="tMquit" onclick="q('#tMuserDefine').style.display='none';">关闭</button>
                <button id="tMgo" onclick="window.open(q('#tMparseLink').value+location.href)">测试</button>
                <button id="tMadd">增加</button>
                <button id="tMsave">保存</button>
            </li>
        `;
        var ar = GM_getValue('userApis');
        try {
            if (ar[0].name !== undefined) {
                for (var i = 0; i < ar.length; i++) {
                    txt += `<li><span class="idelete" title="删除" onclick="document.getElementById('tMuserDefine').removeChild(this.parentNode)">✘</span><span class="iname">${ar[i].name}</span><span class="ilink">${ar[i].link}</span></li>`;
                }
            }
        } catch (e) {}
        a.innerHTML = txt;
        document.body.appendChild(a);
        /*事件绑定*/
        q('#tMsave').addEventListener('click', function() {
            var newParseLinks = getarr();
            GM_setValue('userApis', newParseLinks);
            console.log(newParseLinks);
        }, false);
        q('#tMadd').addEventListener('click', function() {
            if (q('#tMname').value || q('#tMparseLink').value) {
                var a = document.createElement('li');
                a.innerHTML = `<span class="idelete" title="删除" onclick="document.getElementById('tMuserDefine').removeChild(this.parentNode)">✘</span><span class="iname">${q('#tMname').value}:</span><span class="ilink">${q('#tMparseLink').value}</span>`;
                if (q('span[class=iname]') === null) {
                    q('#tMuserDefine').appendChild(a);
                    q('#tMname').value = '';
                    q('#tMparseLink').value = '';
                } else {
                    q('#tMuserDefine').insertBefore(a, q('span[class=iname]').parentNode);
                    q('#tMname').value = '';
                    q('#tMparseLink').value = '';
                }
            }
        }, false);
    }
/*  保存按钮执行函数:获取值并 GM_setValue()  */
    function getarr() {
        var userUrl = qa('.ilink');
        var urlarr = [], tMname, tMparseLink;
        tMname = q('#tMname').value;
        tMparseLink = q('#tMparseLink').value;
        if (tMname || tMparseLink) {
            urlarr.push({ name: tMname, link: tMparseLink });
        }
        for (var i = 0; i < userUrl.length; i++) {
            var n, t;
            n = userUrl[i].previousSibling.innerText;
            t = userUrl[i].innerText;
            urlarr.push({ name: n, link: t });
        }
        return urlarr;
    }
/** 2017-10-24  自定义解析接口 END */

})();

// 资源参考http://www.5ifxw.com/vip/
// 资源参考http://live.gopartook.com/
// 资源参考http://tv.dsqndh.com
// 资源参考http://51.ruyo.net/p/3127.html
//有效性未知||不能直接引用接口
//http://www.yydy8.com/common/?url=
//href="http://mt2t.com/yun?url=
//https://api.47ks.com/webcloud/?v=
//http://www.guqiankun.com/tools/vipvideo
//过期接口
//{name:"65YW",url:"http://www.65yw.com/65yw/?vid=",title:"新接口，稳定性未知"},
//{name:"紫狐",url:"http://yun.zihu.tv/play.html?url=",title:"效果可能不稳定"},
//{name:"云解析",url:"http://www.efunfilm.com/yunparse/index.php?url=",title:"新接口，稳定性未知"},
//{name:"妹儿云",url:"https://www.yymeier.com/api.php?url=",title:"不稳定"}
//{name:"V云[腾讯]",url:"http://www.viyun.me/jiexi.php?url=",title:"腾讯首选"},

//https协议页面：film.sohu.com
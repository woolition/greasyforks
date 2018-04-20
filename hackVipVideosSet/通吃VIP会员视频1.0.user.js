// ==UserScript==
// @name         通吃VIP会员视频
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  通吃[优酷|腾讯|乐视|爱奇艺|芒果|AB站|音悦台]等VIP或会员视频，10个精选接口，绝对够用。有直接跳转＋备用接口列表。详细方法看说明还有图片。精选[VIP会员视频解析▶龙轩]以及[VIP视频破解▶hoothin]的部分接口。
// @author       黄盐
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

// @match        *://ifkjx.com/*
// @match        *://*.viyun.me/*
// @match        *://*.jiexi.071811.cc/*
// @match        *://*.sfsft.com/*
// @match        *://*.aikan-tv.com/*
// @match        *://*.flvsp.com/*
// @match        *://*.jiexi.071811.cc/*
// @match        *://*.jiexi.071811.cc/*
// @match        *://*.jiexi.071811.cc/*
// @match        *://*.jiexi.071811.cc/*
// @match        *://*.jiexi.071811.cc/*
// @match        *://*.jiexi.071811.cc/*

// @exclude      *://*.bilibili.com/blackboard/*
// @exclude      *://v.qq.com/txyp/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_openInTab
// ==/UserScript==
(function() {
    'use strict';
    var inTabMark=GM_getValue("inTabMark");
    var latestHref=GM_getValue("latestHref");
    var episodes=GM_getValue("episodes");
    //是否为解析页面
    var isParsePage=location.hostname.search(/iqiyi|youku|washu|le|v\.qq|tudou|mgtv|sohu|acfun|bilibili|1905|pptv|yinyuetai|fun\.tv/)==-1;
    if(!isParsePage){GM_setValue("latestHref",location.href);}//如果不是解析页面，先更新解析目标链接
    var onclickString=' onclick=\"var a=document.querySelector(\'.menuWindow\'); window.open(this.dataset.url+(a.dataset.parse?a.dataset.href:location.href),a.dataset.checked?\'_self\':\'_blank\')\" ';
    GM_addStyle(
        '#menuHolder *{margin:0px; padding:0pxx;}'+
        '.tips{width:702px;margin:0 auto;line-height:24px;padding-top:10px;}'+
        '.bredcolor{color:#fff;}'+
        '#menuHolder {width:100px;  height:100px;  margin:0px 0 250px 0px;  position:fixed;  top:0px;  left:0px;  z-index:999999; }'+
        '#menuHolder ul {padding:0;  margin:0;  list-style:none;  position:absolute;  left:0;  top:0;  width:0;  height:0; }'+
        '#menuHolder ul li {border-radius:0 0 300px 0;  width:0;  height:0; }'+
        '#menuHolder ul li a {color:#000;  text-decoration:none;  font:bold 15px arial, sans-serif;  text-align:center;  box-shadow:-5px 5px 5px rgba(0,0,0,0.4);  -webkit-transform-origin:0 0;  -moz-transform-origin:0 0;  -ms-transform-origin:0 0;  -o-transform-origin:0 0;  transform-origin:0 0;  }'+
        '#menuHolder ul.p1 li {position:absolute;  left:0;  top:0; }'+
        '#menuHolder ul.p2 {z-index:-1; }'+
        '#menuHolder ul.p3 {z-index:-1; }'+
        '#menuHolder li.s1 > a {position:absolute;  display:block;  width:30px;  height:30px;  background:#c8c8c8;  border-radius:0 0 30px 0;  }'+
        '#menuHolder li.s2 > a {position:absolute;  display:block;  width:90px;  padding-left:50px;  height:140px;  background:#ddd;  border-radius:0 0 140px 0; }'+
        '#menuHolder ul.p3 li a {position:absolute;  display:block;  width:90px;  padding-left:140px;  height:230px;  background:#999;  border-radius:0 0 230px 0; }'+
        '#menuHolder ul ul { -webkit-transform-origin:0 0;  -moz-transform-origin:0 0;  -ms-transform-origin:0 0;  -o-transform-origin:0 0;  transform-origin:0 0; '+
        '-webkit-transform:rotate(90deg);  -moz-transform:rotateZ(90deg);  -ms-transform:rotate(90deg);  -o-transform:rotate(90deg);  transform:rotate(90deg); '+
        '-webkit-transition:0.1s;  -moz-transition:0.1s;  -ms-transition:0.1s;  -o-transition:0.3s;  transition:0.1s;  }'+
        '#menuHolder li.s2:nth-of-type(6) > a {background:#888;  -webkit-transform:rotate(75deg);  -moz-transform:rotateZ(75deg);  -ms-transform:rotate(75deg);  -o-transform:rotate(75deg);  transform:rotate(75deg);  }'+
        '#menuHolder li.s2:nth-of-type(5) > a {background:#999;  -webkit-transform:rotate(60deg);  -moz-transform:rotateZ(60deg);  -ms-transform:rotate(60deg);  -o-transform:rotate(60deg);  transform:rotate(60deg);  }'+
        '#menuHolder li.s2:nth-of-type(4) > a {background:#aaa;  -webkit-transform:rotate(45deg);  -moz-transform:rotateZ(45deg);  -ms-transform:rotate(45deg);  -o-transform:rotate(45deg);  transform:rotate(45deg);  }'+
        '#menuHolder li.s2:nth-of-type(3) > a {background:#bbb;  -webkit-transform:rotate(30deg);  -moz-transform:rotateZ(30deg);  -ms-transform:rotate(30deg);  -o-transform:rotate(30deg);  transform:rotate(30deg);  }'+
        '#menuHolder li.s2:nth-of-type(2) > a {background:#ccc;  -webkit-transform:rotate(15deg);  -moz-transform:rotateZ(15deg);  -ms-transform:rotate(15deg);  -o-transform:rotate(15deg);  transform:rotate(15deg);  }'+
        //'#menuHolder .a6 li:nth-of-type(6) > a {background:#444;  -webkit-transform:rotate(75deg);  -moz-transform:rotateZ(75deg);  -ms-transform:rotate(75deg);  -o-transform:rotate(75deg);  transform:rotate(75deg);  }'+
        //'#menuHolder .a6 li:nth-of-type(5) > a {background:#555;  -webkit-transform:rotate(60deg);  -moz-transform:rotateZ(60deg);  -ms-transform:rotate(60deg);  -o-transform:rotate(60deg);  transform:rotate(60deg);  }'+
        //'#menuHolder .a6 li:nth-of-type(4) > a {background:#666;  -webkit-transform:rotate(45deg);  -moz-transform:rotateZ(45deg);  -ms-transform:rotate(45deg);  -o-transform:rotate(45deg);  transform:rotate(45deg);  }'+
        //'#menuHolder .a6 li:nth-of-type(3) > a {background:#777;  -webkit-transform:rotate(30deg);  -moz-transform:rotateZ(30deg);  -ms-transform:rotate(30deg);  -o-transform:rotate(30deg);  transform:rotate(30deg);  }'+
        //'#menuHolder .a6 li:nth-of-type(2) > a {background:#888;  -webkit-transform:rotate(15deg);  -moz-transform:rotateZ(15deg);  -ms-transform:rotate(15deg);  -o-transform:rotate(15deg);  transform:rotate(15deg);  }'+
        '#menuHolder .a5 li:nth-of-type(5) > a {background:#555;  -webkit-transform:rotate(72deg);  -moz-transform:rotateZ(72deg);  -ms-transform:rotate(72deg);  -o-transform:rotate(72deg);  transform:rotate(72deg);  }'+
        '#menuHolder .a5 li:nth-of-type(4) > a {background:#666;  -webkit-transform:rotate(54deg);  -moz-transform:rotateZ(54deg);  -ms-transform:rotate(54deg);  -o-transform:rotate(54deg);  transform:rotate(54deg);  }'+
        '#menuHolder .a5 li:nth-of-type(3) > a {background:#777;  -webkit-transform:rotate(36deg);  -moz-transform:rotateZ(36deg);  -ms-transform:rotate(36deg);  -o-transform:rotate(36deg);  transform:rotate(36deg);  }'+
        '#menuHolder .a5 li:nth-of-type(2) > a {background:#888;  -webkit-transform:rotate(18deg);  -moz-transform:rotateZ(18deg);  -ms-transform:rotate(18deg);  -o-transform:rotate(18deg);  transform:rotate(18deg);  }'+
        //'#menuHolder .a3 li:nth-of-type(3) > a {background:#777;  -webkit-transform:rotate(60deg);  -moz-transform:rotateZ(60deg);  -ms-transform:rotate(60deg);  -o-transform:rotate(60deg);  transform:rotate(60deg);  }'+
        //'#menuHolder .a3 li:nth-of-type(2) > a {background:#888;  -webkit-transform:rotate(30deg);  -moz-transform:rotateZ(30deg);  -ms-transform:rotate(30deg);  -o-transform:rotate(30deg);  transform:rotate(30deg);  }'+
        '#menuHolder .a2 li:nth-of-type(2) > a {background:#888;  -webkit-transform:rotate(45deg);  -moz-transform:rotateZ(45deg);  -ms-transform:rotate(45deg);  -o-transform:rotate(45deg);  transform:rotate(45deg);  }'+
        '#menuHolder li.s1:hover ul.p2 { -webkit-transform:rotate(0deg);  -moz-transform:rotateZ(0deg);  -ms-transform:rotate(0deg);  -o-transform:rotate(0deg);  transform:rotate(0deg);  }'+
        '#menuHolder li.s2:hover ul.p3 { -webkit-transform:rotate(0deg);  -moz-transform:rotateZ(0deg);  -ms-transform:rotate(0deg);  -o-transform:rotate(0deg);  transform:rotate(0deg);  }'+
        '#menuHolder ul li:hover > a {background:#f00;  color:#fff; }'+
        '#menuHolder li.s2:hover > a {background:#d00;  color:#fff; }'+
        '#menuHolder .a6 li:hover > a {background:#b00;  color:#fff; }'+
        '#menuHolder .a5 li:hover > a {background:#b00;  color:#fff; }'+
        '#menuHolder .a3 li:hover > a {background:#b00;  color:#fff; }'+
        '#menuHolder .a2 li:hover > a {background:#b00;  color:#fff; }'+
        '.menuWindow {width:30px;  height:40px;  overflow:hidden;  position:absolute;  left:0;  top:0;  text-align:center;  font-size:15px;  z-index:999999;   -webkit-transition:0s 0.1s;   -moz-transition:0s 0.1s;   -ms-transition:0s 0.1s;   -o-transition:0s 0.1s;   transition:0s 0.1s;  }'+
        '#menuHolder:hover .menuWindow {width:310px;  height:310px;   -webkit-transition:0s 0.1s;   -moz-transition:0s 0.1s;   -ms-transition:0s 0.1s;   -o-transition:0s 0.1s;   transition:0s 0.1s;   }'+
        '#menuHolder ~ img.close {width:0;  height:0;  position:fixed;  z-index:-1;  left:0;  top:0; }'+
        '#menuHolder:hover ~ img.close {width:100%;  height:100%; }'
    );
    var defaultapi={"title":"默认用浮空解析，失效请更换接口","url":"http://ifkjx.com/?url="};
    //为了精简，最多保留10接口
    var apis=[
        {"name":"V云[腾讯]","url":"http://www.viyun.me/jiexi.php?url=","title":"腾讯首选"},
        {"name":"FLVSP","url":"https://api.flvsp.com/?url=","title":"加载速度好"},
        {"name":"石头解析","url":"https://jiexi.071811.cc/jx.php?url=","title":"手动点播放"},
        {"name":"无名小站","url":"http://www.sfsft.com/admin.php?url=","title":"无名小站同源"},
        {"name":"ODFLV","url":"http://aikan-tv.com/?url=","title":"广告过滤软件可能有影响"},
        {"name":"旋风解析","url":"http://api.xfsub.com/index.php?url=","title":"1905优先使用"},
        {"name":"CKFLV","url":"http://www.0335haibo.com/tong.php?url=","title":"CKFLV云,效率接近47影视云"},
        {"name":"65YW","url":"http://www.65yw.com/65yw/?vid=","title":"新接口，稳定性未知"},
        {"name":"云解析","url":"http://www.efunfilm.com/yunparse/index.php?url=","title":"新接口，稳定性未知"},
        {"name":"百域阁","url":"http://api.baiyug.cn/vip/index.php?url=","title":"转圈圈就换线路"},
        {"name":"舞动秋天","url":"http://qtzr.net/s/?qt=","title":"qtzr.net"},
        {"name":"紫狐","url":"http://yun.zihu.tv/play.html?url=","title":"效果可能不稳定"},
        {"name":"VIP看看","url":"http://q.z.vip.totv.72du.com/?url=","title":"更换线路成功率会提高"},
        {"name":"无名小站2","url":"http://www.wmxz.wang/video.php?url=","title":"转圈圈就换线路"},
        {"name":"眼睛会下雨","url":"http://www.vipjiexi.com/yun.php?url=","title":"www.vipjiexi.com"},
        {"name":"163人","url":"http://jx.api.163ren.com/vod.php?url=","title":"偶尔支持腾讯"},
        {"name":"妹儿云","url":"https://www.yymeier.com/api.php?url=","title":"不稳定"}
    ];
    function parseInTab(){
        var inTabMark=document.querySelector("#inTabChekbx").checked;
        GM_setValue("inTabMark",inTabMark);
        document.querySelector('.menuWindow').dataset.checked=inTabMark;
    }
    function updateHref(){GM_setValue("latestHref",location.href);}
    function rightEpsLinkCheck() {
        episodes=document.querySelector("#realLinkChekbx").checked;
        GM_setValue("episodes",episodes);
        if(episodes){
            document.querySelector('#widget-dramaseries').addEventListener('click', function getLink (e){      //-------------iqiyi剧集真实播放页面方法  Begin------------------//Homepage: http://hoothin.com    Email: rixixi@gmail.com
                var target=e.target.parentNode.tagName=="LI"?e.target.parentNode:(e.target.parentNode.parentNode.tagName=="LI"?e.target.parentNode.parentNode:e.target.parentNode.parentNode.parentNode);
                if(target.tagName!="LI")return;
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: "http://cache.video.qiyi.com/jp/vi/"+target.dataset.videolistTvid+"/"+target.dataset.videolistVid+"/?callback=crackIqiyi",
                    onload: function(result) {
                        var crackIqiyi=function(d){
                            location.href=d.vu;
                        };
                        eval(result.responseText);
                    }
                });
            });                                                                              //-------------iqiyi剧集真实播放页面方法  End------------------
        }
        else{document.querySelector('#widget-dramaseries').removeEventListener('click', getLink);}
    }

    var elemtxt=
        '<div class="menuWindow" data-href="'+latestHref+'" data-parse="'+isParsePage+'" data-checked="'+inTabMark+'">'+
        '<ul class="p1">'+
        '<li class="s1"><a data-mark="go" data-url="'+defaultapi.url+'" title="'+defaultapi.title+'"'+onclickString+'>▶</a>'+
        '<ul class="p2">'+
        '<li class="s2"><a  data-mark="go" data-url="'+apis[0].url+'" title="'+apis[0].title+'"'+onclickString+'>'+apis[0].name+'</a>'+
        '<ul class="p3 a5">'+
        '<li><a data-mark="go" data-url="'+apis[5].url+'" title="'+apis[5].title+'"'+onclickString+'>'+apis[5].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[6].url+'" title="'+apis[6].title+'"'+onclickString+'>'+apis[6].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[7].url+'" title="'+apis[7].title+'"'+onclickString+'>'+apis[7].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[8].url+'" title="'+apis[8].title+'"'+onclickString+'>'+apis[8].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[9].url+'" title="'+apis[9].title+'"'+onclickString+'>'+apis[9].name+'</a></li>'+
        '</ul>'+
        '</li>'+
        '<li class="s2"><a data-mark="go" data-url="'+apis[1].url+'" title="'+apis[1].title+'"'+onclickString+'>'+apis[1].name+'</a>'+
        '<ul class="p3 a5">'+
        '<li><a data-mark="go" data-url="'+apis[5].url+'" title="'+apis[5].title+'"'+onclickString+'>'+apis[5].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[6].url+'" title="'+apis[6].title+'"'+onclickString+'>'+apis[6].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[7].url+'" title="'+apis[7].title+'"'+onclickString+'>'+apis[7].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[8].url+'" title="'+apis[8].title+'"'+onclickString+'>'+apis[8].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[9].url+'" title="'+apis[9].title+'"'+onclickString+'>'+apis[9].name+'</a></li>'+
        '</ul>'+
        '</li>'+
        '<li class="s2"><a data-mark="go" data-url="'+apis[2].url+'" title="'+apis[2].title+'"'+onclickString+'>'+apis[2].name+'</a>'+
        '<ul class="p3 a5">'+
        '<li><a data-mark="go" data-url="'+apis[5].url+'" title="'+apis[5].title+'"'+onclickString+'>'+apis[5].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[6].url+'" title="'+apis[6].title+'"'+onclickString+'>'+apis[6].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[7].url+'" title="'+apis[7].title+'"'+onclickString+'>'+apis[7].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[8].url+'" title="'+apis[8].title+'"'+onclickString+'>'+apis[8].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[9].url+'" title="'+apis[9].title+'"'+onclickString+'>'+apis[9].name+'</a></li>'+
        '</ul>'+
        '</li>'+
        '<li class="s2"><a data-mark="go" data-url="'+apis[3].url+'" title="'+apis[3].title+'"'+onclickString+'>'+apis[3].name+'</a>'+
        '<ul class="p3 a5">'+
        '<li><a data-mark="go" data-url="'+apis[5].url+'" title="'+apis[5].title+'"'+onclickString+'>'+apis[5].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[6].url+'" title="'+apis[6].title+'"'+onclickString+'>'+apis[6].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[7].url+'" title="'+apis[7].title+'"'+onclickString+'>'+apis[7].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[8].url+'" title="'+apis[8].title+'"'+onclickString+'>'+apis[8].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[9].url+'" title="'+apis[9].title+'"'+onclickString+'>'+apis[9].name+'</a></li>'+
        '</ul>'+
        '</li>'+
        '<li class="s2 b6"><a data-mark="go" data-url="'+apis[4].url+'" title="'+apis[4].title+'"'+onclickString+'>'+apis[4].name+'</a>'+
        '<ul class="p3 a5">'+
        '<li><a data-mark="go" data-url="'+apis[5].url+'" title="'+apis[5].title+'"'+onclickString+'>'+apis[5].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[6].url+'" title="'+apis[6].title+'"'+onclickString+'>'+apis[6].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[7].url+'" title="'+apis[7].title+'"'+onclickString+'>'+apis[7].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[8].url+'" title="'+apis[8].title+'"'+onclickString+'>'+apis[8].name+'</a></li>'+
        '<li><a data-mark="go" data-url="'+apis[9].url+'" title="'+apis[9].title+'"'+onclickString+'>'+apis[9].name+'</a></li>'+
        '</ul>'+
        '</li>'+
        '<li class="s2"><a>设置</a>'+
        '<ul class="p3 a2">'+
        '<li><a><label><input type="checkbox" id="inTabChekbx">本页解析</label></a></li>'+
        '<li><a><label><input type="checkbox" id="realLinkChekbx">爱奇艺正确选集</label></a></li>'+
        '</ul>'+
        '</li>'+
        '</ul>'+
        '</li>'+
        '</ul>'+
        '</div>';
    var div=document.createElement("div");
    div.id="menuHolder";
    div.innerHTML=elemtxt;
    document.body.appendChild(div);

    document.querySelector("#inTabChekbx").addEventListener("click",parseInTab,false);
    document.querySelector("#inTabChekbx").checked=inTabMark;
    document.querySelector("#realLinkChekbx").addEventListener("click",rightEpsLinkCheck,false);
    document.querySelector("#realLinkChekbx").checked=episodes;
    if(episodes && window.location.href.indexOf("iqiyi")!=-1){
        rightEpsLinkCheck();
    }

})();
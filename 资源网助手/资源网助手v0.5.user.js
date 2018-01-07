// ==UserScript==
// @name         资源网助手
// @namespace    https://greasyfork.org/zh-CN/users/104201
// @version      0.5
// @description  OK资源网，最大资源网[MP4][m3u8]视频直接播放，分类页面改进翻页功能
// @author       黄盐
// @require      https://cdn.jsdelivr.net/gh/clappr/clappr@latest/dist/clappr.min.js
// @match        http://www.zuidazy.com/?m=vod-*
// @match        http://www.okokzy.com/?m=vod-*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// run-at        document-end
// ==/UserScript==

(function() {
    //适配详情页，http://*.com/?m=vod-detail-id-*.html
    if(location.search.indexOf("detail") != -1) {
        GM_addStyle(''+
                    //视频框CSS
                    '#TM_f{z-index:1000;position:fixed; top:0; background:black;}'+
                    '#TM_f:hover .ctrls{display:block; z-index:2;position:absolute; font-size:20px; text-align:center; top:0px; padding: 0 0 3px 0;color:white; background:rgba(0, 0, 0, 0.4); cursor:pointer; min-width:35px; max-width:35px;}'+
                    '.ctrls{display:none;}'+
                    '#TM_f .ctrls:hover{background:#03A9F4; color: white;}'+
                    '#mid{right:90px;} #max{right:55px;} #close{right:20px;}'+
                    '.GM_play{margin-left:30px; color:blue; cursor:pointer;}'+
                    '.GM_play:hover{color:red; font-size:15px;}'+
                    //按键暂停等CSS
                    '#tip{ position: absolute; z-index: 999999;padding: 10px 15px 10px 20px; border-radius: 10px; background: white; font-size:30px; color:black;top: 50%;left: 50%; transform: translate(-50%,-50%); transition: all 500ms ease;  -webkit-font-smoothing: subpixel-antialiased; font-family: "微软雅黑"; -webkit-user-select: none;}'
                   );
        function insertHead(){
            var clpjs=document.createElement("script");
            clpjs.src="https://cdn.jsdelivr.net/gh/clappr/clappr@latest/dist/clappr.min.js";
            document.head.appendChild(clpjs);
        }
        insertHead();

        var bdjs=document.createElement("script");
        var a=`
/*================改变框大小 Begin==========*/
function changeSize ( op , ele) {
switch (op) {
case "close" : {window.player.destroy();ele.parentElement.parentElement.removeChild(ele.parentElement); break;}
case "mid" : {window.player.resize({height: Math.floor(window.innerHeight/2), width: Math.floor(window.innerWidth/2)});break;}
case "max" : {window.player.resize({height: window.innerHeight, width: window.innerWidth});break;}
}
}
/*================改变框大小 End==========*/
/*================生成元素  ================*/
function afterBody (src) {
var TM_f=document.createElement("div");
TM_f.id="TM_f";

TM_f.innerHTML=\`
<div id="mid" class="ctrls" onclick="changeSize ( 'mid' ,this)">🗗</div>
<div id="max" class="ctrls" onclick="changeSize ( 'max' , this)">🗖</div>
<div id="close" class="ctrls" onclick="changeSize ( 'close' , this)">🗙</div>\`.replace(/\\\\n/g, '');

document.body.insertBefore(TM_f,document.body.childNodes[0]);
var player = new Clappr.Player({
source: src,
parentId: "#TM_f",
autoPlay:true,
maxBufferLength:600
});
attachDrag("#TM_f");
window.player=player;
}

/*================拖拽 Begin==========*/
function attachDrag (eleId) {
$(document).mousemove(function(e) {
if (!!this.move) {
var posix = !document.move_target ? {'x': 0, 'y': 0} : document.move_target.posix,
callback = document.call_down || function() {
$(this.move_target).css({
'position':'absolute',
'top': e.pageY - posix.y,
'left': e.pageX - posix.x
});
};

callback.call(this, e, posix);
}
}).mouseup(function(e) {
if (!!this.move) {
var callback = document.call_up || function(){};
callback.call(this, e);
$.extend(this, {
'move': false,
'move_target': null,
'call_down': false,
'call_up': false
});
}
});
$(eleId).mousedown(function(e) {
var offset = $(this).offset();
this.posix = {'x': e.pageX - offset.left, 'y': e.pageY - offset.top};
$.extend(document, {'move': true, 'move_target': this});
});
}

/*================拖拽End=================*/
/*================提示和键盘控制==========*/

function showTip (txt) {
var ele=document.createElement("div");
ele.id="tip";
ele.innerText=txt;
document.getElementById('TM_f').appendChild(ele);
var a=setTimeout(function(){document.getElementById('TM_f').removeChild(document.getElementById('tip'));},600);
}
function keyUp(e) {
var v=document.querySelector('#TM_f video');
var currKey=0,e=e||event;
currKey=e.keyCode||e.which||e.charCode;
var keyName = String.fromCharCode(currKey);
switch( currKey ) {
case 32:		/*空格 暂停或者播放*/
if(v.paused) {
showTip("▋▋");
}else{
showTip(" ▶ ");
}
break;
case 39:	/*右箭头→*/
if(e.ctrlKey){
v.currentTime += 30;
showTip('➕ 30s');
}else{
/*v.currentTime += 5; */
showTip('➕ 5s');
}
break;
case 37:	/*左箭头 ←*/
if(e.ctrlKey){
v.currentTime -= 30;
showTip('➖ 30s');
}else{
/*v.currentTime -= 5; */
showTip('➖ 5s');
}
break;
case 38:	/*上箭头↑*/
e.preventDefault();
window.player.setVolume(window.player.getVolume()+5);
showTip('🔔 '  +window.player.getVolume()+'%');
break;
case 40:	/*下箭头↓*/
e.preventDefault();
window.player.setVolume(window.player.getVolume()-5);
showTip('🔔 '+window.player.getVolume()+'%');
break;
/*按键m：静音 | 取消静音*/
case 77:
if(window.player.getVolume()==0) {
window.player.unmute();
showTip('🔔');
} else {
window.player.mute();
showTip('🔕');
}
break;
/*按键x：减速播放 -0.1 */
case 88:
if (v.playbackRate > 0) {
v.playbackRate -= 0.1;
v.playbackRate = v.playbackRate.toFixed(1);
showTip(v.playbackRate+"🏃");
}
break;
/*按键c：减速播放 +0.1*/
case 67:
if (v.playbackRate < 16) {
v.playbackRate += 0.1;
v.playbackRate = v.playbackRate.toFixed(1);
showTip(v.playbackRate+"🏃");
}
break;
/*按键z ：恢复正常速度*/
case 90:
v.playbackRate = 1;
showTip(' 1 🏃');
break;
/*按键S：画面旋转 90 度*/
case 83:
if(isNaN(v.rotate))  v.rotate=0 ;
v.rotate += 90;
if (v.rotate % 360 === 0) v.rotate = 0;
v.style.transform = "rotate(" + v.rotate + "deg)";
showTip('➦'+v.rotate+'°');
break;
/*按键回车，进入全屏*/
case 13:
if(v.offsetWidth!=screen.width){
if(v.requestFullscreen) {  /* w3c*/
v.requestFullscreen();
} else if(v.mozRequestFullScreen) {  /*firefox*/
v.mozRequestFullScreen();
} else if(v.webkitRequestFullscreen) {  /*chrome | safari*/
v.webkitRequestFullscreen();
} else if(v.msRequestFullscreen) {  /*ie11*/
v.msRequestFullscreen();
}
}
break;
default:
break;
}
}
document.onkeyup = keyUp;
`;
        //==================== 上面这个点号(`)很重要 ==============
        bdjs.innerText=a.replace(/\n/g, '');
        document.body.appendChild(bdjs);
        //================ 最基本的操作 链接网址转链接====================
        var lis=document.querySelectorAll("div.vodplayinfo li");//文档中0~end 是链接项目，渲染结束后是6~end是链接项目
        var tmp, play;
        for(var i=0; i<lis.length; i++){
            tmp=lis[i].innerText;
            if(tmp.indexOf('m3u8') != -1 || tmp.indexOf('mp4') != -1) {play = '<span class = "GM_play" onclick = "afterBody(this.previousElementSibling.href)">▶</span>';} else {play = '';}
            lis[i].innerHTML=lis[i].childNodes[0].outerHTML+'<a target="_blank" href="'+tmp.slice(tmp.indexOf("http"))+'">'+tmp+'</a>'+play;
        }
        //================ 最基本的操作 链接网址转链接 End====================
    }
    //=================详情页代码==========完===================

    //适配分类页，http://*.com/?m=vod-type-id-*.html 方便翻页
    if(location.search.indexOf("type") != -1) {
        GM_addStyle('.GM_page{position:fixed !important;bottom:0 !important; width:100% !important;}');
        var ms = function (){
            var evt = window.event || arguments[0];
            if(evt.pageY<(document.body.offsetHeight-window.innerHeight)){
                document.getElementsByClassName('pages')[0].className = "pages GM_page";
            }
            else {
                document.getElementsByClassName('pages')[0].className = "pages";
            }
        };

        document.onmousewheel = ms;
    }
    //=================分类页代码==========完===================

})();
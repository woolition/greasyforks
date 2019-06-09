// ==UserScript==
// @name         倍速播放
// @namespace    https://greasyfork.org/zh-CN/users/104201-%E9%BB%84%E7%9B%90
// @version      0.1
// @description  HTML5播放器，倍速功能。可以实现最高10倍数播放。
// @author       黄盐
// @include      *:*
// @noframes
// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://cdn.bootcss.com/vue/2.6.6/vue.js
// @grant        GM_registerMenuCommand
// require      file:///D:/nut/codes/extra/speedy.js
// ==/UserScript==
/* jshint esversion: 6 */

(function() {
    'use strict';
    // 圆形模块，固定位置。在没有检测到video元素之前，是灰色不可用状态。
    // 检测到video元素之后，显示为绿色或者黄色 。鼠标划到模块上面的时候，透明度变为0.平时透明度是0.3左右。
    // 鼠标划到元素上面的时候，菜单展开。有四个按钮以及一个输入框。
    // 输入框分别是加速、减速、回复正常速度、快进5秒，快退5秒、还有一个输入框。是可以直接输入播放速度的。
    // 后期可以考虑加一个滑块。但是，毕竟滑块不太好用。所以，目前来说，还是用点击，同时手机版，也可以支持 ontab 事件
    // 鼠标移出元素之后，又恢复一个圆形。圆形里面的文字是目前设置的播放速度。
    // 这个播放速度，要储存在脚本存储里面。这样不用每次打开新的视频都要再调一次速度。
    // 另外一点，刚刚开始的 时候 ，要持续一段时间检测文档的状态。如果一段时间都没有找到Video元素的话。就 把元素 移除。不要占着位置。
    // 又或者，在没有检测 到video元素之前，不要显示功能模块。检测到之后，也就是准备好之后，再显示不迟。
    // 还有还有，这个东西需要支持拖拽。所以，我是允许你引入jquery的。如果不用引入，那当然最好。但是引入也没有太多意见。
    // 拖拽到的 位置也要记录存储下来。

    /*
    一些考虑 为什么我原本有调整播放时间的选项，但是后面直接去掉了呢。因为一般视频网站，肯定会提供调整播放时间的功能的。
    在播放时间调整上面，已经是非常完善了。所以我再加上这个功能意义不大。况且也没有办法知道大多数人的使用习惯。所以还是砍掉这个功能吧。
    专心做播放速度的调整就好。

    */
  var SpeedyPlay = (function(){
    let O = {
      "speedIcon": '<svg class="icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="689"><path d="M977.51 218.317c-19.456-15.975-47.923-13.107-63.897 6.349l-0.615 0.819C855.04 296.55 788.07 340.378 734.003 342.835c-35.02 1.434-67.379-13.517-98.713-45.67-60.212-63.898-127.386-94.823-199.476-91.546-131.072 5.94-225.894 125.133-229.785 130.253-15.565 19.66-12.083 48.333 7.782 63.693 19.661 15.36 48.333 12.083 63.693-7.783 0.614-0.819 73.933-91.545 162.406-95.436 24.372-1.024 47.924 4.505 71.066 16.793L376.013 609.28c-104.243 141.926-268.698 62.464-276.07 58.778-22.324-11.264-49.562-2.253-60.826 20.07s-2.458 49.766 19.865 61.03c2.458 1.23 62.055 31.13 139.674 34.816 5.12 0.205 10.24 0.41 15.565 0.41 69.222 0 159.334-22.118 230.605-115.712l32.358 16.794 30.515 15.974 4.096 2.253c19.251 10.24 48.947 28.057 80.691 55.091 71.066 60.826 118.17 137.42 139.879 227.738 5.12 20.89 23.552 34.816 44.032 34.816 3.481 0 7.168-0.41 10.65-1.23 24.37-5.938 39.321-30.514 33.587-54.886-49.972-207.462-199.476-306.995-266.036-342.016L660.89 421.683c21.708 7.987 44.85 12.083 67.993 12.083 2.867 0 5.94 0 8.807-0.204 110.592-4.71 201.318-96.256 245.555-150.528l0.614-0.615c15.975-19.66 13.107-48.333-6.349-64.102z" p-id="690"></path><path d="M585.933 120.218c0 41.37 22.118 79.872 57.958 100.556 35.84 20.685 80.077 20.685 116.122 0 35.84-20.684 57.958-58.982 57.958-100.556S795.853 40.346 760.013 19.66c-35.84-20.685-80.077-20.685-116.122 0-35.84 20.685-57.958 58.982-57.958 100.557z m0 0" p-id="691"></path></svg>',
      "CSS": `
        /* 禁止选中文字 */
        .noselect {
          -webkit-touch-callout: none; /* iOS Safari */
          -webkit-user-select: none; /* Chrome/Safari/Opera */
          -khtml-user-select: none; /* Konqueror */
          -moz-user-select: none; /* Firefox */
          -ms-user-select: none; /* Internet Explorer/Edge */
          user-select: none; /* Non-prefixed version, currentlynot supported by any browser */
        }
       /* 调速框样式 */ 
        #speedDiv{position:fixed; top:500px; left: 100px;z-index:999999; overflow:hidden; width:55px;  padding:5px; border:1px solid #999; border-radius:50px; display:flex;justify-content:flex-start;align-items:center; opacity:0.4;}
        #speedDiv:hover,#speedDiv:focus,#speedDiv:active{width:auto; padding-right:15px; animation:show 0.2s; -moz-animation:show 0.2s; -webkit-animation:show 0.2s; -o-animation:show 0.2s; opacity:1;}
        @keyframes show {0% {width:70px;} 100% {width:280px;}}
        @-moz-keyframes show {0% {width:70px;} 100% {width:280px;}}
        @-webkit-keyframes show {0% {width:70px;} 100% {width:280px;}}
        @-o-keyframes show {0% {width:70px;} 100% {width:280px;}}
        #speedDiv span,#speedDiv input{font-size:2em; font-weight:bolder; background: #FF0;display:flex;flex-shrink:0; align-items:center;}
        #speedDiv input[type='text']{cursor:move;}
        #speedDiv input{width:50px; height:50px; border-radius:35px; display:inline-block; text-align:center; border:3px solid #333; margin-right: 5px; }
        #speedDiv span{ padding:5px; margin:2px; border-radius:5px; cursor:pointer;}

        /*横条样式*/
        #speedDiv input[type='range']{
          -webkit-appearance: none;/*清除系统默认样式*/
          border: 0;
          width: 300px;
          background: -webkit-linear-gradient(#ff0, #ff0) no-repeat, #999;/*设置左边颜色为#ff0，右边颜色为#999*/
          /*  background-size: 75% 100%;设置左右宽度比例*/
          height: 15px;/*横条的高度*/
        }
        /*拖动块的样式*/
        #speedDiv input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;/*清除系统默认样式*/
          height: 40px;/*拖动块高度*/
          width: 40px;/*拖动块宽度*/
          background: #fff;/*拖动块背景*/
          border-radius: 50%; /*外观设置为圆形*/
          border: solid 2px cyan; /*设置边框*/
          cursor: pointer;
        }`,
    };
    O.speedDivOuterHTML = `
      <div id="speedDiv" onselectstart="return false" class="noselect" unselectable="on">
        <input id="speedInput" type="text" maxlenth="4" v-model.number="speed" @change="changeSpeed" disabled="editable"
        draggable="true" @dragstart="moveStart" @touchstart="moveStart" @drag="move" @touchmove="move" />
        <span name="slowDown" @click.prevent="slowDown">${O.speedIcon}-</span>
        <input type="range" v-model.number="speed" min=0 max=10 :step=0.1 @input="changeRange" 
        :style="backgroundSize()"/>
        <span name="speedUp" @click.prevent="speedUp">${O.speedIcon}+</span>
      </div>
    `;

    // 根据不同的网站，设置不同的速度。存储键名用 location.host 字母来拼接
    // 按照不同频道读取各自的播放速度，未完成
    // O.saveSpeed = function(){
    //   let hostKey = location.host.replace(".",'') || "unknow";
    //   // GM_setValue("GM_speeDiv_")
    // };
    
    O.log = function(message,msgType="normal"){
      let style = {
        hint: `background:#ff0; border-left: 5px solid #333; padding:1px 3px; font-weight:bold;`,
        normal: `background:lightgreen;padding:1px 5px 1px 2px; border-right: 3px solid darkblue;`,
        warning: `background:#FFFBE5;padding:1px 5px 1px 2px; border-right: 3px solid darkblue;`,
        error: `background:red;padding:1px 5px 1px 2px; border-right: 3px solid darkblue;`
      };
      console.log("%c SpeedyPlay Info: %c"+message, style.hint, style[msgType]);
    };

    // 如果网页环境满足调速情况，才构造调速模块
    // window.sessionStorage.setItem("playbackRate", Math.min(videoRate, 4.0));
    O.showUp = function(){
      GM_addStyle(O.CSS);
      let speedDiv = document.createElement("Div");
      document.body.appendChild(speedDiv);
      speedDiv.outerHTML = O.speedDivOuterHTML;
      let GM_speedDiv_position = GM_getValue("GM_speedDiv_position",{left:100,top:500});
      speedDiv = document.querySelector("#speedDiv");
      speedDiv.setAttribute("style",`left:${GM_speedDiv_position.left}px; top: ${GM_speedDiv_position.top}px;`);

      O.speedVue = new Vue({
        el: "#speedDiv",
        data: {
          speed: GM_getValue("speed", 1.0),
          editable: false,
          dx: 0,
          dy: 0
        },
        methods: {
          slowDown: function(){
            let speed = Number((this.speed - 0.1).toFixed(1));
            this.speed = speed >= 0.1 ? speed : 0.1;
            this.changeSpeed();
          },
          speedUp: function(){
            let speed = Number((this.speed - (-0.1)).toFixed(1));
            this.speed = speed <= 10 ? speed :10;
            this.changeSpeed();
          },
          changeSpeed: function(){
            GM_setValue("speed", this.speed);
            // 这里默认只对第一个 video 元素进行调速。多 video 的页面暂时不考虑
            try {
              let videos = document.querySelectorAll("video");
              if(location.host == "v.qq.com"){
                window.sessionStorage.setItem("playbackRate", Math.min(this.speed, 4.0));
              }else{
                videos.forEach(vdo=>{vdo.playbackRate = this.speed;});                
              }
              if(videos[0] && videos[0].playbackRate){
                O.log(this.speed+"倍速", "normal");
              }
            } catch(e) {
              O.log("没有找到HTML5播放器!!!", "warning");
            }
          },
          changeRange: function(){
            GM_setValue("speed", this.speed);
            this.changeSpeed();
          },
          backgroundSize: function(){
            return `background-size:${this.speed*10}% 100%`;
          },
          moveStart: function(e){
            console.log(e);
            // 这里要增加对移动端的支持。主要解决 touchList touch的clientx,clientY的问题
            let dad = e.target.parentElement;
            this.dx = e.clientX - dad.offsetLeft;
            this.dy = e.clientY - dad.offsetTop;
          },
          move: function(e){
            console.log(e);
            // 这里要增加对移动端的支持。主要解决 touchList touch的clientx,clientY的问题
            let dad = e.target.parentElement;
            if(e.clientX && e.clientY){
              dad.style.left = e.clientX - this.dx + "px";
              dad.style.top  = e.clientY - this.dy + "px";
              GM_setValue("GM_speedDiv_position",{
                left: e.clientX - this.dx,
                top: e.clientY - this.dy
              })
            }
          },
        }
      });
    };

    O.setPlaybackRate = function(){
      // 腾讯视频，最高4.0 倍速度，需要通过设置 sessionStorage 值来改变。目前没有找到直接操作的方法
      let videos = document.querySelectorAll("video");
      // 按照不同频道读取各自的播放速度，未完成
      // let hostKey = location.host.replace(".",'') || "unknow";
      // console.log(hostKey);
      // let videoRate = GM_getValue(hostKey, 1.0);
      let videoRate = GM_getValue("speed", 1.0);
      if(location.host == "v.qq.com"){
        window.sessionStorage.setItem("playbackRate", Math.min(videoRate, 4.0));
      }else{
        videos.forEach((vdo)=>{vdo.playbackRate = videoRate;});
      }
      O.log(videos[0].playbackRate);      
    }

    // 检测页面是否有 video 元素，如果有，并且可以设置 video.playbackRate 属性，那么就出现速度框，否则就不显示。
    // 循环检测 30s ，如果都没有找到 video 元素，那就不再检测了
    O.isReady = function(){
      let checkVideoCounter = 0;
      window.checkVideoTimer = setInterval(()=>{
        let videos = document.querySelectorAll("video");
        if(videos.length){
          clearInterval(checkVideoTimer);
          O.showUp();
          O.setPlaybackRate();
        }else if(checkVideoCounter>30){
          clearInterval(checkVideoTimer);
        }else{
          O.log('waiting...');
          checkVideoCounter ++;
        };
      },1000);
    };

    // ===  END ===
    return O;
  })();

  SpeedyPlay.isReady();

})();
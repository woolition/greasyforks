// ==UserScript==
// @name         倍速播放
// @namespace    https://greasyfork.org/zh-CN/users/104201-%E9%BB%84%E7%9B%90
// @version      0.3
// @description  HTML5播放器，倍速功能。可以实现最高10倍数播放。不同网站可以设置不同速率和位置
// @author       黄盐
// @include      *:*
// @noframes
// @run-at       document-end
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @require      https://cdn.bootcss.com/vue/2.6.6/vue.js
// @require      https://cdn.bootcss.com/zepto/1.2.0/zepto.min.js
// require       file:///D:\soft\github\greasyforks\speedyPlay/speedy.jqMobile.js
// ==/UserScript==
/* jshint esversion: 6 */

/*!Tdrag 0.0.1 这里经过我修改，要恢复为jQuery插件，可以全部替换[Zepto]为[jQuery]即可*/;(function($,window,document,undefined){Zepto(function(){$.fn.Tdrag=function(opt){var call={scope:null,grid:null,axis:"all",pos:false,handle:null,moveClass:"tezml",dragChange:false,changeMode:"point",cbStart:function(){},cbMove:function(){},cbEnd:function(){},random:false,randomInput:null,animation_options:{duration:800,easing:"ease-out"},disable:false,disableInput:null};var dragfn=new Dragfn(this,opt);if(opt&&$.isEmptyObject(opt)==false){dragfn.options=$.extend(call,opt);}else{dragfn.options=call;}
dragfn.firstRandom=true;var ele=dragfn.$element;dragfn.pack(ele,false);if(dragfn.options.randomInput!=null){$(dragfn.options.randomInput).bind("click",function(){dragfn.pack(ele,true);})}
dragfn.loadJqueryfn()};var Dragfn=function(ele,opt){this.$element=ele;this.options=opt;};Dragfn.prototype={init:function(obj){var self=this;self.ele=self.$element;self.handle=$(obj);self.options=self.options;self.disable=self.options.disable;self._start=false;self._move=false;self._end=false;self.disX=0;self.disY=0;self.zIndex=1000;self.moving=false;self.moves="";self.box=$.type(self.options.scope)==="string"?self.options.scope:null;if(self.options.handle!=null){self.handle=$(obj).find(self.options.handle);}
self.handle.on("mousedown",function(ev){self.start(ev,obj);obj.setCapture&&obj.setCapture();return false;});if(self.options.dragChange){$(obj).on("mousemove",function(ev){self.move(ev,obj);});$(obj).on("mouseup",function(ev){self.end(ev,obj);});}else{$(document).on("mousemove",function(ev){self.move(ev,obj);});$(document).on("mouseup",function(ev){self.end(ev,obj);});}},loadJqueryfn:function(){var self=this;$.extend({sortBox:function(obj){var arr=[];for(var s=0;s<$(obj).length;s++){arr.push($(obj).eq(s));}
for(var i=0;i<arr.length;i++){for(var j=i+1;j<arr.length;j++){if(Number(arr[i].attr("index"))>Number(arr[j].attr("index"))){var temp=arr[i];arr[i]=arr[j];arr[j]=temp;}}}
return arr},randomfn:function(obj){self.pack($(obj),true);},disable_open:function(){self.disable=false;},disable_cloose:function(){self.disable=true;}});},toDisable:function(){var self=this;if(self.options.disableInput!=null){$(self.options.disableInput).bind("click",function(){if(self.disable==true){self.disable=false}else{self.disable=true}})}},start:function(ev,obj){var self=this;self.moved=obj;if(self.disable==true){return false}
self._start=true;var oEvent=ev||event;self.disX=oEvent.clientX-obj.offsetLeft;self.disY=oEvent.clientY-obj.offsetTop;$(obj).css("zIndex",self.zIndex++);self.options.cbStart();},move:function(ev,obj){var self=this;if(self._start!=true){return false}
if(obj!=self.moved){return false}
self._move=true;var oEvent=ev||event;var l=oEvent.clientX-self.disX;var t=oEvent.clientY-self.disY;if(self.box!=null){var rule=self.collTestBox(obj,self.box);if(l>rule.lmax){l=rule.lmax;}else if(l<rule.lmin){l=rule.lmin;}
if(t>rule.tmax){t=rule.tmax;}else if(t<rule.tmin){t=rule.tmin;}}
if(self.options.axis=="all"){obj.style.left=self.grid(obj,l,t).left+'px';obj.style.top=self.grid(obj,l,t).top+'px';}else if(self.options.axis=="y"){obj.style.top=self.grid(obj,l,t).top+'px';}else if(self.options.axis=="x"){obj.style.left=self.grid(obj,l,t).left+'px';}
if(self.options.pos==true){self.moveAddClass(obj);}
self.options.cbMove(obj,self);},end:function(ev,obj){var self=this;if(self._start!=true){return false}
if(self.options.changeMode=="sort"&&self.options.pos==true){self.sortDrag(obj);}else if(self.options.changeMode=="point"&&self.options.pos==true){self.pointDrag(obj);}
if(self.options.pos==true){self.animation(obj,self.aPos[$(obj).attr("index")]);}
self.options.cbEnd();if(self.options.handle!=null){$(obj).find(self.options.handle).unbind("onmousemove");$(obj).find(self.options.handle).unbind("onmouseup");}else{$(obj).unbind("onmousemove");$(obj).unbind("onmouseup");}
obj.releaseCapture&&obj.releaseCapture();self._start=false;},collTestBox:function(obj,obj2){var self=this;var l1=0;var t1=0;var l2=$(obj2).innerWidth()-$(obj).outerWidth();var t2=$(obj2).innerHeight()-$(obj).outerHeight();return{lmin:l1,tmin:t1,lmax:l2,tmax:t2}},grid:function(obj,l,t){var self=this;var json={left:l,top:t};if($.isArray(self.options.grid)&&self.options.grid.length==2){var gx=self.options.grid[0];var gy=self.options.grid[1];json.left=Math.floor((l+gx/2)/gx)*gx;json.top=Math.floor((t+gy/2)/gy)*gy;return json}else if(self.options.grid==null){return json}else{console.log("grid参数传递格式错误");return false}},findNearest:function(obj){var self=this;var iMin=new Date().getTime();var iMinIndex=-1;var ele=self.ele;for(var i=0;i<ele.length;i++){if(obj==ele[i]){continue;}
if(self.collTest(obj,ele[i])){var dis=self.getDis(obj,ele[i]);if(dis<iMin){iMin=dis;iMinIndex=i;}}}
if(iMinIndex==-1){return null;}else{return ele[iMinIndex];}},getDis:function(obj,obj2){var self=this;var l1=obj.offsetLeft+obj.offsetWidth/2;var l2=obj2.offsetLeft+obj2.offsetWidth/2;var t1=obj.offsetTop+obj.offsetHeight/2;var t2=obj2.offsetTop+obj2.offsetHeight/2;var a=l2-l1;var b=t1-t2;return Math.sqrt(a*a+b*b);},collTest:function(obj,obj2){var self=this;var l1=obj.offsetLeft;var r1=obj.offsetLeft+obj.offsetWidth;var t1=obj.offsetTop;var b1=obj.offsetTop+obj.offsetHeight;var l2=obj2.offsetLeft;var r2=obj2.offsetLeft+obj2.offsetWidth;var t2=obj2.offsetTop;var b2=obj2.offsetTop+obj2.offsetHeight;if(r1<l2||r2<l1||t2>b1||b2<t1){return false;}else{return true;}},pack:function(ele,click){var self=this;self.toDisable();if(self.options.pos==false){for(var i=0;i<ele.length;i++){$(ele[i]).css("position","absolute");$(ele[i]).css("margin","0");self.init(ele[i]);}}else if(self.options.pos==true){var arr=[];if(self.options.random||click){while(arr.length<ele.length){var n=self.rnd(0,ele.length);if(!self.finInArr(arr,n)){arr.push(n);}}}
if(self.options.random==false||click!=true){var n=0;while(arr.length<ele.length){arr.push(n);n++}}
if(self.firstRandom==false){var sortarr=[];var n=0;while(sortarr.length<ele.length){sortarr.push(n);n++}
for(var i=0;i<ele.length;i++){$(ele[i]).attr("index",sortarr[i]);$(ele[i]).css("left",self.aPos[sortarr[i]].left);$(ele[i]).css("top",self.aPos[sortarr[i]].top);}}
self.aPos=[];if(self.firstRandom==false){for(var j=0;j<ele.length;j++){self.aPos[j]={left:ele[$(ele).eq(j).attr("index")].offsetLeft,top:ele[$(ele).eq(j).attr("index")].offsetTop};}}else{for(var j=0;j<ele.length;j++){self.aPos[j]={left:ele[j].offsetLeft,top:ele[j].offsetTop};}}
for(var i=0;i<ele.length;i++){$(ele[i]).attr("index",arr[i]);$(ele[i]).css("left",self.aPos[arr[i]].left);$(ele[i]).css("top",self.aPos[arr[i]].top);$(ele[i]).css("position","absolute");$(ele[i]).css("margin","0");self.init(ele[i]);}
self.firstRandom=false;}},moveAddClass:function(obj){var self=this;var oNear=self.findNearest(obj);$(self.$element).removeClass(self.options.moveClass);if(oNear&&$(oNear).hasClass(self.options.moveClass)==false){$(oNear).addClass(self.options.moveClass);}},sort:function(){var self=this;var arr_li=[];for(var s=0;s<self.$element.length;s++){arr_li.push(self.$element[s]);}
for(var i=0;i<arr_li.length;i++){for(var j=i+1;j<arr_li.length;j++){if(Number($(arr_li[i]).attr("index"))>Number($(arr_li[j]).attr("index"))){var temp=arr_li[i];arr_li[i]=arr_li[j];arr_li[j]=temp;}}}
return arr_li;},pointDrag:function(obj){var self=this;var oNear=self.findNearest(obj);if(oNear){self.animation(obj,self.aPos[$(oNear).attr("index")]);self.animation(oNear,self.aPos[$(obj).attr("index")]);var tmp;tmp=$(obj).attr("index");$(obj).attr("index",$(oNear).attr("index"));$(oNear).attr("index",tmp);$(oNear).removeClass(self.options.moveClass);}else if(self.options.changeWhen=="end"){self.animation(obj,self.aPos[$(obj).attr("index")]);}},sortDrag:function(obj){var self=this;var arr_li=self.sort();var oNear=self.findNearest(obj);if(oNear){if(Number($(oNear).attr("index"))>Number($(obj).attr("index"))){var obj_tmp=Number($(obj).attr("index"));$(obj).attr("index",Number($(oNear).attr("index"))+1);for(var i=obj_tmp;i<Number($(oNear).attr("index"))+1;i++){self.animation(arr_li[i],self.aPos[i-1]);self.animation(obj,self.aPos[$(oNear).attr("index")]);$(arr_li[i]).removeClass(self.options.moveClass);$(arr_li[i]).attr("index",Number($(arr_li[i]).attr("index"))-1);}}else if(Number($(obj).attr("index"))>Number($(oNear).attr("index"))){var obj_tmp=Number($(obj).attr("index"));$(obj).attr("index",$(oNear).attr("index"));for(var i=Number($(oNear).attr("index"));i<obj_tmp;i++){self.animation(arr_li[i],self.aPos[i+1]);self.animation(obj,self.aPos[Number($(obj).attr("index"))]);$(arr_li[i]).removeClass(self.options.moveClass);$(arr_li[i]).attr("index",Number($(arr_li[i]).attr("index"))+1);}}}else{self.animation(obj,self.aPos[$(obj).attr("index")]);}},animation:function(obj,json){var self=this;var options=self.options.animation_options;var self=this;var count=Math.round(options.duration/30);var start={};var dis={};for(var name in json){start[name]=parseFloat(self.getStyle(obj,name));if(isNaN(start[name])){switch(name){case 'left':start[name]=obj.offsetLeft;break;case 'top':start[name]=obj.offsetTop;break;case 'width':start[name]=obj.offsetWidth;break;case 'height':start[name]=obj.offsetHeight;break;case 'marginLeft':start[name]=obj.offsetLeft;break;case 'borderWidth':start[name]=0;break;}}
dis[name]=json[name]-start[name];}
var n=0;clearInterval(obj.timer);obj.timer=setInterval(function(){n++;for(var name in json){switch(options.easing){case 'linear':var a=n/count;var cur=start[name]+dis[name]*a;break;case 'ease-in':var a=n/count;var cur=start[name]+dis[name]*a*a*a;break;case 'ease-out':var a=1-n/count;var cur=start[name]+dis[name]*(1-a*a*a);break;}
if(name=='opacity'){obj.style.opacity=cur;obj.style.filter='alpha(opacity:'+cur*100+')';}else{obj.style[name]=cur+'px';}}
if(n==count){clearInterval(obj.timer);options.complete&&options.complete();}},30);},getStyle:function(obj,name){return(obj.currentStyle||getComputedStyle(obj,false))[name];},rnd:function(n,m){return parseInt(Math.random()*(m-n)+n);},finInArr:function(arr,n){for(var i=0;i<arr.length;i++){if(arr[i]==n){return true;}}
return false;}}})})(Zepto,window,document);



(function() {
  'use strict';
  // 检测到video元素之后，显示为绿色或者黄色 。鼠标划到模块上面的时候，透明度变为0.平时透明度是0.3左右。
  // 另外一点，刚刚开始的 时候 ，要持续一段时间检测文档的状态。如果一段时间都没有找到Video元素的话。就 把元素 移除。不要占着位置。
  // 又或者，在没有检测 到video元素之前，不要显示功能模块。检测到之后，也就是准备好之后，再显示不迟。
  // 未完善： 优酷等网站，视频是分段加载的，刚开始设置好了速率，但是再播放一段，就又恢复原来的速度了。需要启动另外一个周期计时器，不断检测播放速率。
  // 目前腾讯视频没有这个问题

  var SpeedyPlay = (function(){
    let O = {
      maxRate: 10,  // 最高播放速率
      loopCheckTime: 2000, // 循环检测时间
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
        #speedDiv{
          position:fixed;
          top:500px;
          left: 100px;
          z-index:999999;
          overflow:hidden;
          width:50px;
          padding:5px; border:1px solid #999;
          border-radius:50px;
          display:grid;
          grid-template-columns: 50px 50px 300px 50px;
          grid-template-rows: 50px;
          grid-column-gap: 5px;
          justify-content:flex-start;
          align-items:center;
          opacity:0.4;
        }
        #speedDiv:hover,#speedDiv:focus,#speedDiv:active{
          width:auto;
          padding-right:15px;
          opacity:1;
        }
        #speedDiv span,#speedDiv input,.speedText{
          font-weight: bolder;
          background: #FF0;
          display: grid;
          text-align: center;
        }
        #speedDiv .speedText{
          height: 50px;
          width: 50px;
          line-height: 50px;
          vertical-align: middle; /*必须设置 line-height, 这个才可用*/
          font-size: 30px;
          border-radius: 50px;
          cursor:move;
        }
        #speedDiv span[name='slowDown']{
          transform: rotateY(180deg);
        }
        #speedDiv input{
          width:50px;
          height:50px;
          border-radius:35px;
          display:inline-block;
          text-align:center;
          border:3px solid #333;
          margin-right: 5px;
        }
        #speedDiv span{
          font-size: 35px;
          height: 50px;
          width: 50px;
          border-radius:5px;
          cursor:pointer;
        }

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
      <div id="speedDiv" class="noselect" unselectable="on">
        <b class="speedText" @dblclick="resetSpeed"><center>{{speed}}</center></b>
        <span name="slowDown" @click.prevent="slowDown">♞</span>
        <input type="range" v-model.number="speed" min=0 max=${O.maxRate} :step=0.1 @input="changeRange" 
        :style="backgroundSize()"/>
        <span name="speedUp" @click.prevent="speedUp">✈</span>
      </div>
    `;

    // 获取当前站点取得名称
    O.getSiteName = function(){
      return location.host.replace(/\./g, '');
    };

    O.getSiteSpeed = function(){
      let speedCollete = GM_getValue('speedCollete', {});
      let siteName = O.getSiteName();
      return speedCollete.hasOwnProperty(siteName) ? speedCollete[siteName] : 1.0;
    };

    O.getSitePosition = function(){
      let positionCollect = GM_getValue('positionCollect', {});
      let siteName = O.getSiteName();
      return positionCollect.hasOwnProperty(siteName) ? positionCollect[siteName] : {left: 50, top: 100};
    };

    // 开启循环检查，目前设定的时 2000ms/次
    O.getIsLoopCheck = function(){
      let loopCheckCollect = GM_getValue('loopCheckCollect', {});
      let siteName = O.getSiteName();
      return loopCheckCollect.hasOwnProperty(siteName) ? loopCheckCollect[siteName] : false;
    };

    // 根据不同的网站，设置不同的速度。存储键名用 location.host 字母来拼接
    // 还有设置不同的位置
    // 按照不同频道读取各自的播放速度，未完成
    O.saveSpeed = function(speed){
      if(typeof speed != 'number'){
        O.log(`速度值设置错误，应该提供数值类型，${speed} 是 ${typeof speed} 类型！`, 'error');
        return false;
      }
      let speedCollete = GM_getValue('speedCollete', {});
      let siteName = O.getSiteName();
      speedCollete[siteName] = speed;
      GM_setValue('speedCollete', speedCollete);
      return true;
    };

    O.savePosition = function(left, top){
      if(typeof left != 'number' || typeof top != 'number'){
        O.log(`位置值设置错误，应该提供数值类型，现在 left:${typeof left}，top: ${typeof top}`, 'error');
        return false;
      }
      let positionCollect = GM_getValue('positionCollect', {});
      let siteName = O.getSiteName();
      positionCollect[siteName] = {
        left: left,
        top: top
      };
      GM_setValue('positionCollect', positionCollect);
      O.log(left+'--'+top);
      return true;
    };
    
    O.toggleIsLoopCheck = function(){
      let loopCheckCollect = GM_getValue('loopCheckCollect', {});
      let siteName = O.getSiteName();
      if(loopCheckCollect.hasOwnProperty(siteName)){
        delete loopCheckCollect[siteName];
        O.clearInterval(O.loopCheckTimer);
      }else{
        loopCheckCollect[siteName] = true;
        O.loopCheck();
      }
      GM_setValue('loopCheckCollect', loopCheckCollect);
    };

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
      $('body').first().before(O.speedDivOuterHTML);
      setTimeout(()=>{
        $('#speedDiv').Tdrag({
          handle:".speedText",
          // 拖拽结束后调用
          cbEnd: ()=>{
            O.savePosition(parseInt($('#speedDiv').css('left')), parseInt($('#speedDiv').css('top')));
          }
        });
      }, 600);
      
      let speedDiv = $('#speedDiv');

      let speedDivPosition = O.getSitePosition();
      speedDiv.css({
        'left': speedDivPosition.left+'px',
        'top': speedDivPosition.top+'px'
      });

      O.speedVue = new Vue({
        el: "#speedDiv",
        data: {
          speed: O.getSiteSpeed(),
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
          resetSpeed: function(){
            this.speed = 1;
            this.changeSpeed();
          },
          changeSpeed: function(){
            // GM_setValue("speed", this.speed);
            O.saveSpeed(this.speed);
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
            // GM_setValue("speed", this.speed);
            O.saveSpeed(this.speed);
            this.changeSpeed();
          },
          backgroundSize: function(){
            return `background-size:${this.speed*10}% 100%`;
          },
        }
      });
    };

    O.setPlaybackRate = function(){
      // 腾讯视频，最高4.0 倍速度，需要通过设置 sessionStorage 值来改变。目前没有找到直接操作的方法
      let videos = document.querySelectorAll("video");
      // 按照不同频道读取各自的播放速度，未完成
      let videoRate = O.getSiteSpeed();
      if(location.host == "v.qq.com"){
        window.sessionStorage.setItem("playbackRate", Math.min(videoRate, 4.0));
      }else{
        videos.forEach((vdo)=>{vdo.playbackRate = videoRate;});
      }
      O.log(videos[0].playbackRate);      
    };

    // 针对那些分段载入视频，新一段视频会恢复原来播放速度的网站，需要开启这个循环检查的功能
    O.loopCheck = function(){
      window.loopCheckTimer = setInterval(()=>{
        O.setPlaybackRate();
      }, O.loopCheckTime);
    };

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

          let isLoopCheck = O.getIsLoopCheck();
          if(isLoopCheck){
            O.loopCheck();
          }
          let loopCheckMenuText = isLoopCheck ? '取消循环检测播速' : '开启循环检测播速';
          GM_registerMenuCommand(loopCheckMenuText, O.toggleIsLoopCheck);
        }else if(checkVideoCounter>30){
          clearInterval(checkVideoTimer);
        }else{
          O.log('waiting...');
          checkVideoCounter ++;
        }
      },1000);
    };

    // ===  END ===
    return O;
  })();

  SpeedyPlay.isReady();

})();
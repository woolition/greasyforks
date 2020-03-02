// ==UserScript==
// @name         资源网助手
// @namespace    https://greasyfork.org/zh-CN/users/104201
// @version      2.1
// @description  最大资源网、172资源网、1977资源网、ok资源网、高清电影资源站、永久资源网、酷云资源、酷播资源网、非凡资源网[MP4][m3u8]视频直接播放，分类页面改进翻页功能。
// @author       黄盐
// 影视作品介绍页面
// @match        */?m=vod-*
// 分类页面
// @match        */detail/*
// ╮(╯▽╰)╭  好尴尬啊~我都忘记这个站点是用来做什么的了。最初添加好像是有些资源用这个网址开头的。
// @match        http://bobo.okokbo.com*
// @resource     playercss   https://cdn.bootcss.com/dplayer/1.25.0/DPlayer.min.css
// @require      https://cdn.bootcss.com/hls.js/0.12.4/hls.min.js
// @require      https://cdn.bootcss.com/dplayer/1.25.0/DPlayer.min.js
// @require      https://cdn.bootcss.com/zepto/1.2.0/zepto.min.js
// @noframes
// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==
/* jshint esversion: 6 */
;
GM_addStyle(`
   .miniSize::before{
      content: url("data:image/svg+xml,%3Csvg class='icon' style='width:1em;height:1em;vertical-align:middle' viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg' fill='white' overflow='hidden'%3E%3Cpath d='M170.667 341.333h170.666V170.667h512v512H682.667v170.666h-512v-512m512 0v256H768V256H426.667v85.333h256M256 512v256h341.333V512H256z'/%3E%3C/svg%3E");
   }
   .mediumSize::before{
      content: url("data:image/svg+xml,%3Csvg class='icon' style='width:1em;height:1em;vertical-align:middle' viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg' fill='white' overflow='hidden'%3E%3Cpath d='M896 128H298.667v85.333h554.666v469.334h85.334v-512A42.667 42.667 0 0 0 896 128z'/%3E%3Cpath d='M128 896h597.333A42.667 42.667 0 0 0 768 853.333v-512a42.667 42.667 0 0 0-42.667-42.666H128a42.667 42.667 0 0 0-42.667 42.666v512A42.667 42.667 0 0 0 128 896zm42.667-426.667h512v341.334h-512V469.333z'/%3E%3C/svg%3E");
   }
   .maxSize::before{
      content: url("data:image/svg+xml,%3Csvg class='icon' style='width:1em;height:1em;vertical-align:middle' viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg' fill='white' overflow='hidden'%3E%3Cpath d='M896 170.667H128a42.667 42.667 0 0 0-42.667 42.666v597.334A42.667 42.667 0 0 0 128 853.333h768a42.667 42.667 0 0 0 42.667-42.666V213.333A42.667 42.667 0 0 0 896 170.667zM853.333 768H170.667V341.333h682.666V768z'/%3E%3C/svg%3E");
   }
   .closePlayer::before{
      content: url("data:image/svg+xml,%3Csvg class='icon' style='width:1em;height:1em;vertical-align:middle' viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg' fill='white' overflow='hidden'%3E%3Cpath d='M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9c-4.4 5.2-.7 13.1 6.1 13.1h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z'/%3E%3C/svg%3E");
   }
    span.zPlayButton{color:orange;font-size:1.2em;padding:2px 5px}
    span.played{color:gray}
    span.zPlayButton:hover{cursor:pointer;font-size:1.5em;background:#00000010;padding:3px 10px}
    /* 不是 m3u8 或者 MP4 的链接，直接打开另外的网页就可以 */
    span[data-url]{display:none}
    span[data-url*=m3u8],span[data-url*=mp4]{display:inline-block}
    table a{font-family:"微软雅黑"}
    #playerContainer{width:60%;position:fixed;top:10em;z-index:9000;right:0}
    #playerControls{position:relative;top:0;text-align:right;z-index:10000;height:0;}
    #playerControls i{display:inline-block;max-height:40px;width:25px;padding:2px 5px;margin-left:5px;color:#fff;text-align:center}
    #playerControls i:hover{cursor:pointer;background:#ffff0080}
  `);
GM_addStyle(GM_getResourceText("playercss"));

z = Zepto;
let tempElement, tempText;
// 链接转化，添加播放按钮
z('input[name*=copy_]').forEach(element => {
   // 链接转化为真链接
   if(z(element).parent().find('a').length){
      // 有 <a> 元素的情况
      z(element).parent().find('a').attr({
         href: z(element).val(),
         target: '_blank'
      }).after(`<span class="zPlayButton" data-url='${z(element).val()}'>▶</span>`);
   }else{
      // 没有 <a> 元素的情况
      tempElement = element; tempText = z(element).parent().text(); 
      z(element).parent().empty().append(tempElement).append(`<a href="${z(tempElement).val()}" target="_blank">${tempText}</a>`)
      .append(`<span class="zPlayButton" data-url='${z(tempElement).val()}'>▶</span>`);
   }
});

// 页面添加播放器，按需初始化
function initPlayer(videoUrl = "") {
   // 添加播放器容器
   z('body').append(`
      <div id="playerContainer">
        <div id="playerControls">
           <i class="miniSize"></i>
           <i class="mediumSize"></i>
           <i class="maxSize"></i>
           <i class="closePlayer"></i>
        </div>
        <div id="zplayer"></div>
      </div>`);
   Window.dp = new DPlayer({
      container: z('#zplayer')[0],
      volume: 1,
      video: {
        url: videoUrl
      }
   });

  //  playingUrl 本身没有的属性，这里用来判断切换的链接是否同一个，如果是同一个的话，直接继续播放 dp.play() 就好
   Window.dp.playingUrl = videoUrl;

   // 播放器调整尺寸或者关闭按钮功能
   function spanClick(e) {
     console.log(Window.dp.url)
      let className = e.target.getAttribute('class');
      switch (className) {
        case 'miniSize':
           z('#playerContainer').css({ width: '35%', left: '', right: 0 });
           break;
        case 'mediumSize':
           z('#playerContainer').css({ width: '70%', left: '', right: 0 });
           break;
        case 'maxSize':
           z('#playerContainer').css({ width: '100%', right: '', left: 0 });
           break;
        case 'closePlayer':
           Window.dp.pause();
           z('#playerContainer').hide();
           break;
        default:
           break;
      }
   }
   z('#playerControls i').on('click', (e) => { spanClick(e); });

}

// 切换播放链接，点击播放按钮的时候生效
function switchVideo(e) {
   // 还没有播放器的话，就初始化
   if (Window.dp == undefined) {
      initPlayer();
   }
  //  如果是同一个链接，不用切换，继续播放
   if(Window.dp.playingUrl == e.target.dataset.url){
    z('#playerContainer').show();
    Window.dp.play();
    return;
   }
  //  如果是不同的链接，切换
   $('#playerContainer').show();
   Window.dp.playingUrl = e.target.dataset.url;
   Window.dp.switchVideo({
      url: e.target.dataset.url
   });
   Window.dp.play();
}
z('.zPlayButton').on('click', e => {
  z(e.target).addClass('played'); 
  switchVideo(e);
});


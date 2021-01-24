// ==UserScript==
// @name         倍速播放
// @namespace    https://gitee.com/yellownacl
// @version      1.0
// @description  HTML5播放器，倍速|最高10倍|计时器掌控者|视频跳过广告|视频广告加速
// @author       黄盐
// @include      *:*
// @grant        none
// @run-at       document-end
// @require      https://greasyfork.org/scripts/420615-cangshi-everything-hook/code/Cangshi-Everything-Hook.js?version=893832
// @require      https://greasyfork.org/scripts/420618-cangshi-timerhooker/code/Cangshi-TimerHooker.js?version=893838
// ==/UserScript==
/* jshint esversion: 6 */
const defaltLocalStorage = {speed: 1, position: {left: 50, top:100}, speedArray: [1, 2, 3, 15]}; // localStorage 默认值
// 因为外部资源脚本不允许 @grant GM_getValue 和 GM_setValue，暂时只能用本地存储替代扩展存储数据。
function GM_getValue(key, defaultValue){
  let res = localStorage.getItem('tampermonkeySpeedy')
  if(res){
    res = JSON.parse(res)
  }else{
    res = Object.assign({}, JSON.parse(JSON.stringify(defaltLocalStorage)))
  }
  if(res[key]){
    return res[key]
  }else{
    return defaultValue
  }
}
function GM_setValue(key,value){
  let res = localStorage.getItem('tampermonkeySpeedy')
  if(res){
    res = JSON.parse(res)
  }else{
    res = Object.assign({}, JSON.parse(JSON.stringify(defaltLocalStorage)))
  }
  res[key] = value
  localStorage.setItem('tampermonkeySpeedy', JSON.stringify(res))
}

function isNumber(obj){
  // 这个方法网络上找来的,对于整数，浮点数返回true，对于NaN或可转成NaN的值返回false。
  return obj === +obj
}

function querySelectorAll(parentNode, selector){
  let elements = parentNode.querySelectorAll(selector)
  elements = Array.prototype.slice.call(elements || [])
  return elements
}

function changeSpeed(rate, isInit=false){
  if(!isNumber(rate)){
    rate = parseFloat(rate)
    if(!isNumber(rate)) {
      log('不能转为速度')
      return false
    }
  }
  timer.change(1/rate)
  if(!isInit){GM_setValue('speed', rate)}
  return rate
}

function log(message,msgType="normal"){
  let style = {
    hint: `background:#ff0; border-left: 5px solid #333; padding:1px 3px; font-weight:bold;`,
    normal: `background:lightgreen;padding:1px 5px 1px 2px; border-right: 3px solid darkblue;`,
    warning: `background:#FFFBE5;padding:1px 5px 1px 2px; border-right: 3px solid darkblue;`,
    error: `background:red;padding:1px 5px 1px 2px; border-right: 3px solid darkblue;`
  };
  console.log("%c SpeedyPlay Info: %c"+message, style.hint, style[msgType]);
}

function getSideSpeed(){
  return GM_getValue('speed', 1.0)
}
function getSitePosition(){
  return GM_getValue('position', {left: 50, top: 100}) ;
}
function saveSpeed(speed){
  if(!isNumber(speed)){
    log(`速度值设置错误，应该提供数值类型，${speed} 是 ${typeof speed} 类型！`, 'error');
    return false;
  }
  GM_setValue('speed', speed);
  return true;
}
function savePosition(left, top){
  try {
    if(typeof left != 'number' || typeof top != 'number'){
      log(`位置值设置错误，应该提供数值类型，现在 left:${typeof left}，top: ${typeof top}`, 'error');
      return false;
    }
    GM_setValue('position', {left: left,top: top});
    log(left+'--'+top);
    return true;
  } catch (error) {}
  log("savePosition", left, top)
}
function saveSpeedArray(speedArray){
  GM_setValue('speedArray', speedArray);
}
function initSpeedy(){
  const speedData = {
    currentSpeed: GM_getValue('speed'),
    speedArray: GM_getValue('speedArray'), // 常用速度列表，比如2x,3x, 常规观看 10x,15x用来跳过广告。最多6个
    editArray: false, // 速度状态是否处于可编辑装填，如果是，点击就没有反应，如果不是，点击就改变速度
    lastTimeSpeed: 1, // 上次的速度，方便在2种速度之间切换，区分站点存储,
    position: GM_getValue('position'), // 控件的位置，区分站点存储
  }
  const speedyHandler = {
    set(target, prop, value){
      switch(prop){
        case "currentSpeed" :
          target["lastTimeSpeed"] = target["currentSpeed"]
          target[prop] = value
          currentSpeedElem.value = value
          speedText.innerHTML = value
          currentSpeedElem.setAttribute("style", `background-size:${value*10}% 100%`)
          changeSpeed(value)
          break;
        case "editArray":
          target[prop] = value
          if(speedState.editArray){
            speedArrayElems.forEach(element=>{
              element.setAttribute("contenteditable", "true")
            })
            editArrayButton.innerHTML = "保存"
          } else {
            let tmp = []
            speedArrayElems.forEach(element=>{
              element.removeAttribute("contenteditable")
              tmp.push(parseFloat(element.dataset.value))
            })
            editArrayButton.innerHTML = "编辑"
            speedState.speedArray = tmp
            saveSpeedArray(speedState.speedArray)
          }
          break;
        default:
          target[prop] = value
          // log(prop +' → '+ value.toString())
          break;
      }
    }
  }
  // 创建元素
  const node = document.createElement("DIV")
  let nodeHTML = `
    <div id="speedCtrl" style="left:${speedData.position.left}px;top:${speedData.position.top}px;">
      <div>
      <button id="speedText">${speedData.currentSpeed}</button>
      <input id="currentSpeed" type="range" min="0.1" max="10" step="0.1" value="${speedData.currentSpeed}"
        style="background-size:${speedData.currentSpeed*10}% 100%"
      >
      </div>
      <div>
        <span class="usualSpeed" data-value="${speedData.speedArray[0]}" data-index="0">${speedData.speedArray[0]}</span>
        <span class="usualSpeed" data-value="${speedData.speedArray[1]}" data-index="1">${speedData.speedArray[1]}</span>
        <span class="usualSpeed" data-value="${speedData.speedArray[2]}" data-index="2">${speedData.speedArray[2]}</span>
        <span class="usualSpeed" data-value="${speedData.speedArray[3]}" data-index="3">${speedData.speedArray[3]}</span>
        <button id="editArray" class="usualfn">编辑</button>
        <!--
        <button id="expandCtrl" class="usualfn">展开</button>
        -->
      </div>
    </div>
    <style>
    #speedCtrl{
      opacity: 0.1;
      width: 50px;
      height: 50px;
      overflow: hidden;
      display: block;
      position: fixed;
      top: 100px;
      left: 50px;
      display: grid;
      grid-template-rows: 50px 50px;
      z-index: 99999999;
      background: #ffff0010;
      border-radius: 5px;
    }
    #speedCtrl:hover{
      opacity: 1;
      background: #ffff0080;
      width: auto;
      height: auto;
    }
    #speedCtrl div{
      display: flex;
      align-items: center;
      justify-content: space-evenly;
    }
    #speedText{
      cursor: move;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 50px;
      height: 50px;
      border-radius: 25px;
      border: 2px solid #FDC02F;
      font-size: 30px;
      text-align: center;
      font-weight: bold;
      background: yellow;
    }
    .usualfn, .usualSpeed{
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 50px;
      height: 30px;
      background: yellow;
      border: 2px solid #FDC02F;
      border-radius: 5px;
      font-family: "微软雅黑", consolas;
    }
    .usualfn{
      cursor: pointer;
    }
    /*横条样式*/
    #speedCtrl input[type='range'] {
      -webkit-appearance: none;
      /*清除系统默认样式*/
      border: 1px solid #FDC02F;
      border-radius: 10px;
      width: 300px;
      background: -webkit-linear-gradient(#ff0, #ff0) no-repeat, #999;
      /*设置左边颜色为#ff0，右边颜色为#999*/
      /* background-size: 75% 100%;   设置左右宽度比例 */
      height: 20px;
      /*横条的高度*/
    }

    /*拖动块的样式*/
    #speedCtrl input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      /*清除系统默认样式*/
      height: 40px;
      /*拖动块高度*/
      width: 40px;
      /*拖动块宽度*/
      background: #fff;
      /*拖动块背景*/
      border-radius: 50%;
      /*外观设置为圆形*/
      border: solid 2px cyan;
      /*设置边框*/
      cursor: pointer;
    }
    </style>`;
  node.innerHTML = nodeHTML;
  document.body.appendChild(node)

  function move(e){
    let moveTarget = document.getElementById("speedCtrl");        //获取目标元素
    //算出鼠标相对元素的位置
    let disX = e.clientX - moveTarget.offsetLeft;
    let disY = e.clientY - moveTarget.offsetTop;
    let left, top;
    document.onmousemove = (e)=>{       //鼠标按下并移动的事件
      //用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
      left = e.clientX - disX;    
      top = e.clientY - disY;
      
      speedState.top = top;
      speedState.left = left;
      
      //移动当前元素
      moveTarget.style.left = left + 'px';
      moveTarget.style.top = top + 'px';
    };
    document.onmouseup = (e) => {
      savePosition(left, top)
      document.onmousemove = null;
      document.onmouseup = null;
    };
  }

  const speedState = new Proxy(speedData, speedyHandler)
  const speedText = document.getElementById("speedText")
  const currentSpeedElem = document.getElementById("currentSpeed")
  const speedArrayElems = querySelectorAll(document, ".usualSpeed")
  const editArrayButton = document.getElementById("editArray")

  speedText.addEventListener('dblclick', e=>{
    speedState.currentSpeed = speedState.lastTimeSpeed
  })
  speedText.addEventListener("mousedown", move)
  currentSpeedElem.addEventListener('input', e=>{
    speedState.currentSpeed = e.target.value
  })
  speedArrayElems.forEach(element => {
    element.addEventListener('click', e=>{
      if(!speedState.editArray){
        speedState.currentSpeed = e.target.dataset.value
      }
    })
    element.addEventListener('blur', e=>{
      let rate = parseFloat(e.target.textContent)
      if(isNumber(rate)){
        e.target.dataset.value = rate.toFixed(1)
        e.target.textContent = rate.toFixed(1)
      }else{
        let input = prompt("输入不正确，请输入数字")
        if(isNumber(input)){
          e.target.dataset.value = rate.toFixed(1)
          e.target.textContent = rate.toFixed(1)
        }else{
          e.target.textContent = e.target.dataset.value
        }
      }
    })
  });
  editArrayButton.addEventListener("click", e=>{
    speedState.editArray = !speedState.editArray 
  })

  changeSpeed(GM_getValue('speed'), true)


}
function isReady(){
  let startStamp = new Date().getTime()
  window.checkVideoTimer = setInterval(()=>{
    let videos = querySelectorAll(document, "video");
    let nowStamp = new Date().getTime()
    if(videos.length){
      clearInterval(checkVideoTimer);
      initSpeedy()
    }else if((nowStamp - startStamp) > 30000){
      clearInterval(checkVideoTimer);
    }else{
      log('waiting...');
    }
  },1000);
}

isReady();

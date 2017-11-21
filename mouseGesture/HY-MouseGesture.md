## HY-MouseGesture  (鼠标手势) ##
> [作者: 黄盐](https://github.com/woolition/greasyforks)   Wed Nov 22 2017 03:58:30 GMT+0800 (澳大利亚西部标准时间)


----------

## 功能

>右键手势

  **`停止加载`**    **`刷新`**    **`关闭`**    **`后退`**    **`前进`**    **`到顶部`**    **`到底部`**    **`打开最近关闭窗口`**    **`设置`**    **`网址向上一层`**    **`克隆标签页`**    **`打开空白页`**

>左键拖拽文字

  **`搜索选中文本`**    **`复制选中文本`**

>左键拖拽链接

  **`打开链接`**    **`复制链接`**

>左键拖拽图片

  **`保存图片`**    **`搜索图片`**    **`复制图片`**    **`复制图片链接`**    **`新标签打开图片`**    **`复制图片为DataURL`**    **`选中图片`**


----------
## 可配置选项

> **轨迹宽度**

> **轨迹增长**

> **提示字体大小**

> **轨迹颜色**

> **未定义提示**

> **语言**

> **识别距离**

> **提示文字背景颜色**

> **新标签在前台**

> **图片搜索引擎**

> **启用拖拽文字**

> **启用拖拽文本框文字**

> **启用拖拽链接**

> **启用拖拽图片**

> **图片链接识别为图片**

> **拖拽文本链接**

----------
## 右键画 **S** 轨迹,进入设置

![进入设置](https://github.com/woolition/greasyforks/raw/master/img/mouseGesture.gif)----------
## 更新历史


### V 1.1  [2017-11-21]
- 修正 GitHub 不能拖拽

`Chrome console:`

    Refused to execute inline event handler because it violates the following Content Security Policy directive: "script-src 'unsafe-eval' assets-cdn.github.com". Either the 'unsafe-inline' keyword, a hash ('sha256-...'), or a nonce ('nonce-...') is required to enable inline execution.

`fixed:`

    MG.canvas.setAttribute("ondragover", "allowDrop(event)");
    ↓↓↓↓↓
    MG.canvas.addEventListener("dragover", allowDrop, false);

- 增加了部分设置

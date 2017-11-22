# MouseGesture--That's the way to DRAG
# 鼠标手势--就是这么拽!
> [作者: 黄盐](https://github.com/woolition/greasyforks)   Thu Nov 23 2017 00:08:28 GMT+0800 (澳大利亚西部标准时间)

----------

#### 如果安装更新后,不能用了怎么办  (ヾﾉ꒪ཫ꒪)
#### ① (●￣(ｴ)￣●)づ  删除脚本,重新安装即可.
#### ②(●￣(ｴ)￣●)づ   清除存储数据,刷新网页即可.

----------

## 本次更新V 1.2   [2017-11-23]

- 增加了部分新功能,其中有两个重要的是 **\`翻译网页\`**  和 **\`破解VIP视频\`**.

    微软翻译,体验极好!

    破解VIP视频,支持自定义接口,观看视频倍儿爽!

## 功能

>右键手势

  **`停止加载`**    **`刷新`**    **`清缓存刷新`**    **`关闭`**    **`后退`**    **`前进`**    **`到顶部`**    **`到底部`**    **`打开最近关闭窗口`**    **`设置`**    **`网址向上一层`**    **`克隆标签页`**    **`打开空白页`**    **`翻译网页`**    **`破解VIP视频`**

>左键拖拽文字

  **`搜索选中文本`**    **`复制选中文本`**

>左键拖拽链接

  **`打开链接`**    **`复制链接`**    **`复制链接文字`**

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

> **目标语言**

> **破解视频接口**

> **等待时间**

> **新标签在前台**

> **文字搜索引擎**

> **图片搜索引擎**

> **启用拖拽文字**

> **启用拖拽文本框文字**

> **启用拖拽链接**

> **启用拖拽图片**

> **图片链接识别为图片**

> **拖拽文本链接**

----------
## 右键画 **S** 轨迹,进入设置

![进入设置](https://github.com/woolition/greasyforks/raw/master/img/mouseGesture.gif)

----------
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
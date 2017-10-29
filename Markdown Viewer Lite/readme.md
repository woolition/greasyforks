# Markdown Viewer Lite

Markdown Viewer, 见名知义,就是Markdown阅读器.
这里和其他人众多版本不同的就是,这是一个脚本,适用于Tampermonkey.

## 起源 

写这个脚本源于安装过的扩展:
[Markdown Viewer](https://github.com/simov/markdown-viewer)

但是浏览器插件多了的时候,就不怎么爽了,于是萌生了把扩展转化为脚本的念头.

## 现状

这个脚本里集成了上面提到的插件的大部分功能.但是也有差异,目前表现为:

*  [marked.js](https://github.com/chjj/marked) 脚本的各种选项
*  Remark 的各种选项,这里不提供
*  [emoji](https://github.com/emojione/emojione) 有,引用EmojiOne的
*  scroll 记录滚动条位置,无,因为目前觉得没有太大用处
*  TOC 有,采用[jQuery.zTree_Toc.js方案](https://github.com/woolition/i5ting_ztree_toc),做相应的调整,适应[zepto.js](http://zeptojs.com/)
*   MathJax 数学公式转化,有,而且比插件的更加猛,因为这里自豪地采用了[KaTex](https://khan.github.io/KaTeX/)

## 使用

右上角有个半透明的图标,点击就可以看到各种选项了.
## What's New?
what's new,就不知道,what's more就有.
插件中没有的图像转化插件,这里加了4个,后续可能还有更多,
*  流程图[flowchart.js](http://flowchart.js.org/)
*  时序图[Sequence Diagram](https://github.com/bramp/js-sequence-diagrams)
* 美人鱼[mermaid.js](https://github.com/knsv/mermaid) 实力转化 **甘特图** **流程图** **序列图** 还有什么 **Class diagram** 和 **Git graph** 总之很牛X的样子...

## 关于
因为本人极度不专业代码,这小小的脚本前后花了不少时间,当然,Bug肯定少不了.但是现在应该说是能够用了.而且,如果不是非常专业的用户的话,也应该够用了.使用后欢迎提意见,如果觉得合适,后续版本加入

## 功能添加打算
1. 折线图,饼状图,柱状图等的解析功能
2. 高级用户配置界面

## 版本更新
V 0.5.2<br/>
2017-10-29<br/>
增加 自动目录(<b style="color:red;">T</b>able <b style="color:red;">O</b>f <b style="color:red;">C</b>ontent)功能.<br/>
感谢项目 [jQuery.zTree_Toc.js](https://github.com/woolition/i5ting_ztree_toc)
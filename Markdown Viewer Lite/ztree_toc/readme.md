## 项目源地址
https://github.com/woolition/i5ting_ztree_toc

## 修改: 把jQuery 修改为 zepto
1. 这里只是简单地把原文件的 JQuery 修改为 Zepto.(jquery.ztree.core-3.5.js)(ztree_toc.js)
2. 还有 jQuery 的 ':header' 选择器 修改为 'h1,h2,h3,h4,h5,h6' 以适应工作而已.(ztree_toc.js)
3. $('#' + treeNode.id).css('color' ,'red').fadeOut("slow" ,***** 修改为自定义的动画.(ztree_toc.js)
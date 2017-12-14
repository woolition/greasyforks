// ==UserScript==
// @name         Mini-ScrollBar
// @name:zh-CN   迷你滚动条
// @namespace    https://greasyfork.org/zh-CN/users/104201
// @version      0.1
// @description  Make scroll bar mini.
// @description:zh-CN  滚动条迷你化。
// @author       黄盐
// @include      *
// @run-at       document-start
// @grant        none
// ==/UserScript==
;
(function() {
  'use strict';
  const scrollbarWidth = 8,
    thumbBorderWidth = 1,
    scrollbarMouseOverColor = 'rgba(128, 128, 128, 0.2)',
    thumbColor = 'rgba(0, 0, 0, 0.4)',
    thumbMouseOverColor = 'rgba(0, 0, 0, 0.8)';
  let a = document.createElement('style');
  a.textContent = `
::-webkit-scrollbar{
width: ${scrollbarWidth}px !important;
height: ${scrollbarWidth}px !important;
background:transparent;
}
::-webkit-scrollbar:hover {
background: ${scrollbarMouseOverColor};
}
::-webkit-scrollbar-thumb {
border: ${thumbBorderWidth}px solid transparent !important;
background-color: ${thumbColor} !important;
z-index: 2147483647;
-webkit-border-radius: 12px;
background-clip: content-box;
}
::-webkit-scrollbar-corner {
background: rgba(255, 255, 255, 0.3);
border: 1px solid transparent
}
::-webkit-scrollbar-thumb:hover {
background-color: ${thumbMouseOverColor} !important;
}
::-webkit-scrollbar-thumb:active {
background-color: rgba(0, 0, 0, 0.6) !important
}
`;
  let doc = document.body || document.documentElement;
  doc.appendChild(a);
})();
// ==UserScript==
// @name         迷你滚动条(Mini ScrollBar)
// @namespace    https://greasyfork.org/zh-CN/users/104201
// @version      0.4
// @description  滚动条迷你化.(Make scroll bar mini.)
// @author       黄盐
// @include      *
// @run-at       document-start
// @compatible chrome
// @grant        none
// ==/UserScript==
;
(function() {
  'use strict';
  const scrollbarWidth = 8,
    thumbBorderWidth = 1,
    thumbBorderColor = "rgba(255, 255, 255, 0.4)",
    scrollbarMouseOverColor = 'rgba(128, 128, 128, 0.2)',
    thumbColor = 'rgba(0, 0, 0, 0.4)',
    thumbMouseOverColor = 'rgba(0, 0, 0, 0.8)';
  const cssText =`
    ::-webkit-scrollbar{
    width: ${scrollbarWidth}px !important;
    height: ${scrollbarWidth}px !important;
    background:transparent;
    filter: invert();
    }
    ::-webkit-scrollbar:hover {
    background: ${scrollbarMouseOverColor};
    }
    ::-webkit-scrollbar-thumb {
    border: ${thumbBorderWidth}px solid ${thumbBorderColor} !important;
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
function GMaddStyle(css) {
  let a = document.createElement('style'),doc;
  a.textContent = '<!--\n' + css + '\n-->';
  if (location.origin === "file://") {
    doc = document.head || document.documentElement;
  } else {
    doc = document.body || document.documentElement;
  }
  doc.appendChild(a);
}
GMaddStyle(cssText);

})();
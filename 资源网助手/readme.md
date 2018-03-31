# 资源网助手.user.js
> 版本 V1.2

> 作者: 黄盐

### 适用于

> [最大资源网](http://www.zuidazy.com/?m=vod-*)

> [OK资源采集](http://okzyzy.cc/?m=vod-*)

> [酷云资源](http://www.kuyun.co/)

### 如何关闭播放器
> **右键菜单** -> **🗙关闭播放器**

### 关于无法播放 ?

> 由于资源站的视频大部分需要跨域,因此,你需要安装允许跨域扩展,比如[Moesif Origin & CORS Changer,](https://chrome.google.com/webstore/detail/moesif-origin-cors-change/digfbfaphojjndkpccljibejjbppifbc?utm_source=chrome-ntp-icon) 并且启用扩展

> 关于OK资源网,部分连接为<b>http://bobo.okokbo.com/**.m3u8</b>的电视剧无法播放,
目前由于站点跨域设置有些问题,如果需要看,要在CROS扩展设置:
**`Response Headers:`** `->` **`Access-Control-Allow-Origin:`** 的值为 **`http://okzyzy.com`** 才能正常观看.

>观看其他站点的时候再把:
**`Response Headers:`** `->` **`Access-Control-Allow-Origin:`** 的值设置为 **`*`** 才能正常观看(是的,有些麻烦).

### 采用的播放器

 <h3>[DPlayer](https://github.com/MoePlayer/DPlayer)</h3>
<p align="center">
<img src="https://ws4.sinaimg.cn/large/006tKfTcgy1fhu01y9uy7j305k04s3yc.jpg" alt="ADPlayer" width="100">
</p>

[![npm](https://img.shields.io/npm/v/dplayer.svg?style=flat-square)](https://www.npmjs.com/package/dplayer)
[![npm](https://img.shields.io/npm/l/dplayer.svg?style=flat-square)](https://github.com/MoePlayer/DPlayer/blob/master/LICENSE)
[![npm](https://img.shields.io/npm/dt/dplayer.svg?style=flat-square)](https://www.npmjs.com/package/dplayer)
[![size](https://badge-size.herokuapp.com/MoePlayer/DPlayer/master/dist/DPlayer.min.js?compression=gzip&style=flat-square)](https://github.com/MoePlayer/DPlayer/tree/master/dist)
[![Travis](https://img.shields.io/travis/MoePlayer/DPlayer.svg?style=flat-square)](https://travis-ci.org/MoePlayer/DPlayer)
[![devDependency Status](https://img.shields.io/david/dev/MoePlayer/dplayer.svg?style=flat-square)](https://david-dm.org/MoePlayer/DPlayer#info=devDependencies)

### 历史

V1.2  2018-3-31

新增支持 酷云资源 网.

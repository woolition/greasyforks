# 资源网助手.user.js
> 版本 V2.0 更新于 2020-3-2

> 作者: 黄盐

### 适用于

> [最大资源网](http://www.zuidazy.net/?m=vod-*)

> [OK资源采集](http://www.okzyzy.com/?m=vod-*)

> [酷云资源](http://www.kuyun.co/)

> [精品资源](http://jingpinzy.com/)

### 如何关闭播放器
  右上角有几个按钮，**X** 那个就是

### V2.0 版本风险提示

  有可能某些网站，由于**跨域**原因的限制，可能不能正常播放，如果有发现，请反馈给我，我再找时间修复

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

#### V2.0  2020-3-2

- 修复不起作用的bug，可能是链接的库变动了，现在这个应该可以用

- 删除了 **右键关闭** 这个功能

- 播放器的尺寸和功能做了一定的调整，具体细节就不说了。你们更新来体验下吧。

#### V1.5  2019-5-17

- 修复不能全屏播放Bug

- `DPlayer` 版本升级至 `1.25.0`, 

  `Hls.js` 版本升级至 `0.12.4`

- 新增 172资源网、1977资源网、ok资源网、高清电影资源站、永久资源网、非凡资源网等等的支持。
  网址列表匹配改成通用匹配。以后有 `*/?m=vod-*` 格式的播放页面，都可以适配了
  隆重致谢【品味】老哥提供诸多站点。但是把我代码拿过去，做成新脚本，连我名字都不提就不好了吧。 ( →_→)

#### V1.4  2018-8-12

- 精品资源网，最大资源网，OK资源网 网址更新，跟进匹配.

#### V1.3  2018-5-17

- 新增支持 精品资源 网.

#### V1.2  2018-3-31

- 新增支持 酷云资源 网.

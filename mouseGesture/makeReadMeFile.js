//======================
let fn = {
    gesture: {
        stopLoading: ['停止加载', 'StopLoading'],
        reload: ['刷新', 'Refresh'],
        close: ['关闭', 'Close'],
        back: ['后退', 'Back'],
        forward: ['前进', 'Forward'],
        toTop: ['到顶部', 'Scroll to Top'],
        toBottom: ['到底部', 'Scroll to Bottom'],
        reopenLatestCloseTab: ['打开最近关闭窗口', 'Reopen Latest Closed Window'],
        setting: ['设置', 'Settings'],
        URLLevelUp: ['网址向上一层', 'URL hierarchy up'],
        cloneTab: ['克隆标签页', 'Duplicate tab'],
        openBlankTab: ['打开空白页', 'Open New Blank Tab'],
    },
    dragText: {
        searchSelectedText: ['搜索选中文本', 'Search Selected Text'],
        copySelectedText: ['复制选中文本', 'Copy Selected Text']
    },
    dragLink: {
        openLink: ['打开链接', 'Open Link'],
        copyLink: ['复制链接', 'Copy Link']
    },
    dragImg: {
        saveImg: ['保存图片', 'Save Image'],
        searchImg: ['搜索图片', 'Search Image'],
        copyImage: ['复制图片', 'Copy Image to ClickBoard'],
        copyImgURL: ['复制图片链接', 'Copy ImageURL'],
        openImgNewTab: ['新标签打开图片', 'Open Image in New Tab'],
        image2DataURL: ['复制图片为DataURL', 'Copy Image as DataURL'],
        selectTheImage: ['选中图片', 'Select This Image']
    }
};
let setting = {
    mg1Start: {
        type: '1',
        id: 'mg1'
    },
    mg1title1: {
        item: ['界面', 'UI'],
        type: '2'
    },
    maxLineWidth: {
        item: ['轨迹宽度', 'Line Width'],
        description: ['鼠标轨迹最大宽度,单位"px"'],
        data: {
            type: 'input',
            name: 'maxLineWidth',
            more: 'num'
        }
    },
    lineGrowth: {
        item: ["轨迹增长", 'Line Grow'],
        description: ['轨迹增长速度,单位"px"'],
        data: {
            type: 'input',
            name: 'lineGrowth',
            more: 'num'
        }
    },
    fontSize: {
        item: ["提示字体大小", 'Tips Font Size'],
        description: ['功能提示字体的大小,单位"px"'],
        data: {
            type: 'input',
            name: 'fontSize',
            more: 'num'
        }
    },
    lineColor: {
        item: ["轨迹颜色", 'Line Color'],
        description: ['允许3|6|8位16进值,如 0f0 或 00ff00 都表示绿色,8位值后2位表示透明度'],
        data: {
            type: 'input',
            name: 'lineColor',
            more: 'color'
        }
    },
    funNotDefine: {
        item: ["未定义提示", 'Not Define Tips'],
        description: ['手势或者功能未定义时的提示信息'],
        data: {
            type: 'input',
            name: 'funNotDefine',
            more: ''
        }
    },
    language: {
        item: ["语言", 'Language'],
        description: ['0 表示中文 1 for English'],
        data: {
            type: 'input',
            name: 'language',
            more: 'num'
        }
    },
    SENSITIVITY: {
        item: ["识别距离", 'Sensitivigy'],
        description: ['方向变化计算距离'],
        data: {
            type: 'input',
            name: 'SENSITIVITY',
            more: 'num'
        }
    },
    tipsBackground: {
        item: ["提示文字背景颜色", 'Tis Background Color'],
        description: ['提示文字的背景颜色'],
        data: {
            type: 'input',
            name: 'tipsBackground',
            more: 'color'
        }
    },
    mg1title2: {
        item: ['设定', 'Setting'],
        type: '2'
    },
    notBackground: {
        item: ["新标签在前台", 'Tis Background Color'],
        description: ['打开新标签后马上转到新标签'],
        data: {
            type: 'checkbox',
            name: 'notBackground',
            more: ''
        }
    },
    imgSearchEnging: {
        item: ["图片搜索引擎", 'Image Search Enging'],
        description: ['用 %URL 代替 图片'],
        data: {
            type: 'input',
            name: 'imgSearchEnging',
            more: ''
        }
    },
    dragtext: {
        item: ["启用拖拽文字", 'Enable Drag Text'],
        description: ['选中文字并且拖拽时候的功能'],
        data: {
            type: 'checkbox',
            name: 'dragtext',
            more: ''
        }
    },
    draginput: {
        item: ["启用拖拽文本框文字", 'Enable Drag Text'],
        description: ['文本框中选中文字并且拖拽时候,使用拖拽的功能'],
        data: {
            type: 'checkbox',
            name: 'draginput',
            more: ''
        }
    },
    draglink: {
        item: ["启用拖拽链接", 'Enable Drag Link'],
        description: ['拖拽链接时候的功能'],
        data: {
            type: 'checkbox',
            name: 'draglink',
            more: ''
        }
    },
    dragimage: {
        item: ["启用拖拽图片", 'Enable Drag Image'],
        description: ['拖拽图片时候的功能'],
        data: {
            type: 'checkbox',
            name: 'dragimage',
            more: ''
        }
    },
    //imgfirst:{item:["启用拖拽图片优先",'Enable Drag Image Priority'],description:['拖拽有链接的图片时候,优先识别为图片'],data:{type:'checkbox',name:'imgfirst',more:''}},
    imgfirstcheck: {
        item: ["图片链接识别为图片", 'Enable Drag Image'],
        description: ['拖拽图片链接时候,识别为拖拽图片的功能'],
        data: {
            type: 'checkbox',
            name: 'imgfirstcheck',
            more: ''
        }
    },
    setdragurl: {
        item: ["拖拽文本链接", 'Enable Drag Image'],
        description: ['拖拽文本为链接时候,识别为拖拽链接'],
        data: {
            type: 'checkbox',
            name: 'setdragurl',
            more: ''
        }
    },
    mg1end: {
        type: '3'
    }
};
//=======================
//把脚本内容加到 主脚本的最后,即可生成相应的ReadMe文件
function makeReadMeFile() {
    var txt = `## HY-MouseGesture  (鼠标手势) ##\n> [作者: 黄盐](https://github.com/woolition/greasyforks)   ${Date()} \n\n
----------\n\n## 功能\n\n`;
    for (j in fn) {
        //  console.log(j);
        txt += '>' + j + '\n\n';
        for (i in fn[j]) {
            //      console.log(`  \`${fn[j][i][0]}\`  `);
            txt += `  **\`${fn[j][i][0]}\`**  `;
        }
        txt += '\n\n';
    }
    txt = txt.replace('gesture', '右键手势').replace(/dragText/, '左键拖拽文字').replace(/dragLink/, '左键拖拽链接').replace(/dragImg/, '左键拖拽图片');

    txt += `\n----------\n## 可配置选项\n\n`;
    for (i in setting) {
        if (!setting[i].type) {
            txt += `> **${setting[i].item[0]}**  \n\n`;
        }
    }

    txt += `----------\n## 右键画 **S** 轨迹,进入设置\n\n![进入设置](https://github.com/woolition/greasyforks/raw/master/img/mouseGesture.gif)`;
    txt += `----------\n## 更新历史\n\n`;
    txt += `
### V 1.1  [2017-11-21]
- 修正 GitHub 不能拖拽

\`Chrome console:\`

    Refused to execute inline event handler because it violates the following Content Security Policy directive: "script-src 'unsafe-eval' assets-cdn.github.com". Either the 'unsafe-inline' keyword, a hash ('sha256-...'), or a nonce ('nonce-...') is required to enable inline execution.

\`fixed:\`

    MG.canvas.setAttribute("ondragover", "allowDrop(event)");
    ↓↓↓↓↓
    MG.canvas.addEventListener("dragover", allowDrop, false);

- 增加了部分设置

    `;
    console.log(txt);


}
makeReadMeFile();
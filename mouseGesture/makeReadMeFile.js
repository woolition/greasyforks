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

    txt += `----------\n## 可配置选项\n\n`;
    for (i in setting) {
        if (!setting[i].type) {
            txt += `> **${setting[i].item[0]}**  \n\n`;
        }
    }

    txt += `----------\n## 右键画 **S** 轨迹,进入设置\n\n![进入设置](https://github.com/woolition/greasyforks/raw/master/img/mouseGesture.gif)`;

    console.log(txt);

}
makeReadMeFile();
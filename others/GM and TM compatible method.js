 /*这里不采用GM_addStyle,是为了避免网页局部更新的时候,把<head>内部的<style>去除了,例如百度搜索,点击搜索一下按钮的时候*/
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
  /* 兼容 Tampermonkey | Violentmonkey | Greasymonkey 4.0+
   * 为了兼容GreasyMonkey 4.0 获取结构化数据,比如 json Array 等,
   * 应当先将字符串还原为对象,再执行后续操作
   * GMgetValue(name,defaultValue).then((result)=>{
   *   let result = JSON.parse(result);
   *   // other code...
   * };
   */
  function GMgetValue(name, defaultValue) {
    if (typeof GM_getValue === 'function') {
      return new Promise((resolve, reject) => {
      resolve(GM_getValue(name, defaultValue));
      // reject();
      });
    } else {
      return GM.getValue(name, defaultValue);
    }
  }
  /* 兼容 Tampermonkey | Violentmonkey | Greasymonkey 4.0+
   * 为了兼容GreasyMonkey 4.0 储存结构化数据,比如 json Array 等,
   * 应当先将对象字符串化,
   * GMsetValue(name, JSON.stringify(defaultValue))
   */
  function GMsetValue(name, defaultValue) {
    if (typeof GM_setValue === 'function') {
      GM_setValue(name, defaultValue);
      return new Promise((resolve, reject) => {
      resolve();
      reject();
      });
    } else {
      return GM.setValue(name, defaultValue);
    }
  }
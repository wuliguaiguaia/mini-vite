## 简写vite


#### 原理
- 构建时优化
- 按需加载
1. 当浏览器识别type="module"引入js文件的时候，内部的import 就会发起一个网络请求
2. vite的任务，起一个http 服务，来拦截这些请求，去做vue相关的编译，解析等，实现了按需加载
3. dev 秒开，build走rollup
4. 热更新通过 socket协议实现

#### v1 步骤
> 1、Access to script at 'file:///Users/alias/code/pratice/vite/_vite-test/src/main.js' from origin 'null' has been blocked by CORS policy: Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, chrome-untrusted, https.
  使用koa开一个http服务器

> 2、TypeError: Failed to resolve module specifier "vue". Relative references must start with either "/", "./", or "../".
  无法解析 import {} from 'vue'
  1. 先将'vue'转为 '/@modules/vue'
  2. 从node_module 的 package.json 的 module 中取打包后的路径
  3. 从此路径取文件
  
  报错： ReferenceError: process is not defined，，，，，，vue源码里有用process.ENV判断环境

  4. 为html内率先注入一个假的 process

> 3、引入 App.vue 
  1. 使用 @vue/compiler-sfc 解析 .vue 文件，拿到 script
  2. 通过 query 判断 使用 @vue/compiler-dom 解析 template，拿到 render


#### vite vs webpack

1、webpack 是事先打包好，build在内存里面，vite 相当于拦截请求，发送到服务器的代码是原生的 import 语法




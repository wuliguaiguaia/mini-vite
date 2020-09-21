const fs = require('fs'),
    path = require('path'),
    Koa = require('koa');

let rewriteUtil = {};
const app = new Koa();

const compilerSfc = require('@vue/compiler-sfc') // .vue
const compilerDom = require('@vue/compiler-dom') // 模板


app.use(async ctx => {
    const {
      request: { url, query }
    } = ctx
    // 首页
    if(['/', '/index.html'].includes(url)) {
        ctx.type = "text/html";
        let content = fs.readFileSync('./index.html', 'utf-8');
        content = content.replace('<script ', `
            <script>
                window.process = {env: {NODE_ENV:'dev'}} // fade
            </script>
        <script `)
        ctx.body = content; // ./../index.html
    } else if(url.endsWith('.css')) {
        const p = path.resolve(__dirname, '../', url.slice(1));
        const str = fs.readFileSync(p, 'utf-8');
        console.log(str);
        const content = `
const css = "${str.replace(/\n/g, '')}"
const styleEl = document.createElement('style');
styleEl.type="text/css";
styleEl.innerHTML = css;
document.head.appendChild(styleEl);
export default css
        `
        ctx.type = 'application/javascript'
        ctx.body = rewriteUtil._import(content)
    } else if(url.endsWith('.js')) {
        const p = path.resolve(__dirname, '../', url.slice(1));
        ctx.type = 'application/javascript';
        const content = fs.readFileSync(p, 'utf-8');
        ctx.body = rewriteUtil._import(content)
    } else if(url.startsWith('/@modules/')) {
        const prefix = path.resolve(__dirname, '../', 'node_modules', url.replace('/@modules/', ''));
        const module = require(prefix + '/package.json').module;
        const p = path.resolve(prefix, module);
        const content = fs.readFileSync(p, 'utf-8');
        ctx.type = 'application/javascript';
        ctx.body = rewriteUtil._import(content);
    } else if(url.indexOf('.vue') > -1) {
        const p = path.resolve(__dirname, '..', url.split('?')[0].slice(1));
        const {descriptor} = compilerSfc.parse(fs.readFileSync(p, 'utf-8'));
        if(!query.type) {
            ctx.type = 'application/javascript';
            ctx.body = `
${rewriteUtil._import(descriptor.script.content.replace('export default ','const __script = '))}
import {render as __render} from "${url}?type=template"
__script.render = __render
export default __script;
            `;
        }else if(query.type === 'template'){ 
            const template = descriptor.template;
            const render = compilerDom.compile(template.content, {mode: "module"}).code;
            ctx.type = 'application/javascript';
            ctx.body = rewriteUtil._import(render);
        }
    }
})

app.listen(3003, _ =>{
    console.log('123');
})




rewriteUtil = {
    _import(content) {
        return content.replace(/from\s+['"']([^'"]+)['"]/g, (match, $1) => {
            if(!/^[\.\/]/.test($1)) {
                return `from "/@modules/${$1}"`;
            } else {
                return match;
            }
        })
    }
}
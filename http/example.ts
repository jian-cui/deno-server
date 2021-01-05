import { Application, Middleware } from "./koa.ts";
import { Router } from './router.ts';
import { staticServe } from './web_static.ts';

const app = new Application();

const router = new Router();

const html = `
  <html>
    <head>
      <!-- <meta charset="utf-8" /> -->
      <meta http-equiv="content-Type" content="text/html;charset=utf-8" />
      <title>主页面</title>
    </head>
    <body>
      根目录
    </body>
  </html>
`

router.get("/", function(req, next) {
  const headers = new Headers();
  headers.set("content-type", "text/html;charset:UTF-8");
  req.respond({
    status: 200,
    headers: headers,
    body: html
  });
})

router.get("/user/:uid", function(req, next) {
  req.respond({
    status: 200,
    body: 'User Page'
  })
});

app.use(router.routes());

// 静态资源
const baseDir = [Deno.cwd(), "public"].join("/");
app.use(staticServe(baseDir, { prefix: `/static`}));

const serveOptions = {
  hostname: "127.0.0.1",
  port: 8080
}

app.listen(serveOptions, function() {
  console.log(`server started at ${serveOptions.hostname}:${serveOptions.port}`);
});
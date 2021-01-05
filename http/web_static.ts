/**
 * 静态资源中间件
 */
import { Middleware } from "./koa.ts";


const readFileSync = Deno.readFileSync;
const lstatSync = Deno.lstatSync;

const decoder = new TextDecoder();

interface ServeOptions {
  prefix: string;
}

/**
 * 读取静态文件
 * 
 * @param {string} fullFilePath 文件路径
 * @returns 返回文件内容
 */
function renderFile(fullFilePath: string) {
  const bytes = readFileSync(fullFilePath);
  const content = decoder.decode(bytes);
  return content;
}

/**
 * 过滤静态资源请求路径
 * 
 * @param {string} path HTTP请求路径
 * @param {ServeOptions} [opts] HTTP请求路径需要操作的参数
 *  opts.prefix {string} 清除掉HTTP路径的前缀
 * @returns 
 */
function pathFilter(path: string, opts?: ServeOptions) {
  const prefix = (opts && opts.prefix) ? opts.prefix : "";
  let result = "";
  result = path.replace(prefix, "");
  // 过滤掉路径里的 ".." "//" 字符串，防止越级访问文件夹
  result = result.replace(/[\.]{2,}/ig, "").replace(/[\/]{2,}/ig, "");
  return result;
}


function serve(baseDir: string, options?: ServeOptions): Middleware {
  return async function(req, next) {
    // await next();

    const pathname = req.url;
    if (
        req.method === "GET" &&
        options &&
        typeof options.prefix === "string" &&
        pathname.indexOf(options.prefix) === 0
      ) {
      const path = pathFilter(pathname, options);
      const fullPath = `${baseDir}${path}`;
      let result = `${path} is not found!`;
      try {
        const stat = lstatSync(fullPath);
        if (stat.isFile === true) {
          result = renderFile(fullPath);
          req.respond({
            status: 200,
            body: result
          });
        } else {
          req.respond({
            status: 404,
            body: result
          })
        }
      } catch (err) {
        req.respond({
          status: 404,
          body: err._stack
        })
      }
    } else {
      next();
    }
  }
}

export const staticServe = serve;
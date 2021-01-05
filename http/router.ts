import { Middleware } from "./koa.ts";

interface Layer {
  method: string;
  path: string;
  pathRegExp: RegExp;
  middleware: Middleware;
  getQueryString: (path: string) => { [key: string]: string };
  getParams: (path: string) => { [key: string]: string };
}

export class RouteLayer implements Layer {
  public method: string;
  public path: string;
  public middleware: Middleware;
  public pathRegExp: RegExp; // 获取路由参数值的正则
  private pathParamKeyList: string[]; // 路由中的参数
  constructor(method: string, path: string, middleware: Middleware) {
    this.path = path;
    this.method = method;
    this.middleware = middleware;
    this.pathRegExp = new RegExp(path);
    this.pathParamKeyList = [];
    this.initPathToRegExpConfig(path);
  }
  /**
   * 获取实例请求路径中关键字的数据
   * 例如：
   * this.path = "page/:pid/user/:uid"
   * actionPath = "page/001/user/abc"
   * 返回 { pid: 001, uid: "abc" }
   * 
   * @param {string} actionPath 
   * @return {object}
   * 
   * @memberOf RouteLayer
   */
  public getParams(actionPath: string) {
    const result: { [key: string]: string } = {};
    const pathRegExp = this.pathRegExp;
    const pathParamKeyList = this.pathParamKeyList;
    if (Array.isArray(pathParamKeyList) && pathParamKeyList.length > 0) {
      const execResult = pathRegExp.exec(actionPath);
      pathParamKeyList.forEach((key, index) => {
        const val = execResult![index + 1];
        if (typeof val === "string") {
          result[key] = val;
        }
      });
    }
    return result;
  }
  /**
   * 获取示例请求路径中带的参数数据
   * 例如
   * action = "page/101/user/10?type=news"
   * 返回 { type: "news" }
   * 
   * @param {string} actonPath 
   * 
   * @memberOf RouteLayer
   */
  public getQueryString(actionPath: string) {
    const result: { [key: string]: string } = {};
    const queryString: string | undefined = actionPath.split('?')[1];
    const queryStringRegExp = /([^=\/&]+=[^=\/&]+)/ig;
    let queryStringParams: string[] | null = [];
    if (queryString !== undefined) {
      queryStringParams = queryString.match(queryStringRegExp);
      if (queryStringParams) {
        queryStringParams.forEach(str => {
          const key = str.split("=")[0];
          const val = str.split("=")[1];
          result[key] = val;
        })
      }
    }
    return result;
  }
  /**
   * 将路由规则转成正则配置
   * 
   * @private
   * @param {string} path 
   * @return {RegExp}
   * 
   * @memberOf RouteLayer
   */
  private initPathToRegExpConfig(path: string) {
    const pathItemRegExp = /\/([^\/]{2,})/ig;     // 获取路由路径中每个单项
    const paramKeyRegExp = /^\/\:[0-9a-zA-Z\_]/i; // 路由中的参数
    const pathItems = path.match(pathItemRegExp); // 将path分割成不同的路径
    const pathParamKeyList: string[] = [];
    const pathRegExpItemStrList: string[] = [];
    if (Array.isArray(pathItems)) {
      pathItems.forEach(item => {
        if (typeof item === "string") {
          if (paramKeyRegExp.test(item)) {
            // 如果该路由路径是参数 即[:userId]格式
            pathRegExpItemStrList.push(`\/([^\/]+?)`); // 该项插入正则 用于获取对应路由位置的参数值
            const pathParamKey = item.replace(/^\/\:/ig, "");
            pathParamKeyList.push(pathParamKey);
          } else {
            pathRegExpItemStrList.push(item);
          }
        }
      });
    }

    const regExpStr = `^${pathRegExpItemStrList.join("")}[\/]?$`;
    const regExp = new RegExp(regExpStr, "i");
    this.pathParamKeyList = pathParamKeyList;
    this.pathRegExp = regExp;
  }
}




export interface Route {
  get: (path: string, middleware: Middleware) => void; // 注册 GET 请求方法
  post: (path: string, middleware: Middleware) => void;
  delete: (path: string, middleware: Middleware) => void;
  put: (path: string, middleware: Middleware) => void;
  patch: (path: string, middleware: Middleware) => void;
}

export class Router implements Route {
  private _stack: Layer[];
  constructor() {
    this._stack = [];
  }
  /**
   * 注册路由
   * 
   * @private
   * @param {string} method 路由方法
   * @param {string} path 路由路径 例如 /pages/:pid/user/:uid 或 /page/hello
   * @param {Middleware} middleware 路由的执行方法
   * 
   * @memberOf Router
   */
  private register(method: string, path: string, middleware: Middleware) {
    const layer = new RouteLayer(method, path, middleware);
    this._stack.push(layer);
  }
  /**
   * 注册 GET请求路由
   * 
   * @param {string} path 路由规则
   * @param {Middleware} middleware 路由中间件方法
   * 
   * @memberOf Router
   */
  get(path: string, middleware: Middleware) {
    this.register("GET", path, middleware);
  }
  /**
   * 注册 POST请求路由
   * 
   * @param {string} path 路由规则
   * @param {Middleware} middleware 路由中间件方法
   * 
   * @memberOf Router
   */
  post(path: string, middleware: Middleware) {
    this.register("POST", path, middleware);
  }
  /**
   * 注册 DELETE请求路由
   * 
   * @param {string} path 路由规则
   * @param {Middleware} middleware 路由中间件方法
   * 
   * @memberOf Router
   */
  delete(path: string, middleware: Middleware) {
    this.register("DELETE", path, middleware);
  }
  /**
   * 注册 PUT请求路由
   * 
   * @param {string} path 路由规则
   * @param {Middleware} middleware 路由中间件方法
   * 
   * @memberOf Router
   */
  put(path: string, middleware: Middleware) {
    this.register("PUT", path, middleware);
  }
  /**
   * 注册 PATCH请求路由
   * 
   * @param {string} path 路由规则
   * @param {Middleware} middleware 路由中间件方法
   * 
   * @memberOf Router
   */
  patch(path: string, middleware: Middleware) {
    this.register("PATCH", path, middleware);
  }
  routes(): Middleware {
    const stack = this._stack;
    return async function(req, next) {
      const currentPath = req.url;
      // for (var i = 0; i < req.headers.keys().length; i++) {
      //   console.log(req.headers.get(req.headers.keys()[i]));
      // }
      // for (const key of req.headers.keys()) {
      //   console.log(222, `${key}=${req.headers.get(key)}`);
      // }
      const method = req.method;

      let route;
      for (let i = 0; i < stack.length; i++) {
        const item: Layer = stack[i];
        const path = currentPath.split('?')[0];

        if (item.pathRegExp.test(path) && item.method.indexOf(method) >= 0) {
          route = item.middleware;
          const pathParams = item.getParams(path);
          console.log('页面链接:', currentPath);
          console.log('链接中的参数:', pathParams);
          console.log('get请求中的参数:', item.getQueryString(currentPath));
          break;
        }
      }

      if (typeof route === 'function') {
        await route(req, next);
      } else {
        next();
      }
    }
  }
}
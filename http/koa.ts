import { serve, Server, ServerRequest } from "https://deno.land/std@0.82.0/http/server.ts";
import { BufReader, BufWriter } from "https://deno.land/std@0.82.0/io/bufio.ts";
import { Deferred, deferred } from "https://deno.land/std@0.82.0/async/mod.ts";
import { compose } from './compose.ts';
export type Middleware = (request: ServerRequest, next: () => Promise<void>) => Promise<void> | void;

// export type Context = {
//   request: Request;
// }

/**
 * HTTP请求的Request
 * 
 * @export
 * @class SafeRequest
 * @extends {ServerRequest}
 */
export class SafeRequest extends ServerRequest {
  // url!: string;
  // method!: string;
  // proto!: string;
  // protoMinor!: number;
  // protoMajor!: number;
  // headers!: Headers;
  // conn!: Deno.Conn;
  // r!: BufReader;
  // w!: BufWriter;
  // done: Deferred<Error | undefined> = deferred();

  queryString!: { [key: string]: string};
  path!: string;
  private _request: ServerRequest;
  constructor(request: ServerRequest) {
    super();

    this._request = request;
    this.url = request.url;
    this.method = request.url;
    this.proto = request.proto;
    this.protoMinor = request.protoMinor;
    this.protoMajor = request.protoMajor;
    this.headers = request.headers;
    this.conn = request.conn;
    this.r = request.r;
    this.w = request.w;
    this.done = request.done;

    // this.queryString = {};
    // this.path = '';

    // this.initPath();
  }
  /**
   * 设置路径
   */
  private initPath() {
    const url = this.url;
    this.path = url.split("?")[0];
  }
}

/**
 * HTTP请求的Response
 * 
 * @class SafeResponse
 */
class SafeResponse {
  private _request: ServerRequest;
  constructor(request: ServerRequest) {
    this._request = request;
  }
}


export class Application {
  private _middlewares: Middleware[];
  private _server: Server | undefined;

  constructor() {
    this._middlewares = [];
  }

  public use(fn: Middleware): void {
    this._middlewares.push(fn);
    // this._server = null;
  }

  public async listen(opts: Deno.ListenOptions, fn: () => void) {
    // const that = this;
    // const server = this._server;
    const middlewares = this._middlewares;

    const server = serve(opts);
    this._server = server;

    fn();

    for await (const request of server) {
      try {
        // TODO 替换request
        // const safeRequest = new SafeRequest(request);
        // const safeResponse = new SafeResponse(request);
        // await compose(middlewares)(safeRequest);


        await compose(middlewares)(request);
        const method = request.method;
        const headers = request.url;

        // if (!(body && typeof body === "string" && body.length > 0)) {
        //   request.respond({
        //     status: 404,
        //     body: "404 Not Found!"
        //   })
        // }
        // console.log(444, request.);
        // if (!request.done) {
        //   request.respond({
        //     status: 404,
        //     body: "404 Not Found!"
        //   });
        // }
      } catch (err) {
        this._onError(err, request);
      }
    }
  }

  private async _onError(err: Error, req: ServerRequest) {
    req.respond({
      status: 500,
      body: err.stack || 'Server Error'
    });
  }
}

// const server = serve({
//   hostname: '0.0.0.0',
//   port: 8080
// });

// for await (const request of server) {
//   let bodyContent = "ur user-agent is:\n\n";
//   bodyContent += request.headers.get("user-agent") || "Unknown";

//   request.respond({
//     status: 200,
//     body: bodyContent
//   });
// }
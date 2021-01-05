import { ServerRequest } from "https://deno.land/std@0.82.0/http/server.ts";


export class Request {
  private headers: object;
  private body: string;
  private path: string;
  private params: { [key: string]: string };


  constructor(serverRequest: ServerRequest) {
    this.headers = {};
    this.body = "";
  }

  getHeaders() {

  }

  getBody() {

  }
}

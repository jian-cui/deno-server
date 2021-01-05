import { ServerRequest } from "https://deno.land/std@0.82.0/http/server.ts";
import { Middleware } from './koa.ts';

type Next = () => void;

export function compose(middleware: Middleware[]) {
  if (!Array.isArray(middleware)) {
    throw new TypeError("Middleware stack must be an array!");
  }

  return function(request: ServerRequest, next?: Next) {
    let index = -1;

    return dispatch(0);

    function dispatch(i: number): Promise<void> {
      if (i < index) {
        return Promise.reject(new Error('next() called multiple times'));
      }
      index = i;

      let fn: Middleware | undefined = middleware[i];

      if (i === middleware.length) {
        fn = next;
      }

      if (!fn) {
        return Promise.resolve();
      }

      try {
        return Promise.resolve(fn(request, () => {
          return dispatch(i + 1);
        }));
      } catch (err) {
        return Promise.reject(err);
      }
    }
  }
}
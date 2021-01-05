#!/usr/bin/env run deno --allow-run --allow-net

import { assertEquals } from "https://deno.land/std@0.82.0/testing/asserts.ts";
import { RouteLayer } from "./router.ts";

async function testRouterLayer() {

}


Deno.test("testRouterLayer", function() {
  try {
    const routerLayer = new RouteLayer("GET", "/page/:pid/user/:uid", function(request, next) {
      next();
    });

    const info = routerLayer.getParams("/page/101/user/cuijian");

    assertEquals(info, {
      pid: "101",
      uid: "cuijian"
    })
  } catch (err) {
    console.log(err);
  }
})
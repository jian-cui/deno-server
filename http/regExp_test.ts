import { assertEquals } from "https://deno.land/std@0.82.0/testing/asserts.ts";

function getQueryString(url: string) {
  const queryStringRegExp = /([^=\/&]+=[^=\/&]+)/ig;

  return url.match(queryStringRegExp) || [];
}

Deno.test("getQueryStringTest", function() {
  try {
    const qs = 'a=1&b=2';
    const qs2 = 'a_c=1&test=2';
    const qs3 = 'a_c=1&&test=2';
    assertEquals(getQueryString(qs), [
      "a=1",
      "b=2"
    ]);

    assertEquals(getQueryString(qs2), [
      "a_c=1",
      "test=2"
    ]);

    assertEquals(getQueryString(qs3), [
      "a_c=1",
      "test=2"
    ]);
  } catch (err) {
    console.log(err);
  }
});



Deno.test("getQueryStringTest2", function() {
  try {
    const qs2 = 'a_c=1&test=2';

    assertEquals(getQueryString(qs2), [
      "a_c=1",
      "test=2"
    ]);
  } catch (err) {
    console.log(err);
  }
});

Deno.test("getQueryStringTest3", function() {
  try {
    const qs3 = 'a_c=1&&test=2';

    assertEquals(getQueryString(qs3), [
      "a_c=1",
      "test=2"
    ]);
  } catch (err) {
    console.log(err);
  }
});


Deno.test("getQueryStringTest4", function() {
  try {
    const qs3 = 'aaaa';

    assertEquals(getQueryString(qs3), [

    ]);
  } catch (err) {
    console.log(err);
  }
});
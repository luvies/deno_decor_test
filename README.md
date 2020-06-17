# Deno Decorator Test Framework

This module allows tests to be defined using a class instead of a pure function call. This allows tests to be written together logically, and allows some extra features, such as setup and teardown.

An example test suite could look like the following:

```ts
@TestSuite()
class ExampleTest {
  token!: string;

  async suiteSetup() {
    this.token = await getToken();
  }

  async suiteTeardown() {
    await revokeToken(this.token);
  }

  @Test()
  syncTest() {
    const data = getData(this.token);
    assertEquals(data, getExpected());
  }

  @Test()
  async asyncTest() {
    const data = await getDataAsync(this.token);
    assertEquals(data, await getExpectedAsync());
  }
}
```

## API

See the [API docs](https://doc.deno.land/https/raw.githubusercontent.com/luvies/deno_decor_test/master/mod.ts) for a complete overview of what's available.

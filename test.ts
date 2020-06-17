import { assertEquals } from "https://deno.land/std@0.57.0/testing/asserts.ts";
import { Ignore, ISuite, Test, TestSuite } from "./mod.ts";

let ranTests = 0;

@TestSuite()
export class Suite implements ISuite {
  setups!: number;
  teardowns!: number;

  suiteSetup() {
    console.log("setup");
    this.setups = 0;
    this.teardowns = 0;
  }

  testSetup() {
    this.setups++;
  }

  testTearDown() {
    this.teardowns++;
  }

  async suiteTearDown() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log(
      "teardown",
      `setups: ${this.setups}, teardowns: ${this.teardowns}`,
    );
  }

  @Test()
  basicTest() {
    ranTests++;
  }

  @Test()
  async asyncTest() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    ranTests++;
  }

  @Test("Test description")
  testWithDesc() {
    ranTests++;
  }
}

@TestSuite("custom name")
export class NamedSuite {
  @Test()
  simpleTest() {
    assertEquals(1, 1);
  }

  @Test()
  ["Complex test name"]() {
    assertEquals(2, 2);
  }

  @Test()
  @Ignore()
  failingTest() {
    assertEquals(1, 2);
  }
}

Deno.test({
  name: "All tests ran",
  fn() {
    assertEquals(ranTests, 3);
  },
});

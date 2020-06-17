import { getSuiteTestConfig, getSuiteTests } from "./meta.ts";

/**
 * The available methods that each suite can define for managing tests.
 */
export interface ISuite {
  /**
   * Provides setup logic for the entire test suite.
   * 
   * This is ran before any test in the suite.
   */
  suiteSetup?(): Promise<void> | void;
  /**
   * Provides teardown logic for the entire test suite.
   * 
   * This is ran after all tests in the suite have been run.
   */
  suiteTeardown?(): Promise<void> | void;
  /**
   * Provides setup logic for each test.
   * 
   * This is run before every test, but after `suiteSetup()`.
   */
  testSetup?(): Promise<void> | void;
  /**
   * Provides teardown logic for each test.
   * 
   * This is run after every test, but before `suiteTeardown()`.
   */
  testTeardown?(): Promise<void> | void;
}

/**
 * Defines a method as a test.
 * 
 * @param desc Sets the test name. If not given, the method name is used.
 */
export function Test(desc?: string) {
  return <TSuite extends object>(target: TSuite, propKey: string | symbol) => {
    const config = getSuiteTestConfig(target, propKey);

    config.desc = desc;
  };
}

/**
 * Sets the `ignore` option of `Deno.TestDefinition`.
 */
export function Ignore() {
  return <TSuite extends object>(target: TSuite, propKey: string | symbol) => {
    const config = getSuiteTestConfig(target, propKey);

    config.ignore = true;
  };
}

/**
 * Sets the `only` option of `Deno.TestDefinition`.
 */
export function Only() {
  return <TSuite extends object>(target: TSuite, propKey: string | symbol) => {
    const config = getSuiteTestConfig(target, propKey);

    config.only = true;
  };
}

/**
 * Defines the class as a test suite.
 * 
 * @param name Sets the prefix for each test name defined in the suite.
 * If not given, this will default to `[ClassName]`.
 * @remarks This will cause the class to be constructed and all defined tests
 * to be added to the run.
 */
export function TestSuite(name?: string) {
  return <TSuite extends object>(Suite: new () => TSuite) => {
    const displayName = name ?? `[${Suite.name}]`;
    const suite: TSuite & ISuite = new Suite();
    const suiteTests = getSuiteTests(suite);

    if (!suiteTests) {
      return;
    }

    let setups = 0;

    const setup = async () => {
      if (setups === 0) {
        await suite.suiteSetup?.();
      }
      setups++;

      await suite.testSetup?.();
    };

    const teardown = async () => {
      await suite.testTeardown?.();

      if (setups === suiteTests.size) {
        await suite.suiteTeardown?.();
      }
    };

    for (const [method, { desc, ...conf }] of suiteTests.entries()) {
      Deno.test({
        name: `${displayName} ${desc ?? method}`,
        async fn() {
          await setup();
          await (suite[method] as any)();
          await teardown();
        },
        ...conf,
      });
    }
  };
}

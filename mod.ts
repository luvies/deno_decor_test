import { getSuiteTestConfig, getSuiteTests } from "./meta.ts";

export interface ISuite {
  suiteSetup?(): Promise<void> | void;
  suiteTeardown?(): Promise<void> | void;
  testSetup?(): Promise<void> | void;
  testTeardown?(): Promise<void> | void;
}

export function Test(desc?: string) {
  return <TSuite extends object>(target: TSuite, propKey: string | symbol) => {
    const config = getSuiteTestConfig(target, propKey);

    config.desc = desc;
  };
}

export function Ignore() {
  return <TSuite extends object>(target: TSuite, propKey: string | symbol) => {
    const config = getSuiteTestConfig(target, propKey);

    config.ignore = true;
  };
}

export function Only() {
  return <TSuite extends object>(target: TSuite, propKey: string | symbol) => {
    const config = getSuiteTestConfig(target, propKey);

    config.only = true;
  };
}

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

export interface SuiteTestConfig {
  desc?: string;
  ignore?: boolean;
  only?: boolean;
}

export type SuiteTests<T> = Map<keyof T, SuiteTestConfig>;

const suiteTestsSym = Symbol("SuiteTests");

function setSuiteTests<T extends object>(
  target: T,
  suites: SuiteTests<T>,
): void {
  Reflect.set(target.constructor, suiteTestsSym, suites);
}

export function getSuiteTests<T extends object>(
  target: T,
): SuiteTests<T> | undefined {
  return Reflect.get(target.constructor, suiteTestsSym);
}

function getSuiteTestsOrDefault<T extends object>(target: T): SuiteTests<T> {
  let suiteTests: SuiteTests<T> | undefined = getSuiteTests(target);

  if (!suiteTests) {
    suiteTests = new Map();
    setSuiteTests(target, suiteTests);
  }

  return suiteTests;
}

export function getSuiteTestConfig<TSuite extends object>(
  target: TSuite,
  propKey: string | symbol,
): SuiteTestConfig {
  const suiteTests = getSuiteTestsOrDefault(target);
  let config = suiteTests.get(propKey as keyof TSuite);

  if (!config) {
    config = {};
    suiteTests.set(propKey as keyof TSuite, config);
  }

  return config;
}

import { afterEach, beforeEach, expect, vi } from 'vitest';
import { fs, vol } from 'memfs';
import { loadConfig } from './config.js';
import path from 'path';
import jsyaml from 'js-yaml';

vi.mock('node:fs', async () => {
  const { fs } = await import('memfs');
  return { default: fs, ...fs };
});
vi.mock('node:fs/promises', async () => {
  const { fs } = await import('memfs');
  return { default: fs.promises, ...fs.promises };
});

const customEnv = 'my-env';

const testConfigPaths = {
  DEFAULT_CONFIG_PATH: '/settings/defaultConfig.yaml',
  CONFIG_PATH: '/config/config.yaml',
  ENV_CONFIG_PATH: path.join('/environments', customEnv, '/config.yaml'),
};

beforeEach(() => {
  // DefaultConfig is required to exist
  createConfig(testConfigPaths.DEFAULT_CONFIG_PATH, {
    STH_ELSE: { value: 'some-value' },
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
  // reset the state of in-memory fs
  vol.reset();
});

function createConfig(configPath, features) {
  const data = {
    config: {
      features: features,
    },
  };
  vol.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, jsyaml.dump(data));
}

describe('Check each config separately', () => {
  it('should return defaultConfig value', () => {
    // GIVEN
    const expectedValue = 'just-default-config';
    createConfig(testConfigPaths.DEFAULT_CONFIG_PATH, {
      FEATURE_A: {
        value: expectedValue,
      },
    });

    //WHEN
    const config = loadConfig('/');

    //THEN
    expect(config?.features?.FEATURE_A?.value).toBe(expectedValue);
  });
  it('should return config value', () => {
    // GIVEN
    const expectedValue = 'just-config';
    createConfig(testConfigPaths.CONFIG_PATH, {
      FEATURE_A: {
        value: expectedValue,
      },
    });

    //WHEN
    const config = loadConfig('/');

    //THEN
    expect(config?.features?.FEATURE_A?.value).toBe(expectedValue);
  });
  it('should return env config value', () => {
    // GIVEN
    const expectedValue = 'MY_CUSTOM_ENV';
    vi.stubEnv('ENVIRONMENT', customEnv);
    createConfig(testConfigPaths.ENV_CONFIG_PATH, {
      FEATURE_A: { value: expectedValue },
    });

    //WHEN
    const config = loadConfig('/');

    //THEN
    expect(config?.features?.FEATURE_A?.value).toBe(expectedValue);
  });
});

describe('Check how configs are merged', () => {
  it('merge configs with different features', () => {
    // GIVEN
    const expectedDefaultValue = 'DEFAULT';
    createConfig(testConfigPaths.DEFAULT_CONFIG_PATH, {
      FEATURE_A: { value: expectedDefaultValue },
    });

    const expectedConfigValue = 'JUST_CONFIG';
    createConfig(testConfigPaths.CONFIG_PATH, {
      FEATURE_B: { value: expectedConfigValue },
    });

    vi.stubEnv('ENVIRONMENT', 'my-env');
    const expectedEnvConfigValue = 'MY_CUSTOM_ENV';
    createConfig(testConfigPaths.ENV_CONFIG_PATH, {
      FEATURE_C: {
        value: expectedEnvConfigValue,
      },
    });

    //WHEN
    const config = loadConfig('/');

    //THEN
    expect(config?.features?.FEATURE_A?.value).toBe(expectedDefaultValue);
    expect(config?.features?.FEATURE_B?.value).toBe(expectedConfigValue);
    expect(config?.features?.FEATURE_C?.value).toBe(expectedEnvConfigValue);
  });

  it('merge configs with the same feature', () => {
    // GIVEN
    const expectedDefaultValue = 'DEFAULT';
    const expectedConfigValue = 'JUST_CONFIG';
    const expectedEnvConfigValue = 'MY_CUSTOM_ENV';
    createConfig(testConfigPaths.DEFAULT_CONFIG_PATH, {
      FEATURE_A: { value: expectedDefaultValue },
    });
    createConfig(testConfigPaths.CONFIG_PATH, {
      FEATURE_A: { value: expectedConfigValue },
    });
    vi.stubEnv('ENVIRONMENT', 'my-env');
    createConfig(testConfigPaths.ENV_CONFIG_PATH, {
      FEATURE_A: { value: expectedEnvConfigValue },
    });

    //WHEN
    const config = loadConfig('/');

    //THEN
    expect(config?.features?.FEATURE_A?.value).toBe(expectedEnvConfigValue);
  });

  it('merge configs with the same and unique feature', () => {
    // GIVEN
    const expectedDefaultValue = 'DEFAULT';
    const expectedMergedEnvValue = 'merged-env-value';
    createConfig(testConfigPaths.DEFAULT_CONFIG_PATH, {
      FEATURE_A: { value: expectedDefaultValue },
      COMMON_FEATURE: {
        value: 'default-config',
      },
    });

    const expectedConfigValue = 'JUST_CONFIG';
    createConfig(testConfigPaths.CONFIG_PATH, {
      FEATURE_B: { value: expectedConfigValue },
      COMMON_FEATURE: {
        value: 'merged-config',
      },
    });

    vi.stubEnv('ENVIRONMENT', 'my-env');
    const expectedEnvConfigValue = 'MY_CUSTOM_ENV';
    createConfig(testConfigPaths.ENV_CONFIG_PATH, {
      FEATURE_C: {
        value: expectedEnvConfigValue,
      },
      COMMON_FEATURE: {
        value: expectedMergedEnvValue,
      },
    });

    //WHEN
    const config = loadConfig('/');

    //THEN
    expect(config?.features?.FEATURE_A?.value).toBe(expectedDefaultValue);
    expect(config?.features?.FEATURE_B?.value).toBe(expectedConfigValue);
    expect(config?.features?.FEATURE_C?.value).toBe(expectedEnvConfigValue);
    expect(config?.features?.COMMON_FEATURE?.value).toBe(
      expectedMergedEnvValue,
    );
  });
});

describe('Check error handling', () => {
  it('default config is not available', () => {
    //GIVEN
    vol.rmSync(testConfigPaths.DEFAULT_CONFIG_PATH);
    vol.rmdirSync(path.dirname(testConfigPaths.DEFAULT_CONFIG_PATH));

    //WHEN
    const config = loadConfig('/');

    //THEN
    expect(config).toStrictEqual({});
  });

  it('env is set but the env config doesnt exist, the default config is returned', () => {
    //GIVEN
    vi.stubEnv('ENVIRONMENT', 'not-existing');

    //WHEN
    const config = loadConfig('/');

    //THEN
    expect(config?.features?.STH_ELSE?.value).toStrictEqual('some-value');
  });
});

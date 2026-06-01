import { beforeEach, expect, vi } from 'vitest';
import { fs, vol } from 'memfs';
import loadConfig from './config.js';
import path from 'path';

// tell vitest to use fs mock from __mocks__ folder
// this can be done in a setup file if fs should always be mocked
vi.mock('node:fs', async () => {
  const { fs } = await import('memfs');
  return { default: fs, ...fs };
});
vi.mock('node:fs/promises', async () => {
  const { fs } = await import('memfs');
  return { default: fs.promises, ...fs.promises };
});

beforeEach(() => {
  // reset the state of in-memory fs
  vol.reset();
});

afterEach(() => {
  console.log(vol.toTree());
});

function writeSampleConfig(configPath, key, value) {
  const feature = {
    value: value,
  };
  const data = {
    config: {
      features: {},
    },
  };
  data.config.features[key] = feature;
  vol.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify(data));
}

const customEnv = 'my-env';

const configPaths = {
  DEFAULT_CONFIG_PATH: '/settings/defaultConfig.yaml',
  CONFIG_PATH: '/config/config.yaml',
  ENV_CONFIG_PATH: path.join('/environments', customEnv, '/config.yaml'),
};

describe('Given one config file value is correct', () => {
  it('should return defaultConfig Value', () => {
    // GIVEN
    const expectedValue = 'just-default-config';
    writeSampleConfig(
      configPaths.DEFAULT_CONFIG_PATH,
      'FEATURE_A',
      expectedValue,
    );
    //WHEN

    const config = loadConfig('/');
    console.log(config);
    //THEN
    expect(config?.FEATURE_A?.value).toBe(expectedValue);
  });
  it('should return config Value', () => {
    // GIVEN
    const expectedValue = 'just-config';
    writeSampleConfig(configPaths.CONFIG_PATH, 'FEATURE_A', expectedValue);
    //WHEN

    const config = loadConfig('/');
    console.log(config);
    //THEN
    expect(config?.FEATURE_A?.value).toBe(expectedValue);
  });
  it('should return env config Value', () => {
    // GIVEN
    const expectedValue = 'MY_CUSTOM_ENV';
    vi.stubEnv('ENVIRONMENT', 'my-env');
    writeSampleConfig(configPaths.ENV_CONFIG_PATH, 'FEATURE_A', expectedValue);
    //WHEN

    const config = loadConfig('/');
    console.log(config);
    //THEN
    expect(config?.FEATURE_A?.value).toBe(expectedValue);
  });
});

describe('Given all config files, all are merged', () => {
  it('', () => {
    // GIVEN
    const expectedDefaultValue = 'DEFAULT';
    const expectedConfigValue = 'JUST_CONFIG';
    const expectedEnvConfigValue = 'MY_CUSTOM_ENV';
    writeSampleConfig(
      configPaths.DEFAULT_CONFIG_PATH,
      'FEATURE_A',
      expectedDefaultValue,
    );
    writeSampleConfig(
      configPaths.CONFIG_PATH,
      'FEATURE_B',
      expectedConfigValue,
    );
    vi.stubEnv('ENVIRONMENT', 'my-env');
    writeSampleConfig(
      configPaths.ENV_CONFIG_PATH,
      'FEATURE_C',
      expectedEnvConfigValue,
    );

    //WHEN
    const config = loadConfig('/');
    console.log(config);
    //THEN
    expect(config?.features?.FEATURE_A?.value).toBe(expectedDefaultValue);
    expect(config?.features?.FEATURE_B?.value).toBe(expectedConfigValue);
    expect(config?.features?.FEATURE_C?.value).toBe(expectedEnvConfigValue);
  });
});

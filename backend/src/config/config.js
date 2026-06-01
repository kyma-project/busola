import fs from 'node:fs';
import jsyaml from 'js-yaml';
import merge from 'lodash.merge';
import path from 'path';
import isEmpty from 'lodash.isempty';

const configPaths = {
  DEFAULT_CONFIG_PATH: './settings/defaultConfig.yaml',
  CONFIG_PATH: './config/config.yaml',
};

function getEnvDir() {
  const environment = process.env.ENVIRONMENT;

  if (environment) {
    return path.join('environments', environment);
  }
  return '';
}

function getEnvConfig(basePath) {
  const envConfigDir = getEnvDir();

  let configYaml = {};

  if (envConfigDir) {
    configYaml = jsyaml.load(
      fs.readFileSync(path.join(basePath, envConfigDir, '/config.yaml')),
    );
  }

  return configYaml || {};
}

function getConfig(basePath) {
  let config = {};
  const configPath = path.join(basePath, configPaths.CONFIG_PATH);
  if (fs.existsSync(configPath)) {
    config = jsyaml.load(fs.readFileSync(configPath));
  }

  return config || {};
}

function getDefaultConfig(basePath) {
  return jsyaml.load(
    fs.readFileSync(path.join(basePath, configPaths.DEFAULT_CONFIG_PATH)),
  );
}

function loadConfig(basePath) {
  let mergedConfig = {};

  try {
    const defaultConfig = getDefaultConfig(basePath);

    mergedConfig = defaultConfig;
    const config = getConfig(basePath);
    if (!isEmpty(config)) {
      merge(mergedConfig, config);
    }
    const envConfig = getEnvConfig(basePath);

    if (!isEmpty(envConfig)) {
      merge(mergedConfig, envConfig);
    }
  } catch (e) {
    console.warn('Error loading config:', e);
  }

  return mergedConfig.config;
}

export default loadConfig;

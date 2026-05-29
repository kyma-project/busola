import fs from 'node:fs';
import jsyaml from 'js-yaml';
import merge from 'lodash.merge';
import path from 'path';
import isEmpty from 'lodash.isempty';

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
  const configPath = path.join(basePath, './config/config.yaml');
  if (fs.existsSync(configPath)) {
    config = jsyaml.load(fs.readFileSync(configPath));
  }

  return config || {};
}

function loadConfig(basePath) {
  let mergedConfig = {};

  try {
    const defaultConfig = jsyaml.load(
      fs.readFileSync(path.join(basePath, './settings/defaultConfig.yaml')),
    );

    mergedConfig = defaultConfig.config;

    const config = getConfig(basePath);
    if (!isEmpty(config)) {
      mergedConfig = merge(mergedConfig, config).config;
    }

    const envConfig = getEnvConfig(basePath);
    if (!isEmpty(envConfig)) {
      mergedConfig = merge(mergedConfig, envConfig).config;
    }
  } catch (e) {
    console.warn('Error loading config:', e);
  }

  return mergedConfig;
}

export default loadConfig;

/* global module, require, process */
const fs = require('fs');
const jsyaml = require('js-yaml');
const merge = require('lodash.merge');
const path = require('path');
var isEmpty = require('lodash.isempty');

function getConfigDir() {
  const environment = process.env.ENVIRONMENT;
  if (environment) {
    return path.join('environments', environment);
  }
  return '';
}

function getEnvConfig() {
  const envConfigDir = getConfigDir();
  let configYaml = {};

  if (envConfigDir) {
    configYaml = jsyaml.load(
      fs.readFileSync(path.join(envConfigDir, '/config.yaml')),
    );
  }

  return configYaml || {};
}

function getConfig() {
  let config = {};
  if (fs.existsSync('./config/config.yaml')) {
    config = jsyaml.load(fs.readFileSync('./config/config.yaml'));
  }

  return config || {};
}

function loadConfig() {
  let mergedConfig = {};

  try {
    const defaultConfig = jsyaml.load(
      fs.readFileSync('./settings/defaultConfig.yaml'),
    );

    mergedConfig = defaultConfig.config;

    const envConfig = getEnvConfig();
    if (!isEmpty(envConfig))
      mergedConfig = merge(mergedConfig, envConfig).config;

    const config = getConfig();
    if (!isEmpty(config)) mergedConfig = merge(mergedConfig, config).config;
  } catch (e) {
    console.warn('Error loading config:', e?.message || e);
  }

  return mergedConfig;
}

module.exports = loadConfig();

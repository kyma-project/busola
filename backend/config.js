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
  console.log(path.join('./', envConfigDir, '/config.yaml'));
  if (envConfigDir) {
    configYaml = jsyaml.load(
      fs.readFileSync(path.join(envConfigDir, '/config.yaml')),
    );
  }

  return configYaml || {};
}

function getConfigFromMap() {
  let configFromMap = {};
  if (fs.existsSync('./config/config.yaml')) {
    configFromMap = jsyaml.load(fs.readFileSync('./config/config.yaml'));
  }

  return configFromMap || {};
}

function loadConfig() {
  let config = {};

  try {
    const defaultConfig = jsyaml.load(
      fs.readFileSync('./settings/defaultConfig.yaml'),
    );

    config = defaultConfig.config;

    const envConfig = getEnvConfig();
    if (!isEmpty(envConfig)) config = merge(config, envConfig).config;

    const configFromMap = getConfigFromMap();
    if (!isEmpty(configFromMap)) config = merge(config, configFromMap).config;
  } catch (e) {
    console.warn('Error loading config:', e?.message || e);
  }

  return config;
}

module.exports = loadConfig();

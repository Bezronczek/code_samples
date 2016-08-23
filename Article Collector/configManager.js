'use strict';

const fs = require('fs');
const outputFrame = require('./outputFrame.js')

function loadConfigMatrix () {
  try {
    return JSON.parse(fs.readFileSync('./config/config.json'));
  } catch (e) {
    outputFrame.send('There is a problem with configuration file.');
    outputFrame.send(e.toString());
  }
}

function saveConfigMatrix(config) {
  try {
    fs.writeFileSync('./config/config.json', JSON.stringify(config, null, '\t'));
  } catch (e) {
    console.log(e);
    outputFrame.send(e.toString());
  }
}

function domainConfigExists(domain) {
  if(domain === '') { return false; }
  const domainConfigs = loadConfigMatrix().configurations;
  return !!domainConfigs.hasOwnProperty(domain);
}

function loadConfig(domain) {
  if(domainConfigExists(domain)) {
    try {
      return JSON.parse(fs.readFileSync(`./config/${domain}.json`));
    } catch (e) {
      outputFrame.send('There is a problem with configuration file.\nPlease check your file');
      outputFrame.send(e.toString());
      return;
    }
  }
  return false;
}

function getConfigFromURL (url) {
  const domainRegex = /(?:http(?:s)?:\/\/)?([\w.]+)(?:.*)/;
  const match = domainRegex.exec(url);
  const domain = match !== null ? match[1] : '';

  return loadConfig(domain);
}

function getAppConfig() {
  const appConfig = loadConfigMatrix().appConfig;
  if(appConfig) {
    return appConfig;
  } else {
    throw new Error("Your config is invalid. Missing appConfig property");
  }
}

function saveFilePath(confPath, file) {
  let config = loadConfigMatrix();
  let newConfig = config.appConfig;
  switch(confPath) {
    case 'articles':
      newConfig.paths.articles.path = file.path;
      newConfig.paths.articles.filename = file.filename;
      break;
    case 'multimedia':
      newConfig.paths.multimedia.path = file.path;
      newConfig.paths.multimedia.filename = file.filename;
      break;
    case 'links':
      newConfig.paths.links.path = file.path;
      newConfig.paths.links.filename = file.filename;
      break;
  }
  config.appConfig = newConfig;
  saveConfigMatrix(config);

}

exports = module.exports = {
  "getConfigFromURL": getConfigFromURL,
  "getAppConfig": getAppConfig,
  "loadConfigMatrix": loadConfigMatrix,
  "saveFilePath": saveFilePath
};

'use strict';

const getConfigFromURL = require('./configManager.js');
const Zombie = require('zombie');
const cheerio = require('cheerio');
const fs = require('fs');
const outputFrame = require('./outputFrame.js');

function _loadPage(url, callback) {
  let html;
  Zombie.visit(url, function(error, browser) {
    if (error) {
      outputFrame.send("Error on remote server");
      outputFrame.send(error.toString());
    }
    html = browser.html();
    if (html !== 'undefined' && html !== 'null' && html !== '') {
      callback(html);
    } else {
      outputFrame.send("Error:\nCouldn't receive HTML from following url:\n" +
        url + "\nCheck url and try again");
    }
  });
}

function _getUrlList(html, config) {
  let arr = [];
  let $ = cheerio.load(html);
  $(config.crawler.match).each((i, elem) => {
    let link = $(elem).attr("href");
    arr.push(config.crawler.prefix + link);
  });
  return arr;
}

function _uniquesInArray(arr) {
  return [...new Set(arr)];
}

function _saveLinksList(arr, file) {
  let links;
  if (process.platform == 'win32') {
    links = arr.join("\r\n");
  } else {
    links = arr.join("\n");
  }
  fs.appendFile('./' + file, links, (error) => {
    if (error) {
      outputFrame.send("Error while writing file");
      outputFrame.send(error.toString());
    } else {
      outputFrame.clear();
      outputFrame.send("Successfully saved data to file: " + file);
      //arr.forEach(str => outputFrame.send(str));
      outputFrame.send(arr.join("<br />"));
    }
  });
}

function crawl(options, callback) {
  //FIXME Proper error catching
  const config = getConfigFromURL(options.url);

  if (config === false) {
    outputFrame.send(`No config found for: ${options.url}`);
    return;
  }

  // error handled by ConfigManaer.js
  if (!config) {
    return;
  }

  _loadPage(options.url, html => {
    let links = _getUrlList(html, getConfigFromURL(options.url));
    _saveLinksList(_uniquesInArray(links), options.filename);
    callback();
  });
}

exports = module.exports = crawl;

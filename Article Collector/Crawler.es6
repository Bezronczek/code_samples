import {getConfigFromURL} from './configManager';
import Zombie from 'zombie';
import cheerio from 'cheerio';
import fs from 'fs';
import outputFrame from './outputFrame';
import _ from 'underscore';

_loadPage = new Promise((resolve, reject) => {
  Zombie.visit(url, (error, browser) => {
    if(error) {
      outputFrame.send("Error on remote server");
      outputFrame.send(error.stack.toString() || error.toString());
      reject();
    }
    let html = browser.html();
    if(html !== undefined && html !== null && html !== '') {
      resolve(html);
    } else {
      outputFrame.send(`Error:\nCouldn't receive HTML from following url:\n${url}\nCHckec url and try again`);
      reject();
    }
  });
});

function _getUrlList(html, options, config) {
  let arr = [];
  let $ = cheerio.load(html);
  let filter = Array.isArray(options.keywords) ? options.keywords.join("|") : undefined;

  $(config.crawler.match).each((i, elem) => {
    if(filter) {
      if(!$(elem).text().toLowerCase().match(filter)) {
        let link = $(elem).attr("href");
        arr.push(config.crawler.prefix + link);
      }
    } else {
      let link = $(elem).attr("href");
      arr.push(config.crawler.prefix + link);
    }
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
  fs.appendFile(file, links, (error) => {
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

// callback needed for async queue module
export default async function crawl(options, callback) {
  try {
    const config = getConfigFromURL(options.url);

    if(config === false) {
      outputFrame.send(`No config found for: ${options.url}`);
      return;
    }

    if(!config) return;

    const html = await _loadPage(options.url);
    const links = _getUrlList(html, options, config);
    _saveLinksList(_uniquesInArray(links), options.filename);

  } catch (e) {
    console.error(e.stack || e);
  } finally {
    callback();
  }
}
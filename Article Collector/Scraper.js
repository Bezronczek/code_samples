// Author Artur Strzepka 2016
'use strict';

function Scraper() {

  const cheerio = require('cheerio');
  const fs = require('fs');
  const Zombie = require('zombie');
  const configManager = require('./ConfigManager.js');
  const outputFrame = require('./outputFrame.js');
  const mainWindow = global.mainWindow;

  // load page by url and pass final html to callback
  function _loadPage(url, callback, config) {
    let html;
    mainWindow.send('scraper-link-started', url);
    Zombie.visit(url, {waitDuration:'120s'}, function(error, browser) {
      if(error) {
        let knownErrors = config.knownErrors || [];
        if(knownErrors.indexOf(error.toString()) === -1) {
          outputFrame.send(`Error for <b>${browser.location.pathname}</b>: <br/ >  ${error.toString()}`);
        }
        //outputFrame.send(error.toString());
      }
      html = browser.html();
      if(html !== 'undefined' && html !== 'null' && html !== '') {
        callback(html);
      }
      else {
        outputFrame.send(`Error:\nCouldn't receive HTML from following url:\n ${url} \nCheck url and try again`);
      }
    });
  }

  function _detectVideo(html, config) {
    const domainRegex = /(?:http(?:s)?:\/\/)?([\w.]+)(?:.*)/;
    let multimedia;
    let $ = cheerio.load(html);
    let mainContent = config.mainContent || 'html';

    $(mainContent).find(config.removedList.join(',')).remove();

      $('[src]').each((i, elem) => {
        let src = $(elem).attr('src');
        let match = domainRegex.exec(src);
        let domain = match !== null ? match[1] : '';
        if(config.videos.indexOf(domain) > -1) {
          if(process.platform == 'win32'){
            multimedia.push(src + "\r\n");
          } else {
            multimedia.push(src + "\n");
          }
        }
      });

    return multimedia;
  }

  function _getText(html, config) {
    let content = '',
      $ = cheerio.load(html);

    let elementsToRemove = config.removedList.join(',');
    let mainContent = config.mainContainer || 'html';
    let elementsToInclude = config.toInclude || undefined;

    $(mainContent).find(elementsToRemove).remove();

    //FIXME add whitespace at the end of each element
    if(typeof elementsToInclude !== 'undefined') {
      content = $(mainContent).find(elementsToInclude.join(', ')).text().trim();
    } else {
      content = $(mainContent).text().trim();
    }

    content = content.replace(/\s\s+/g, ' ');
    content += '\n\n <następny artykuł> \n\n';

    return content;
  }

  function _saveToFile(data, articleFile, multimediaFile) {
    if(articleFile === '' && data.article !== null) {
      outputFrame.send('Could not save article. Please provide correct name');
      return false;
    }

    if(multimediaFile === '' && data.multimedia !== null) {
      outputFrame.send('Could not save multimedia links. Please provide correct name');
      return false;
    }

    let article = data.article;
    let multimedia = data.multimedia;

    fs.appendFile('./' + articleFile, article, (error) => {
      if(error) {
        outputFrame.send('An error occured while saving article to file.');
        outputFrame.send(error.toString());
        return false;
      }
      // outputFrame.send(`Article successfully written to ${articleFile}`);
    });

    if(typeof multimedia !== 'undefined') {
      fs.appendFile('./' + multimediaFile, multimedia, error => {
        if(error) {
          outputFrame.send('An error occured while saving multimedia list to file');
          outputFrame.send(error.toString());
          return false;
        }
        outputFrame.send(`Multimedia list successfully written to ${multimediaFile}`);
      });
    }

    return true;
  }

  return {
    scrapeToFile(url, articleFile, multimediaFile) {
      // outputFrame.clear();
      let config = configManager.getConfigFromURL(url);

      // false = no config found
      if(config === false) {
        outputFrame.send(`No config found for: ${url}`);
        return;
      }

      // error handled by ConfigManaer.js
      if(!config) {
        return;
      }

      let data = {};
      _loadPage(url, html => {
        data.article = _getText(html, config);
        data.multimedia = _detectVideo(html, config);
        _saveToFile(data, articleFile, multimediaFile);
        mainWindow.send('scraper-link-finished', url);
      }, config);
    }
  };
}

exports = module.exports = Scraper;

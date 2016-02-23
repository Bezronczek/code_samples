// Author Artur Strzepka 2016
/* globals require, process*/

'use strict';

// electron modules
const app = require('app');
const BrowserWindow = require('browser-window');
const ipc = require('ipc-main');
const Browser = require('zombie');
let screen = null; // assign value after app is ready

//require('crash-reporter').start();

let configurator = null;

// vars
let mainWindow = null;
let extractorWizardWindow = null;
let mainWindowContents = null;

// export some globals
global.mainWindow = mainWindowContents;

// app events
app.on('window-all-closed', function () {
  if(process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  screen = require('screen');
  // TODO perform check on tmp and config directories
  // if they don't exists, create both to avoid errors
  // this should be done by separate function, which should check this every time
  // user tries to write some data. The same should go for reading files.
  initFiles();
  createMainWindow();
});

////////////////////////////////////////////////
// IPC handlers
///////////////////////////////////////////////

// send back success info to renderer process
// TODO PLACEHOLDER
ipc.on('scraper_sendSuccess', event => {
  event.sender.send('scraper_success');
});

// send back error info to renderer process
// TODO PLACEHOLDER
ipc.on('scraper_sendError', event => {
  event.sender.send('scraper_error', "Jest chujowo");
});

ipc.on('scraper-extract-content', (event, url, file) => {

  if(url === '') {
    mainWindowContents.send('extractor_consoleWarn', "Please enter a valid URL");
    return;
  }
  let arr = url.split('\n');
  mainWindow.send('scraper-task-started', arr.length);
  arr.forEach(link => {
    let Scraper = require(__dirname + '/js/Scraper.js');
    new Scraper().scrapeToFile(link, file, 'multimedia.txt');
  });
});

ipc.on('crawler-start', (event, url, filename) => {
  require('./js/Crawler.js').crawl(url, filename);
});

////////////////////////////////////////
// main process functions
///////////////////////////////////////

function createMainWindow() {
  let screenW = screen.getPrimaryDisplay().workAreaSize.width;
  let width = screenW;
  if(screenW <= 1024) {
    width = 960;
  }
  let options = {
    height: screen.getPrimaryDisplay().workAreaSize.height * 0.8,
    width: width * 0.7,
    minWidth: 960,
    minHeight: 450,
    title: "Article Collector",
    autoHideMenuBar: true
  };

  mainWindow = new BrowserWindow(options);
  global.mainWindow = mainWindow;
  mainWindow.loadURL('file://' + __dirname + '/html/index.html');
  mainWindowContents = mainWindow.webContents;
//  mainWindowContents.openDevTools();

  mainWindow.on('closed', () => { mainWindow = null; mainWindowContents = null; });
}

function createExtractorWindow(path) {
  let options = {
    height: screen.getPrimaryDisplay().workAreaSize.height * 0.8,
    width: screen.getPrimaryDisplay().workAreaSize.width * 0.7,
    x: mainWindow.x - 10,
    y: mainWindow.y - 10,
    title: "Configuration Wizard",
    autoHideMenuBar: true,
    webPreferences: {
      webSecurity: false // hope this won't make things ugly
    }
  };

  extractorWizardWindow = new BrowserWindow(options);
  extractorWizardWindow.webContents.openDevTools();
  // extractorWizardWindow.loadURL('data:text/html,' + encodeURIComponent(html));
  extractorWizardWindow.loadURL(path);

  extractorWizardWindow.on('closed', () => {
    mainWindowContents.send('clear-error-frame');
    configurator.cleanup();
    mainWindowContents.send('reload-fields');
    extractorWizardWindow = null;
  });

}

function initFiles(){
  let fs = require('fs');
  fs.access('./config/config.json', fs.R_OK | fs.W_OK, err => {
    if(err) {
      fs.access('./config', fs.R_OK | fs.W_OK, err => {
        if(err) {
          fs.mkdir('./config');
          fs.writeFileSync('./config/config.json', JSON.stringify({}, null, '\t'));
        } else {
          fs.writeFileSync('./config/config.json', JSON.stringify({}, null, '\t'));
        }
      });
    }
  });
}

/* globals require, process*/

'use strict';

const {app, BrowserWindow, ipcMain} = require('electron');
let screen = null; // assign value after app is ready
const utils = require('./js/utils');
const configManager = require('./js/configManager');

let mainWindow = null;
let mainWindowContents = null;

// app events
app.on('window-all-closed', () => {
  if(process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  screen = require('screen');
  utils.initFiles(); // check for critical config files
  createMainWindow(); // create main window
  // check config file; do it AFTER main window load
  // otherwise app will crash (FIXME error checking in outputFrame)
  utils.updateConfigurationFile(configManager);
});
////////////////////////////////////
// IPC communication
///////////////////////////////////

ipcMain.on('config-changePath-articles', event => {
  const file = utils.getDestinationFile();
  if(file) {
    configManager.saveFilePath('articles', file);
    app.addRecentDocument(file.path + file.filename);
    event.sender.send('file-set-articles-path', file);
  }
});

ipcMain.on('config-changePath-multimedia', event => {
  const file = utils.getDestinationFile();
  if(file) {
    configManager.saveFilePath('multimedia', file);
    event.sender.send('file-set-multimedia-path', file);
  }
});

ipcMain.on('config-changePath-links', event => {
  const file = utils.getDestinationFile();
  if(file) {
    configManager.saveFilePath('links', file);
    event.sender.send('file-set-links-path', file);
  }
});

ipcMain.on('scraper-extract-content', getArticleFromURL);

ipcMain.on('crawler-start', getLinksFromURL);

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
  // mainWindow.setMenu(null);
  mainWindowContents = mainWindow.webContents;

  mainWindowContents.on('did-finish-load', () => {
    mainWindow.send('app-ready');
  });

 // mainWindowContents.openDevTools();
  mainWindow.on('closed', () => { mainWindow = null; mainWindowContents = null; });

}

function getArticleFromURL(event, url) {
  if(url === '') {
    mainWindowContents.send('output-frame-message', 'Please enter a valid URL');
    return;
  }

  // load scraper and get app config
  const scrapeToFile = require(__dirname + '/js/Scraper.js');
  const appConfig = configManager.getAppConfig();
  const articlesPath = appConfig.paths.articles;
  const multimediaPaths = appConfig.paths.multimedia;

  let file = null;
  let multimedia = null;

  if(articlesPath.path === '' || articlesPath.filename === '') {
    file = utils.getDestinationFile();
  } else {
    file = articlesPath;
  }

  if(multimediaPaths.path === '' || multimediaPaths.filename === '') {
    multimedia = utils.getDestinationFile();
  } else {
    multimedia = multimediaPaths;
  }

  const data = url.split('\n').map(url => utils.prepareScraperOptions(url, file, multimedia));

  mainWindow.send('file-set-articles-path', file);
  mainWindow.send('scraper-task-started', data.length);
  utils.runQueue(scrapeToFile, data);
}

function getLinksFromURL(event, options) {
  let {urls, keywords} = options;
  if(urls === '') {
    mainWindowContents.send('output-frame-message', "Please enter a valid URL");
    return;
  }
  const crawler = require(__dirname + '/js/Crawler.js');
  const appConfig = configManager.getAppConfig();
  const linksPath = appConfig.paths.links;

  let file = null;
  if(linksPath.path === '' || linksPath.filename === '') {
    file = utils.getDestinationFile();
  } else {
    file = linksPath;
  }
  let data = urls.split('\n').map(url => utils.prepareCrawlerOptions(url, keywords, file));

  utils.runQueue(crawler, data);
}

/* globals require, process*/

'use strict';

// electron modules
const {app, BrowserWindow, ipcMain} = require('electron');
let screen = null; // assign value after app is ready
// import helper functions
const {
  initFiles,
  runQueue,
  prepareScraperOptions,
  prepareCrawlerOptions,
  getDestinationFile,
  updateConfigurationFile
} = require('./js/utils');

// vars
let mainWindow = null;
let mainWindowContents = null;

// export some globals
global.mainWindow = mainWindowContents;

// app events
app.on('window-all-closed', () => {
  if(process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  screen = require('screen');
  initFiles(); // check for critical config files
  updateConfigurationFile();
  createMainWindow();
});

////////////////////////////////////////////////
// IPC handlers
///////////////////////////////////////////////

// run scraper on passed url array
ipcMain.on('scraper-extract-content', (event, url) => {

  if(url === '') {
    mainWindowContents.send('output-frame-message', "Please enter a valid URL");
    return;
  }
  const scrapeToFile = require(__dirname + '/js/Scraper.js');
  const file = getDestinationFile();
  const {filename} = file;
  mainWindow.send('file-set-articles-path', file);
  const data = url.split('\n').map(url => prepareScraperOptions(url, filename, 'multimedia.txt'));

  mainWindow.send('scraper-task-started', data.length);
  runQueue(scrapeToFile, data);
});

// run crawler on provided link
ipcMain.on('crawler-start', (event, urls, filename) => {
  if(urls === '') {
    mainWindowContents.send('output-frame-message', "Please enter a valid URL");
    return;
  }
  const crawler = require(__dirname + '/js/Crawler.js');
  const data = urls.split('\n').map(url => prepareCrawlerOptions(url, filename));

  runQueue(crawler, data);
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
    autoHideMenuBar: true,
    frame: false
  };

  mainWindow = new BrowserWindow(options);
  global.mainWindow = mainWindow;
  mainWindow.loadURL('file://' + __dirname + '/html/index.html');
  // mainWindow.setMenu(null);
  mainWindowContents = mainWindow.webContents;
//  mainWindowContents.openDevTools();
  mainWindow.on('closed', () => { mainWindow = null; mainWindowContents = null; });
}

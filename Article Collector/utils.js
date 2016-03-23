exports = module.exports = {
  // FIXME init files with template
  initFiles() {
    let fs = require('fs');
    fs.access('./config/config.json', fs.R_OK | fs.W_OK, err => {
      if (err) {
        fs.access('./config', fs.R_OK | fs.W_OK, err => {
          if (err) {
            fs.mkdir('./config');
            fs.writeFileSync('./config/config.json', JSON.stringify({}, null, '\t'));
          } else {
            fs.writeFileSync('./config/config.json', JSON.stringify({}, null, '\t'));
          }
        });
      }
    });
  },

  runQueue(fn, data) {
    const async = require('async');
    // max 10 threads at once
    const queue = async.queue(fn, 10);
    queue.push(data);
  },

  prepareScraperOptions(url, file, multimedia) {
    return {
      url: url,
      file: file,
      mm: multimedia
    };
  },

  prepareCrawlerOptions(url, file) {
    return {
      url: url,
      filename: file
    };
  },

  getDestinationFile() {
    const dialog = require('dialog');
    let path = dialog.showSaveDialog(global.mainWindow, {
      title: 'Choose destination file',
      filters: [{
        name: "Text Files",
        extensions: ['txt']
      }]
    }).split("\\");

    const filename = path.pop();
    const filepath = path.join("\\");

    return {
      filename: filename,
      path: filepath
    };

  },

  updateConfigurationFile() {
    const fs = require('fs');

    function checkConfigFile(configContent) {
      return typeof configContent === 'object' &&
        configContent.hasOwnProperty('configurations') &&
        configContent.hasOwnProperty('appConfig');
    }

    const configContent = JSON.parse(fs.readFileSync('./config/config.json'));
    if (!checkConfigFile(configContent)) {
      const newConfig = {
        "configurations": configContent,
        "appConfig": {}
      };
      fs.writeFileSync('./config/config.json', JSON.stringify(newConfig, null, '\t'));
    }
  }
};

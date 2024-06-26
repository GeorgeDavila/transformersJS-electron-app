const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { session } = require('electron');
const { run } = require('./model.js');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

// see https://www.electronjs.org/docs/latest/tutorial/context-isolation & https://www.electronjs.org/docs/latest/api/structures/web-preferences
windowOptions1 = {
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.resolve(path.join(__dirname, 'preload.js')) //You need to create a file named preload.js (or any name) in your code
    },
  }
  
  const createWindow = () => {
    // Create the browser window.
    // Electron default 
    //const mainWindow = new BrowserWindow({
    //  width: 800,
    //  height: 600,
    //  webPreferences: {
    //    preload: path.join(__dirname, 'preload.js'),
    //  },
    //});
  
    const mainWindow = new BrowserWindow(windowOptions1);
    mainWindow.setMenu(null) //remove toolbar per https://stackoverflow.com/questions/39091964/remove-menubar-from-electron-app
    mainWindow.maximize(); //make full size 
    mainWindow.show();
  
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
    // Open the DevTools.
    //mainWindow.webContents.openDevTools();
  };


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {

    // Add a handler for the `transformers:run` event. This enables 2-way communication
    // between the renderer process (UI) and the main process (processing).
    // https://www.electronjs.org/docs/latest/tutorial/ipc#pattern-2-renderer-to-main-two-way
    ipcMain.handle('transformers:run', run)

    createWindow();

    // Define a custom Content Security Policy to only allow loading resources from the app's origin.
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': ["default-src 'self'"]
            }
        })
    })
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

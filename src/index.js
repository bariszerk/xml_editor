const {app, BrowserWindow, ipcMain, dialog, Menu} = require('electron');
const path = require('path');
const {config, eventNames} = require('process');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1800,
        height: 1000,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });


    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Create an empty menu
    const menu = Menu.buildFromTemplate([]);
    Menu.setApplicationMenu(menu);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

};

ipcMain.on('save-file-dialog', (event, updatedXmlContent) => {
    const options = {
        title: 'Save XML File',
        filters: [{name: 'XML Files', extensions: ['xml']}],
    };

    dialog.showSaveDialog(options).then(result => {
        if (!result.canceled && result.filePath) {
            const filePath = result.filePath;
            event.reply('selected-saveFile', filePath, updatedXmlContent);
        }
    });
});


ipcMain.on('open-file-dialog', (event) => {
    dialog.showOpenDialog({
        properties: ['openFile']
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            event.reply('selected-file', result.filePaths[0]);
        }
    }).catch(err => {
        console.error(err);
    });
});

// main.js

ipcMain.on('select-path-dialog', (event, key) => {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            event.reply('selected-path', result.filePaths[0], key);
        }
    }).catch(err => {
        console.error(err);
    });
});

/*ipcMain.on('open-default-file-dialog', (event) => {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            event.reply('selected-default-file', result.filePaths[0]);
        }
    }).catch(err => {
        console.error(err);
    });
});*/


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

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

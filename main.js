/* 
импортируем 
app, which controls your application's event lifecycle.
BrowserWindow, which creates and manages app windows.
*/
const { app, BrowserWindow, ipcMain, } = require("electron");
const path = require("node:path");

const electronPath = path.join(
  __dirname,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'electron.cmd' : 'electron'
);
require('electron-reload')([
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'preload.js'),
  path.join(__dirname, 'main.js'),
], {
  electron: electronPath,          // строка — путь к exe/.cmd
  hardResetMethod: 'exit',         // правильное имя опции
});
/**
 * Creates a new browser window with specified dimensions and loads the 'index.html' file.
 */

const createWindow = () => {
  // создание окна браузера
  const win = new BrowserWindow({ 
    width: 800,
    height: 600,
    webPreferences: {
      // dirname путь до текущего скрипта, path.join позволяет определять пути до скриптов для разных платформ
      preload: path.join(__dirname, "preload.js"), // загружаем дозагрузочный скрипт
    }
  });

  // загружаем контент для окна из index.html
  win.loadFile("./index.html");
}

// когда приложение будет готово к запуску создаем окно с помощью createWindow()
app.whenReady().then(() => {
  ipcMain.handle("ping", () => "pong");
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  })
});

// когда все окна закрываются - прекращаем работу приложения 
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
})
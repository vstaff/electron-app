/* 
импортируем 
app, which controls your application's event lifecycle.
BrowserWindow, which creates and manages app windows.
*/
const { app, BrowserWindow, ipcMain, } = require("electron");
const path = require("node:path");

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
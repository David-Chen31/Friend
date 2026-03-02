const { app, BrowserWindow, ipcMain, screen, Tray, Menu } = require('electron');

const dragSessions = new WeakMap();
let tray = null;

function createFriendWindow() {
  const win = new BrowserWindow({
    width: 300,
    height: 350,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enablePreferredSizeMode: true
    }
  });

  win.loadFile('index.html');
}

function createTray() {
  // 使用默认图标，你可以替换成自己的图标文件
  tray = new Tray(app.getAppPath() + '/assets/lucy.png');
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '好朋友 Lucy',
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: '退出',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('好朋友 Lucy');
  tray.setContextMenu(contextMenu);
}

ipcMain.on('friend-drag-start', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  const cursor = screen.getCursorScreenPoint();
  const winPos = win.getPosition();
  
  dragSessions.set(win, {
    startCursorX: cursor.x,
    startCursorY: cursor.y,
    startWinX: winPos[0],
    startWinY: winPos[1]
  });
});

ipcMain.on('friend-drag-move', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  const drag = dragSessions.get(win);
  if (!drag) return;

  const cursor = screen.getCursorScreenPoint();
  
  const deltaX = cursor.x - drag.startCursorX;
  const deltaY = cursor.y - drag.startCursorY;

  const nextX = drag.startWinX + deltaX;
  const nextY = drag.startWinY + deltaY;

  win.setPosition(Math.round(nextX), Math.round(nextY));
});

ipcMain.on('friend-drag-end', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  dragSessions.delete(win);
});

app.whenReady().then(() => {
  createFriendWindow();
  createTray();
});

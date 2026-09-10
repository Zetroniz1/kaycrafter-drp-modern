import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import RPC from 'discord-rpc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow;
let rpc;
const CLIENT_ID = '1526209254250385459'; // Замените на ваш ID

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 350,
        height: 200,
        resizable: false, // Запрещаем менять размер окна
        autoHideMenuBar: true, // Прячем верхнее меню (File, Edit и т.д.)
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');
}

// Функция запуска Discord RPC
function startRPC() {
    if (rpc) return;

    rpc = new RPC.Client({ transport: 'ipc' });

    rpc.on('ready', () => {
        rpc.setActivity({
            details: 'На сервере',
            state: 'Версия 1.7.10 - 26.3, IP: 213.152.43.100:25985',
            startTimestamp: new Date(),
            instance: false,
        });
        // Отправляем статус в окно, чтобы обновить текст на кнопке
        mainWindow.webContents.send('rpc-status', 'running');
    });

    rpc.login({ clientId: CLIENT_ID }).catch((err) => {
        mainWindow.webContents.send('rpc-status', 'error');
        rpc = null;
    });
}

// Функция остановки Discord RPC
function stopRPC() {
    if (rpc) {
        rpc.clearActivity().then(() => {
            rpc.destroy();
            rpc = null;
            mainWindow.webContents.send('rpc-status', 'stopped');
        }).catch(() => {
            rpc = null;
            mainWindow.webContents.send('rpc-status', 'stopped');
        });
    }
}

app.whenReady().then(() => {
    createWindow();
    startRPC(); // Запускаем RPC сразу при старте приложения

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    stopRPC();
    if (process.platform !== 'darwin') app.quit();
});

// Слушаем команды из GUI (нажатие на кнопку)
ipcMain.on('toggle-rpc', () => {
    if (rpc) {
        stopRPC();
    } else {
        startRPC();
    }
});

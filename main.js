const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const Jimp = require('jimp');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

// Add !== 'production' to set developer mode
const isDev = process.env.NODE_ENV == 'production';
const isMac = process.platform === 'darwin';

let mainWindow;
let aboutWindow;

// Main Window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: isDev ? 1200 : 500,
    height: 800,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Show devtools automatically if in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

    // mainWindow.loadURL(`file://${__dirname}/renderer/index.html`);
   mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// About Window
function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    width: 1200,
    height: 1200,
    title: 'About Electron',
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
  });

   aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

// When the app is ready, create the window
app.on('ready', () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  // Remove variable from memory
  mainWindow.on('closed', () => (mainWindow = null));
});

// Menu template
const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: 'Hakkında',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: 'fileMenu',
  },
  ...(!isMac
    ? [
        {
          label: 'Yardım',
          submenu: [
            {
              label: 'Hakkında',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  // ...(isDev
  //   ? [
  //       {
  //         label: 'Developer',
  //         submenu: [
  //           { role: 'reload' },
  //           { role: 'forcereload' },
  //           { type: 'separator' },
  //           { role: 'toggledevtools' },
  //         ],
  //       },
  //     ]
  //   : []),
];

// Respond to the resize image event
ipcMain.on('image:resize', (e, options) => {
  // console.log(options);
  options.dest = path.join(os.homedir(), 'imageresizer');
  resizeImage(options);
  shell.openPath(options.dest);
});

ipcMain.on('image:multiple-resize', async (e, options) => {
  const resolutions = [
    { width: 974, height: 360 },
    { width: 600, height: 477 },
    { width: 928, height: 340 }
  ];

  try {
    // Kullanıcıdan alınan hedef klasörü kullanarak her bir çözünürlük için döngü
    for (const resolution of resolutions) {
      // Her çözünürlük için resim yeniden boyutlandırma işlemi
      await resizeImage({
        imgPath: options.imgPath,
        width: resolution.width,
        height: resolution.height,
        dest: options.dest
      });
    }
    // Tüm resimler yeniden boyutlandırıldığında, başarı mesajı gönder
    mainWindow.webContents.send('images:multiple-done');
    shell.openPath(options.dest);
  } catch (err) {
    // Hata durumunda, hatayı ana pencerede göster
    mainWindow.webContents.send('resize-error', err.message);
  }
});

// Resize and save image
async function resizeImage({ imgPath, height, width, dest }) {
  try {
    // Create destination folder if it doesn't exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    // Get the new filename with proper extension
    const newFilename = `${path.basename(imgPath, path.extname(imgPath))}-${width}x${height}.webp`;

    // Use Jimp to resize and save the image
    const image = await Jimp.read(imgPath);
    image.resize(+width, +height).write(path.join(dest, newFilename), () => {
      mainWindow.webContents.send('image:done');
    });

  } catch (err) {
    console.log(err);
    // Handle errors here
    mainWindow.webContents.send('resize-error', err.message);
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});

// Open a window if none are open (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});

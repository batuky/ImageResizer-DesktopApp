// Select DOM elements
const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

/**
 * Loads the selected image and updates the UI accordingly.
 * @param {Event} e - The event object.
 */
// Load image and show form
function loadImage(e) {
  const file = e.target.files[0];

  // Check if file is an image
  if (!isFileImage(file)) {
    alertError('Lütfen JPG, JPEG ve PNG türünde bir dosya seçin.');
    return;
  }

  // Add current height and width to form using the URL API
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  // Show form, image name and output path
  form.style.display = 'block';
  filename.innerHTML = img.files[0].name;
  outputPath.innerText = path.join(os.homedir(), 'imageresizer');
}

/**
 * Checks if the provided file is an image.
 * @param {File} file - The file to check.
 * @returns {boolean} - True if the file is an image, false otherwise.
 */
// Make sure file is an image
function isFileImage(file) {
  const acceptedImageTypes = ['image/jpg', 'image/jpeg', 'image/png'];
  return file && acceptedImageTypes.includes(file['type']);
}

/**
 * Resizes the selected image based on input values.
 * @param {Event} e - The event object.
 */
// Resize image
function resizeImage(e) {
  e.preventDefault();

  if (!img.files[0]) {
    alertError('Lütfen bir görsel yükleyin');
    return;
  }

  if (widthInput.value === '' || heightInput.value === '') {
    alertError('Lütfen genişlik ve yükseklik değerlerini girin.');
    return;
  }

  // Electron adds a bunch of extra properties to the file object including the path
  const imgPath = img.files[0].path;
  const width = widthInput.value;
  const height = heightInput.value;

  ipcRenderer.send('image:resize', {
    imgPath,
    height,
    width,
  });
}

/**
 * Resizes the selected image to multiple predefined resolutions.
 * @param {Event} e - The event object.
 */
function multipleResize(e) {
  e.preventDefault();

  // Check image
  if (!img.files[0]) {
    alertError('Lütfen bir görsel yükleyin');
    return;
  }

  // Defined resolutions
  const resolutions = [
    { width: 974, height: 360 },
    { width: 600, height: 477 },
    { width: 928, height: 340 },
    { width: 2000, height: 1600 }
  ];

  // File path of the selected image
  const imgPath = img.files[0].path;

  // Send the multiple resize event with all resolutions
  ipcRenderer.send('image:multiple-resize', {
    imgPath,
    resolutions,
    dest: outputPath.innerText // Folder destination
  });
}

/**
 * Opens the output folder in the file explorer.
 */
function openOutputFolder() {
  ipcRenderer.send('open-output-folder');
}

// When done, show message
ipcRenderer.on('image:done', () =>
  alertSuccess(`Görsel yeniden boyutlandırıldı`)
);

ipcRenderer.on('images:multiple-done', () =>
  alertSuccess(`Görsel tüm boyutlar için yeniden boyutlandırıldı`)
);

/**
 * Displays a success message using Toastify.
 * @param {string} message - The success message to display.
 */
function alertSuccess(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'green',
      color: 'white',
      textAlign: 'center',
    },
  });
}

/**
 * Displays an error message using Toastify.
 * @param {string} message - The error message to display.
 */
function alertError(message) {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center',
    },
  });
}

// File select listener
img.addEventListener('change', loadImage);
// Form submit listener
form.addEventListener('submit', resizeImage);
// Multiple resize button listener
document.querySelector('#multiple-resize').addEventListener('click', multipleResize);
//Open folder button listener
document.querySelector('#open-output-folder').addEventListener('click', openOutputFolder);
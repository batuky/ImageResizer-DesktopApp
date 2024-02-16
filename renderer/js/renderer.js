const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');


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

// Make sure file is an image
function isFileImage(file) {
  const acceptedImageTypes = ['image/jpg', 'image/jpeg', 'image/png'];
  return file && acceptedImageTypes.includes(file['type']);
}

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
    { width: 928, height: 340 }
  ];

  // File path of the selected image
  const imgPath = img.files[0].path;

  // Send the multiple resize event with all resolutions
  ipcRenderer.send('image:multiple-resize', {
    imgPath,
    resolutions, // Bu dizi ana işlemciye gönderiliyor
    dest: outputPath.innerText // Hedef klasör yolu
  });
}


// When done, show message
ipcRenderer.on('image:done', () =>
  alertSuccess(`Görsel yeniden boyutlandırıldı`)
);

ipcRenderer.on('images:multiple-done', () =>
  alertSuccess(`Tüm görseller yeniden boyutlandırıldı`)
);

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

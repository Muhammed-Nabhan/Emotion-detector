// Global variables
let videoElement, canvasElement, canvasContext;
let isCameraStreaming = false;

// Function to initialize camera stream
async function initializeCamera() {
  videoElement = document.getElementById('videoElement');
  canvasElement = document.getElementById('canvasElement');
  canvasContext = canvasElement.getContext('2d');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
    isCameraStreaming = true;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Function to stop camera stream
function stopCamera() {
  if (isCameraStreaming) {
    const stream = videoElement.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach(track => track.stop());
    videoElement.srcObject = null;
    isCameraStreaming = false;
  }
}

// Function to capture frame from camera stream
function captureFrame() {
  if (isCameraStreaming) {
    canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    const imageData = canvasElement.toDataURL('image/jpeg');
    return imageData;
  }
  return null;
}

// Function to detect emotions using Face API
async function detectEmotions(imageData) {
  try {
    const detections = await faceapi.detectAllFaces(imageData).withFaceExpressions();
    const emotions = detections.map(detection => detection.expressions);
    return emotions;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Handle detect button click event
async function handleDetectButtonClick() {
  // Capture frame from camera stream
  const imageData = captureFrame();

  if (imageData) {
    // Perform emotion detection
    const emotions = await detectEmotions(imageData);

    if (emotions) {
      displayEmotions(emotions);
    } else {
      displayError('Emotion detection failed.');
    }
  }
}

// Display emotion results
function displayEmotions(emotions) {
  const resultContainer = document.getElementById('resultContainer');
  resultContainer.innerHTML = '';

  emotions.forEach((emotion, index) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = `Face ${index + 1}: ${JSON.stringify(emotion)}`;
    resultContainer.appendChild(paragraph);
  });
}

// Display error message
function displayError(message) {
  const resultContainer = document.getElementById('resultContainer');
  resultContainer.innerHTML = '';

  const paragraph = document.createElement('p');
  paragraph.textContent = message;
  resultContainer.appendChild(paragraph);
}

// Initialize camera stream when the page is loaded
window.addEventListener('DOMContentLoaded', async () => {
  await faceapi.nets.ssdMobilenetv1.loadFromUri('/weights');
  await faceapi.nets.faceExpressionNet.loadFromUri('/weights');
  initializeCamera();
});

// Attach event listener to the detect button
const detectButton = document.getElementById('detectButton');
detectButton.addEventListener('click', handleDetectButtonClick);

// Stop camera stream when the page is unloaded or closed
window.addEventListener('beforeunload', stopCamera);

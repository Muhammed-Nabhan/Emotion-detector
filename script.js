
// Replace with your Face API endpoint and subscription key
const endpoint = 'https://your-face-api-endpoint';
const subscriptionKey = 'your-subscription-key';

// Global variables
let videoElement, canvasElement, canvasContext;
let isCameraStreaming = false;

// Function to initialize camera stream
function initializeCamera() {
  videoElement = document.getElementById('videoElement');
  canvasElement = document.getElementById('canvasElement');
  canvasContext = canvasElement.getContext('2d');

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      videoElement.srcObject = stream;
      isCameraStreaming = true;
    })
    .catch(error => console.error('Error:', error));
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
    // Prepare the request URL
    const url = `${endpoint}/detect?returnFaceAttributes=emotion`;

    // Prepare the request headers
    const headers = new Headers();
    headers.append('Content-Type', 'application/octet-stream');
    headers.append('Ocp-Apim-Subscription-Key', subscriptionKey);

    // Convert base64 image data to blob
    const binaryData = atob(imageData.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const uintArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binaryData.length; i++) {
      uintArray[i] = binaryData.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });

    // Send the POST request to the Face API
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: blob,
    });

    // Parse the response JSON
    const result = await response.json();

    // Extract and return the emotion data
    const emotions = result.map(face => face.faceAttributes.emotion);
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
window.addEventListener('DOMContentLoaded', initializeCamera);

// Attach event listener to the detect button
const detectButton = document.getElementById('detectButton');
detectButton.addEventListener('click', handleDetectButtonClick);

// Stop camera stream when the page is unloaded or closed
window.addEventListener('beforeunload', stopCamera);

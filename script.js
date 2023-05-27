const video=document.getElementById("video")

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
  
])


function startVideo()
{
  navigator.mediaDevices.getUserMedia(
    {
      video: {} },
      stream=> video.srcObject=stream,
      err=>console.error(err)
  )
    }
  
video.addEventListener('play',()=>{
  const canvas=faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const  displaySize={width: video.width,height:video.height}
  faceapi.matchDimensions(canvas,displaySize)
  setInterval(async () => {
    const webstream=await faceapi.detectAllFaces(video,new faceapi.TinyFaceDetectorOptions()).withFaceLandmark().withFaceExpression()
    const finalStream=faceapi.resizeResults(webstream,displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas,finalStream)
    faceapi.draw.drawFaceLandmarks(canvas,finalStream)
    faceapi.draw.drawExpressions(canvas,finalStream)
    
  },100);
});

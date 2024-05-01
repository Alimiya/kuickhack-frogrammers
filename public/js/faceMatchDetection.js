async function loadModels(){
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/public/jsmodels/faceapi');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/public/jsmodels/faceapi');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/public/jsmodels/faceapi');

}
function handleImageUpload(fileInputId) {
    return new Promise((resolve, reject) => {
        const fileInput = document.getElementById(fileInputId);
        const file = fileInput.files[0];
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

async function compareFaces() {
    await loadModels();
    const img1 = await handleImageUpload('file-img-1');
    const img2 = await handleImageUpload('file-img-2');
    const face1 = await faceapi.detectSingleFace(img1).withFaceLandmarks().withFaceDescriptor();
    const face2 = await faceapi.detectSingleFace(img2).withFaceLandmarks().withFaceDescriptor();

    if (!face1 || !face2) {
        console.log("No faces detected in one or both images.");
        return;
    }

    const distance = faceapi.euclideanDistance(face1.descriptor, face2.descriptor);
    console.log('Euclidean distance between face descriptors:', distance)

    if (distance < 0.6) {
        console.log('Faces match: The photo matches the passport.')
    } else {
        console.log('Faces do not match: The photo does not match the passport.')
    }
}
   
async function faceMatchDetectionStart() {
    await compareFaces();
}
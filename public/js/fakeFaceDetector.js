async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/public/jsmodels/faceapi');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/public/jsmodels/faceapi');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/public/jsmodels/faceapi');
    const model = await tf.loadLayersModel('/public/jsmodels/anti-spoofing/model.json');
    return model;
}

async function handleImageUpload(fileInputId) {
    return new Promise((resolve, reject) => {
        const fileInput = document.getElementById(fileInputId);
        const file = fileInput.files[0];
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

async function detectFace(imgElement) {
    const detection = await faceapi.detectSingleFace(imgElement).withFaceLandmarks().withFaceDescriptor();
    return detection;
}

async function isRealFace(imgElement, model) {
    let tensor = tf.browser.fromPixels(imgElement);
    
    // Convert to grayscale
    tensor = tf.image.rgbToGrayscale(tensor);
    
    const resized = tf.image.resizeBilinear(tensor, [128, 128]);
    const normalized = tf.div(resized, 255);
    const batched = normalized.expandDims(0);

    const prediction = model.predict(batched);
    const real = (await prediction.data())[0];

    return real > 0.5;
}
window.fakeFaceDetectorStart = async function() {
    const model = await loadModels();
    const imgElement = await handleImageUpload('file-img-2');
    const detection = await detectFace(imgElement);

    if (!detection) {
        console.log("No faces detected in the image.");
        return;
    }

    const real = await isRealFace(imgElement, model);
    console.log('Is the face real?', real);
}
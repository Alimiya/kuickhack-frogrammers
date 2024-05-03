async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/public/jsmodels/faceapi')
    await faceapi.nets.faceLandmark68Net.loadFromUri('/public/jsmodels/faceapi')
    await faceapi.nets.faceRecognitionNet.loadFromUri('/public/jsmodels/faceapi')
}
async function loadTFModel() {
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


async function prepareImage(imgElement, detection) {
    const box = detection.detection.box;
    const regionsToExtract = tf.tensor2d([
        [box.topLeft[1], box.topLeft[0], box.bottomRight[1], box.bottomRight[0]]
    ]);
    const boxInd = tf.tensor1d([0], 'int32');  // Add this line
    const tensorImage = tf.browser.fromPixels(imgElement).expandDims();
    const faceImages = await tf.image.cropAndResize(tensorImage, regionsToExtract, boxInd, [128, 128]);  // Modify this line
    const normalizedFaceImage = faceImages.toFloat().div(tf.scalar(255)).expandDims();
    return normalizedFaceImage;
}



async function predictFakeOrRealFace(fileInputId) {
    await loadModels();
    const img = await handleImageUpload(fileInputId);
    const detection = await detectFace(img);
    if (detection) {
        const model = await loadTFModel();
        const preparedImage = await prepareImage(img, detection);
        const prediction = model.predict(preparedImage);
        prediction.print();
        console.log(prediction);
        return prediction;
    } else {
        console.log('No face detected in the image.');
        return null;
    }
    }

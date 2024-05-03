async function loadModels() {
    const models = [
        { name: 'ssdMobilenetv1', uri: '/public/jsmodels/faceapi' },
        { name: 'faceLandmark68Net', uri: '/public/jsmodels/faceapi' },
        { name: 'faceRecognitionNet', uri: '/public/jsmodels/faceapi' }
    ];

    for (const model of models) {
        await faceapi.nets[model.name].loadFromUri(model.uri);
    }
}

async function faceMatchDetection(imgId, docId) {
    let status = 'error';
    let errorType;
    let distance;

    await loadModels();

    const img1 = await handleImageUpload(imgId);
    const img2 = await handleImageUpload(docId);

    const face1 = await faceapi.detectSingleFace(img1).withFaceLandmarks().withFaceDescriptor();
    const face2 = await faceapi.detectSingleFace(img2).withFaceLandmarks().withFaceDescriptor();

    if (!face1 || !face2) {
        errorType = 'no-face';
    } else {
        distance = faceapi.euclideanDistance(face1.descriptor, face2.descriptor);
        if (distance !== undefined) {
            if (distance < 0.4) {
                status = 'success';
            } else {
                errorType = 'no-dist';
            }
        }
    }

    const result = { status };
    if (errorType !== undefined) {
        result.errorType = errorType;
    } 
    if (distance !== undefined) {
        result.data = distance;
    }

    return result;
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
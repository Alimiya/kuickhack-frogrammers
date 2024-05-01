async function loadModels() {
    const progressBar = document.getElementById('progress-swag-bio')
    const percentDisplay = document.getElementById('percent-swag-bio');

    const models = [
        { name: 'ssdMobilenetv1', uri: '/public/jsmodels/faceapi' },
        { name: 'faceLandmark68Net', uri: '/public/jsmodels/faceapi' },
        { name: 'faceRecognitionNet', uri: '/public/jsmodels/faceapi' }
    ];

    // Calculate progress step for each model
    const progressStep = 100 / models.length;

    // Initialize progress
    let currentProgress = 0;
    progressBar.style.width = '0%';
    percentDisplay.innerText = '0%';

    // Load each model
    for (const model of     models) {
        await faceapi.nets[model.name].loadFromUri(model.uri);
        currentProgress += progressStep;
        progressBar.style.width = `${currentProgress}%`;
        percentDisplay.innerText = `${Math.round(currentProgress)}%`;

        await new Promise(resolve => setTimeout(resolve, 600));
    }
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

    const resultBlock = document.querySelector('#result-swag-bio .result__element__block');
    const resultMessage = document.createElement('div');
    resultBlock.innerHTML = '';

    if (!face1 || !face2) {
        resultMessage.innerHTML += '<p class="mt-4">На одном или обоих изображениях лица не обнаружены.</p>'
        resultMessage.innerHTML += '<span class="result-false material-symbols-rounded text-danger fs-4">cancel</span>';
        resultBlock.appendChild(resultMessage);
        return;
    }

    const distance = faceapi.euclideanDistance(face1.descriptor, face2.descriptor);
    resultMessage.innerHTML += '<p class="mt-4">Евклидово расстояние между дескрипторами граней: <span class="text-frog-eye">${distance}</span></p>';
    console.log('Euclidean distance between face descriptors:', distance)

    return distance;
}
   
async function faceMatchDetectionStart() {
    const distance = await compareFaces();
    if (distance !== undefined) {
        const resultBlock = document.querySelector('#result-swag-bio .result__element__block');

        // let message;
        // if (distance < 0) {
        //     message = "No faces detected in one or both images.";
        // } else {
        //     message = `<p class="mt-4">Евклидово расстояние между дескрипторами граней: <span class="text-frog-eye">${distance}</span></p>`;
        // }

        const resultMessage = document.createElement('div');
        // resultMessage.innerHTML += message;
        resultBlock.appendChild(resultMessage);

        if (distance !== undefined) {
            if (distance < 0.6) {
                resultMessage.innerHTML += '<p class="mt-4">Вывод: <span class="text-frog">Фотография соответствует паспорту.</span></p>';
                resultMessage.innerHTML += '<span class="result-true material-symbols-rounded text-success fs-4">check_circle</span>';
            } else {
                resultMessage.innerHTML += '<p class="mt-4">Вывод: Фотография не соответствует паспорту.</p>';
                resultMessage.innerHTML += '<span class="result-false material-symbols-rounded text-danger fs-4">cancel</span>';
            }
           
            resultBlock.appendChild(resultMessage);
        }
    }
}


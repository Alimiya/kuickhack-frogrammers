async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/public/jsmodels/faceapi')
    await faceapi.nets.faceLandmark68Net.loadFromUri('/public/jsmodels/faceapi')
    await faceapi.nets.faceRecognitionNet.loadFromUri('/public/jsmodels/faceapi')
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

async function main() {
    // Load models
    await loadModels();

    // Paths to real and fake images
    const realDir = "./real_and_fake_face/training_real";
    const fakeDir = "./real_and_fake_face/training_fake";

    // Get list of image files
    const realFiles = fs.readdirSync(realDir);
    const fakeFiles = fs.readdirSync(fakeDir);

    // Define image size
    const imgSize = 128;

    // Function to create training data
    async function createTrainingData(files, label) {
        const trainingData = [];
        const y = [];
        for (const file of files.slice(0, label === 1 ? 981 : 860)) {
            const img = path.join(label === 1 ? realDir : fakeDir, file);
            const detections = await detectFaces(img);
            if (detections.length > 0) {
                const faceImg = await canvas.loadImage(img);
                const faceCanvas = faceapi.createCanvasFromMedia(faceImg);
                const ctx = faceCanvas.getContext('2d');
                ctx.drawImage(faceImg, 0, 0);
                const face = new canvas.Canvas(128, 128);
                face.getContext('2d').drawImage(faceCanvas, 0, 0);
                trainingData.push(face);
                y.push(label);
            }
        }
        return [trainingData, y];
    }

    // Create training data
    const [X_train_real, Y_train_real] = await createTrainingData(realFiles, 1);
    const [X_train_fake, Y_train_fake] = await createTrainingData(fakeFiles, 0);

    // Concatenate real and fake training data
    const X_train = X_train_real.concat(X_train_fake);
    const Y_train = Y_train_real.concat(Y_train_fake);

    // Preprocess training data
    const X_train_processed = X_train.map(img => {
        const tensor = faceapi.tf.browser.fromPixels(img);
        return faceapi.tf.cast(tensor, 'float32').div(faceapi.tf.scalar(255));
    });

    // Convert Y_train to tensor
    const Y_train_tensor = faceapi.tf.tensor1d(Y_train);

    // Define the model
    const model = tf.sequential();
    model.add(tf.layers.conv2d({
        inputShape: [imgSize, imgSize, 3],
        kernelSize: 3,
        filters: 64,
        activation: 'relu'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
    model.add(tf.layers.conv2d({
        kernelSize: 3,
        filters: 32,
        activation: 'relu'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
    model.add(tf.layers.conv2d({
        kernelSize: 3,
        filters: 16,
        activation: 'relu'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({
        units: 128,
        kernelRegularizer: 'l2',
        activation: 'relu'
    }));
    model.add(tf.layers.dropout({ rate: 0.12 }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    // Compile the model
    model.compile({
        loss: 'binaryCrossentropy',
        optimizer: tf.train.adam(0.001),
        metrics: ['accuracy']
    });

    // Train the model
    await model.fit(tf.stack(X_train_processed), Y_train_tensor, {
        batchSize: 64,
        epochs: 15,
        validationSplit: 0.2
    });

    // Save the model
    await model.save('file://my_finalised_cnn');
}

main();
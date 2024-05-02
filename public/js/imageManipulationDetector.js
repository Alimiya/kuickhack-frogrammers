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

async function analyzeImage(fileInputId) {
    const img = await handleImageUpload(fileInputId);
    let src = cv.imread(img);
    let dst = new cv.Mat();

    // Convert to grayscale
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);

    // Calculate histogram
    let mask = new cv.Mat();
    let hist = new cv.Mat();
    let bins = [256];
    let ranges = [0, 256];
    cv.calcHist(dst, [0], mask, hist, [1], bins, ranges);

    // Calculate mean and standard deviation
    let mean = new cv.Mat();
    let stdDev = new cv.Mat();
    cv.meanStdDev(dst, mean, stdDev);

    // If standard deviation is high, the image might be manipulated
    if (stdDev.data32F[0] > threshold) {
        console.log('The image was likely manipulated');
    } else {
        console.log('The image is likely to be real');
    }

    src.delete(); dst.delete(); mask.delete(); hist.delete(); mean.delete(); stdDev.delete();
}



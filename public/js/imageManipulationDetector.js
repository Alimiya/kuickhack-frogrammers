function getImageData(fileInputId) {
    return new Promise((resolve, reject) => {
        const fileInput = document.getElementById(fileInputId);
        const file = fileInput.files[0];
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            // Create a new canvas and draw the image onto the canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            // Get the ImageData from the canvas
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            resolve(imageData);
        };
        img.onerror = reject;
    });
}

async function detectForgery(fileInputId) {
    const imageData = await getImageData(fileInputId);

    // Create a new canvas and draw the image onto the canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);

    // Append the canvas to the body
    // This step is necessary because cv.imread() needs to find the canvas in the DOM
    document.body.appendChild(canvas);

    // Give the canvas an id
    canvas.id = 'canvasId';

    // Use cv.imread to read the image data from the canvas
    let src = cv.imread('canvasId');

    // Convert the image to grayscale
    let gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    // Detect keypoints and compute descriptors
    let orb = new cv.ORB();
    let keypoints = new cv.KeyPointVector();
    let descriptors = new cv.Mat();
    orb.detectAndCompute(gray, new cv.Mat(), keypoints, descriptors);

    // Match descriptors between the two images
    let matcher = new cv.BFMatcher(cv.NORM_HAMMING, true);
    let matches = new cv.DMatchVector();
    matcher.match(descriptors, descriptors, matches);
    console.log(matches.size())
    // If there are a large number of matches, it's likely that the image has been manipulated
    const isManipulated = matches.size() > 1000; // Adjust this threshold as needed

    console.log('Is the image manipulated?', isManipulated);

    // Clean up
    src.delete(); gray.delete(); orb.delete(); keypoints.delete(); descriptors.delete(); matcher.delete(); matches.delete();
}
async function detectSplicing(fileInputId) {
    $("#canvasId").remove();
    const imageData = await getImageData(fileInputId);

    // Create a new canvas and draw the image onto the canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    ctx.putImageData(imageData, 0, 0);

    // Append the canvas to the body
    // This step is necessary because cv.imread() needs to find the canvas in the DOM
    document.body.appendChild(canvas);

    // Give the canvas an id
    canvas.id = 'canvasId';

    // Use cv.imread to read the image data from the canvas
    let src = cv.imread('canvasId');

    // Convert the image to grayscale
    let gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

    // Apply the Sobel operator to the grayscale image
    let sobel = new cv.Mat();
    cv.Sobel(gray, sobel, cv.CV_64F, 1, 1);

    // Compute the absolute value of the Sobel image
    let absSobel = new cv.Mat();
    cv.convertScaleAbs(sobel, absSobel);

    // Threshold the Sobel image to highlight strong edges
    let threshold = new cv.Mat();
    cv.threshold(absSobel, threshold, 100, 255, cv.THRESH_BINARY); // Adjust the threshold value as needed

    // Calculate the percentage of white pixels
    let whitePixels = cv.countNonZero(threshold);
    let totalPixels = threshold.rows * threshold.cols;
    let whitePixelPercentage = (whitePixels / totalPixels) * 100;

    // If the percentage of white pixels is above a certain threshold, conclude that splicing was detected
    const splicingThreshold = 1; // Adjust this threshold as needed
    console.log(whitePixelPercentage)
    const isSpliced = whitePixelPercentage > splicingThreshold;

    console.log('Is the image spliced?', isSpliced);

    // Clean up
    src.delete(); gray.delete(); sobel.delete(); absSobel.delete(); threshold.delete();
}

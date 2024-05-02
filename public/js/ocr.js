function handleImageUpload(fileInputId) {
    return new Promise((resolve, reject) => {
        const fileInput = document.getElementById(fileInputId);
        const file = fileInput.files[0];
        const img = new Image();

        img.onload = () => {
            // Create a canvas and draw the image on it
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            // Convert the image to grayscale
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < imageData.data.length; i += 4) {
                const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
                imageData.data[i] = avg; // red
                imageData.data[i + 1] = avg; // green
                imageData.data[i + 2] = avg; // blue
            }
            ctx.putImageData(imageData, 0, 0);

            resolve(canvas);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

function recognizeImage(fileInputId) {
    handleImageUpload(fileInputId).then(img => {
        Tesseract.recognize(
            img,
            'kaz+rus+eng', // Specify the languages as Kazakh, Russian, and English
            { logger: m => console.log(m) }
        ).then(({ data }) => {
            if (data && data.text) {
                // Extract dates using regex
                const dateRegex = /\b\d{2}\.\d{2}\.\d{4}\b/g;
                const dates = data.text.match(dateRegex);

                if (dates && dates.length > 0) {
                    // Convert strings to Date objects
                    const dateObjects = dates.map(dateStr => {
                        const [day, month, year] = dateStr.split('.');
                        return new Date(year, month - 1, day);
                    });

                    // Find the latest date
                    const latestDate = new Date(Math.max.apply(null, dateObjects));

                    // Compare with the current date
                    const currentDate = new Date();
                    console.log(latestDate)
                    console.log(currentDate)
                    currentDate.setHours(0, 0, 0, 0); // Ignore time for the comparison

                    if (latestDate > currentDate) {
                        console.log('Документ действует');
                    } else {
                        console.log('Документ просрочен');
                    }

                    dates.forEach((date, i) => {
                        console.log(`Date ${i + 1}:`, date);
                    });
                } else {
                    console.log('No recognizable dates found in the image.');
                }
            } else {
                console.log('No recognizable text found in the image.');
            }
        }).catch(error => {
            console.error('Tesseract Error:', error);
        });
    }).catch(error => {
        console.error('Image Upload Error:', error);
    });
}

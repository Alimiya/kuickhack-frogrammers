function handleImageUpload(fileInputId) {
    return new Promise((resolve, reject) => {
        const fileInput = document.getElementById(fileInputId);
        const file = fileInput.files[0];
        const img = new Image();

        img.onload = () => {
            // Parse the EXIF data
            EXIF.getData(img, function() {
                const allMetaData = EXIF.getAllTags(this);
                resolve({img, allMetaData});
            });
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

function extractTextAndDates(fileInputId) {
    handleImageUpload(fileInputId).then(({img}) => {
        Tesseract.recognize(
            img,
            'rus', // Specify the language as Russian
            { logger: m => console.log(m) }
        ).then(({ data: { text } }) => {
            // Extract dates using regex
            const dateRegex = /\b\d{2}\.\d{2}\.\d{4}\b/g;
            const dates = text.match(dateRegex);

            console.log('Extracted Dates:', dates);
        });
    }).catch(error => {
        console.error('Error:', error);
    });
}

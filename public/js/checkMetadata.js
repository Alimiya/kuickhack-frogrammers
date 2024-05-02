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


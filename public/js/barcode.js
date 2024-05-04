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

async function decodeBarcode(fileInputId) {
    return new Promise((resolve, reject) => {
        handleImageUpload(fileInputId).then(img => {
            Quagga.decodeSingle({
                decoder: {
                    readers: ["code_128_reader"] 
                },
                locate: true, 
                src: img.src 
            }, function(result){
                if(result.codeResult) {
                    resolve(result.codeResult.code.toString());  
                    console.log(result.codeResult.code.toString());
                } else {
                    reject("Баркод не расшифрован");
                }
            });
        }).catch(error => {
            reject(`Error handling image upload: ${error}`);
        });
    });
}

function recognizeImg(fileInputId) {
    return new Promise((resolve, reject) => {
        handleImageUpload(fileInputId).then(img => {
            Tesseract.recognize(
                img,
                'kaz+rus+eng'
            ).then(({ data }) => {
                if (data && data.text) {
                    // Extract 12-digit code using regex
                    const codeRegex = /\b\d{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])\d{6}\b/g;
                    const codes = data.text.match(codeRegex);

                    if (codes && codes.length > 0) {
                        resolve(codes[0].toString());  
                        console.log(codes[0].toString());
                    } else {
                        reject('ИИН не извлечен');
                    }
                } else {
                    reject('No text recognized');
                }
            }).catch(error => {
                reject(`Tesseract Error: ${error}`);
            });
        }).catch(error => {
            reject(`Image Upload Error: ${error}`);
        });
    });
}

async function compareCodes(fileInputId) {
    try {
        const barcode = await decodeBarcode(fileInputId);
        const code = await recognizeImg(fileInputId);

        if (barcode === code) {
            console.log("Проверка баркода пройдена");
        } else {
            console.log("Проверка баркода провалена");
        }
    } catch (error) {
        console.error(error);
    }
}
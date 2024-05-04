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

async function decodeBarcode(fileInputId, errorType) {
    return new Promise((resolve, reject) => {
        handleImageUpload(fileInputId).then(img => {
            Quagga.decodeSingle({
                decoder: {
                    readers: ["code_128_reader"] 
                },
                locate: true,
                src: img.src 
            }, function(result){
                if (result !== null) { // Check if result is not null
                    if(result.codeResult) {
                        resolve(result.codeResult.code.toString());  
                        console.log(result.codeResult.code.toString());
                    } else {
                        errorType = 'no-bar';
                        reject("Баркод не расшифрован");
                    }
                } else {
                    errorType = 'no-bar';
                    reject("Баркод не расшифрован");
                }
            });
        }).catch(error => {
            reject(`Error handling image upload: ${error}`);
        });
    });
}

function recognizeImg(fileInputId, errorType) {
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
                        errorType = 'no-uin'
                        reject('ИИН не извлечен');
                    }
                } else {
                    errorType = 'no-text'
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
        let status = 'error';
        let errorType;
        const barcode = await decodeBarcode(fileInputId, errorType);
        const code = await recognizeImg(fileInputId, errorType);

        if (barcode === code) {
            status = 'success';
            console.log("Проверка баркода пройдена");
        } else {
            errorType = 'no-match';
            console.log("Проверка баркода провалена");
        }
        const result = { status };
        if (errorType !== undefined) {
            result.errorType = errorType;
        } 
        if (barcode !== undefined) {
            result.barcode = barcode;
        }
        if (code !== undefined) {
            result.code = code;
        }

        return result;
    } catch (error) {
        console.error(error);
    }
}
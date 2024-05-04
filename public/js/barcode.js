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

let lastResult = null;

async function decodeBarcode(fileInputId) {
    try {
        const img = await handleImageUpload(fileInputId);
        Quagga.decodeSingle({
            decoder: {
                readers: ["code_128_reader"] 
            },
            locate: true, 
            src: img.src 
        }, function(result){
            if(result.codeResult && lastResult !== result.codeResult.code) {
                lastResult = result.codeResult.code;
                console.log("result", result.codeResult.code);
                Quagga.stop();  
            } else {
                console.log("not detected");
            }
        });
    } catch (error) {
        console.error("Error handling image upload:", error);
    }
}

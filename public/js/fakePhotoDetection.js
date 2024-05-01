async function loadModels(){
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/public/jsmodels/faceapi');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/public/jsmodels/faceapi');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/public/jsmodels/faceapi');
        }
async function detectFaces(input) {
        const img = await faceapi.fetchImage(input);
        const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
        return detections;
    }
async function compareFaces(img1, img2) {
        const face1 = await detectFaces(img1);
        const face2 = await detectFaces(img2);
        const faceMatcher = new faceapi.FaceMatcher(face1);
        const bestMatch = faceMatcher.findBestMatch(face2.descriptor);
        console.log(bestMatch.toString());
    }
   
async function main() {
        await loadModels();
        const img1 = getImgInput('img');
        const img2 = getImgInput('doc');
        await compareFaces(img1, img2);
    }

main();
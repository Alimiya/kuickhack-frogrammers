const User = require('../models/userModel')
const Replicate = require('replicate')
const replicate = new Replicate({auth: process.env.REPLICATE_API_TOKEN})
const { readFile } = require('fs').promises
const {ImageData} = require('canvas')

exports.compare = async (req, res) => {
    const {iin} = req.body
    try {
        const user = await User.findOne({iin})
        console.log(user)
        if (!user) return res.status(404).json({message: "User not found"})

        return res.status(200).json(user)
    } catch (err) {
        res.status(500).json({message: "Internal Server Error"})
    }
}

exports.getOne = async (req,res) => {
    const {iin} = req.params.id

    try {
        const user = await User.findOne(iin)
        if (!user) return res.status(404).json({message: "User not found"})

        return res.status(200).json(user)
    } catch (err) {
        res.status(500).json({message: "Internal Server Erro"})
    }
}

exports.get = async (req,res) => {
    try {
        const user = await User.find()
        return res.status(200).json(user)
    } catch (err) {
        res.status(500).json({message: "Internal Server Erro"})
    }
}

exports.image = async (req, res) => {
    const file = req.file;
    const imagePath = `./public/img/${file.originalname}`;
    const imageBlob = (await readFile(imagePath)).toString("base64");
    const image = `data:application/octet-stream;base64,${imageBlob}`;

    const output = await replicate.run(
        "highwaywu/image-forgery-detection:ab6f81afdf0de95354d44b61c18f4dfe31dc0ad83da8b0406d57afff8f6ace08",
        {
            input: {
                image: image,
            },
        }
    );

    // Обработка ответа API
    const processedImageURL = output;
    const processedImage = await fetch(processedImageURL);
    const imageBuffer = await processedImage.arrayBuffer();
    const imageData = new ImageData(new Uint8ClampedArray(imageBuffer), 256, 256);

    // Подсчет белых пикселей
    let lightPixelCount = 0;
    const lightPixelThreshold = 240; // Adjust this threshold as needed
    for (let i = 0; i < imageData.data.length; i += 4) {
        const red = imageData.data[i];
        const green = imageData.data[i + 1];
        const blue = imageData.data[i + 2];

        if (red >= lightPixelThreshold && green >= lightPixelThreshold && blue >= lightPixelThreshold) {
            lightPixelCount++;
        }
    }g

    // Вычисление процента белых пикселей
    const totalPixels = imageData.data.length / 4;
    const whitePixelPercentage = (lightPixelCount / totalPixels) * 100;

    // Формирование ответа
    const response = {
        processedImageURL: processedImageURL,
        whitePixelPercentage: whitePixelPercentage,
    };

    res.status(200).json(response);
};

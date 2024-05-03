const User = require('../models/userModel')
const Replicate = require('replicate')
const replicate = new Replicate({auth: process.env.REPLICATE_API_TOKEN})
const { readFile } = require('fs').promises
const axios = require('axios')
const fs = require('fs')

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

exports.checkForForgery = async (req,res) => {
    const file = req.file
    const imagePath = `./public/img/image-forgery-detection/input/${file.originalname}`
    const imageBlob = (await readFile(imagePath)).toString("base64")
    const image = `data:application/octet-stream;base64,${imageBlob}`
    replicate.run(
        "highwaywu/image-forgery-detection:ab6f81afdf0de95354d44b61c18f4dfe31dc0ad83da8b0406d57afff8f6ace08",
        {
            input: {
                image: image
            }
        }
    ).then(async output => {
        console.log(output)
        const imageResponse = await axios.get(output, {
            responseType: 'stream'
        });

        const imagePath = `./public/img/image-forgery-detection/output/${file.originalname}`;
        const imageStream = fs.createWriteStream(imagePath);

        imageResponse.data.pipe(imageStream);
        return res.status(200).json(output);
    }).catch(err => {
        console.error(err)
    })
}
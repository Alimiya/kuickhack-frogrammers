const User = require('../models/userModel')

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
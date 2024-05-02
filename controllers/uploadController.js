const User = require('../models/userModel')

exports.compare = async (req, res) => {
    const {iin, createdAt, endsAt} = req.body
    console.log(iin, createdAt, endsAt)
    try {
        const user = await User.findOne({iin})
        console.log(user)
        if (!user) return res.status(404).json({message: "Такого человека не существует"})

        if (
            user.createdAt === createdAt &&
            user.endsAt === endsAt
        ) {
            return res.status(200).json({message: "Пользователь сравнен успешно"})
        } else {
            return res.status(404).json({message: "Данные пользователя не совпадают"})
        }
    } catch (err) {
        res.status(500).json({message: "Внутренняя ошибка сервера"})
    }
}

exports.get = async (req,res) => {
    const {iin} = req.params.id

    try {
        const user = await User.findOne(iin)
        if (!user) return res.status(404).json({message: "Такого человека не существует"})

        return res.status(200).json(user)
    } catch (err) {
        res.status(500).json({message: "Внутренняя ошибка сервера"})
    }
}

exports.getOne = async (req,res) => {
    try {
        const user = await User.find()
        return res.status(200).json(user)
    } catch (err) {
        res.status(500).json({message: "Внутренняя ошибка сервера"})
    }
}
const {Person, Message} = require('../models/index')
const sequelize = require('../db')

async function create(req, res) {
    try {
        const person = await Person.findByPk(req.person.id)

        if (!person)
            return res.status(404).json({message: "person not found"})

        const room = await person.getRoom()
        if (!room)
            return res.status(500).json({message: "Person not in a room"})

        req.body.SenderId = person.id
        req.body.RoomId = room.id
        const newMessage = await Message.create(req.body)

        res.json(newMessage)
    }
    catch (err) {
        res.json(err)
    }
}

async function findAll(req, res) {
    try {
        const allMessage = await Message.findAll()
        res.json(allMessage)
    }
    catch (err) {
        res.json(err)
    }
}

async function findOne(req, res) {
        const message = await Message.findByPk(req.params.id)
        if (message) {
            res.json(message)
        }
        else{
            res.status(404).json({message: "message not found"})
        }
}

async function update(req, res) {
    try {    
        const message = await Message.findByPk(req.params.id)
        message.update(req.body)
        res.json(message)
    }
    catch (err) {
        res.status(404).json({message: "message not found"})
    }
}

async function destroy(req, res) {
    try {    
        const message = await Message.findByPk(req.params.id)
        message.destroy()
        res.json({message: "sucess"})
    }
    catch (err) {
        res.status(404).json({message: "message not found"})
    }
}

async function roomMessages(req, res) {
    const person = await Person.findByPk(req.person.id)

    if (!person.RoomId)
        return res.status(500).json({message: "person not in a room"})

    if (!person.isAdmin & (await person.getRoom()).code != req.params.roomCode)
        return res.status(401).json({message: "unauthorized"})

    const messages = await Message.findAll({
        attributes: ['id', 'message',
            [sequelize.literal('Sender.name'), 'senderName'],
            [sequelize.literal('Sender.id'), 'senderId'],
            ['createdAt', 'hour']
        ],
        where: {RoomId: person.RoomId},
        include: {
            model: Person, as: 'Sender',
            attributes: []
        },
        raw: true
    })

    res.json(messages)
}

module.exports = {create, findAll, findOne, update, destroy, roomMessages}
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv/config')
const Message = require('../models/message')
const Person = require('../models/person')

function verifySocket (socket, next) {
    const token = socket.handshake.auth.token.split(" ")[1]

    jwt.verify(token, process.env.SECRET, async (err, decoded) => {
        if (err)
            next(new Error("invalid token"))
        else {
            socket.person = await Person.findByPk(decoded.id)
            next()
        }
    })
}

function socketIoCallback (socket) {
    console.log(`user ${socket.person.name} connected`)

    socket.on('message', async (message) => {
        const newMessage = await Message.create({
            message,
            sender: socket.person.id,
            room: socket.person.room
        })

        socket.broadcast.emit('response', {
            message,
            sender: socket.person.name,
            senderId: socket.person.id,
            hour: newMessage.createdAt
        })
    })
}

module.exports = {socketIoCallback, verifySocket}
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv/config')
const Message = require('../models/message')
const Person = require('../models/person')
const Room = require('../models/room')

function verifySocket (socket, next) {
    const token = socket.handshake.auth.token.split(" ")[1]

    jwt.verify(token, process.env.SECRET, async (err, decoded) => {
        if (err)
            next(new Error("invalid token"))
        else {
            socket.person = await Person.findByPk(decoded.id)
            socket.room = await Room.findByPk(socket.person.room)

            if (!socket.room)
                next(new Error("user not in a room"))

            next()
        }
    })
}

function handlers (io, socket) {
    socket.join(socket.room.code)
    socket.on('message', async (message) => {
        const newMessage = await Message.create({
            message,
            sender: socket.person.id,
            room: socket.person.room
        })

        io.to(socket.room.code).emit('response', {
            message,
            sender: socket.person.name,
            senderId: socket.person.id,
            hour: newMessage.createdAt
        })
    })
}

module.exports = {handlers, verifySocket}
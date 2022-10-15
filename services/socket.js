const jwt = require('jsonwebtoken')
const dotenv = require('dotenv/config')
const Message = require('../models/message')
const Person = require('../models/person')
const Room = require('../models/room')
const generateCode = require('../services/generateCode')

function verifySocket (socket, next) {
    const token = socket.handshake.auth.token.split(" ")[1]
    const code = socket.handshake.query.code
    const password = socket.handshake.query.password

    jwt.verify(token, process.env.SECRET, async (err, decoded) => {
        if (err)
            return next(new Error("invalid token"))

        socket.person = await Person.findByPk(decoded.id)

        if (!socket.person)
            return next(new Error("user not found"))

        if (!code)
            try {
                await socket.person.createRoom({
                    code: generateCode(5),
                    password
                })
            }
            catch (err) {
                return next(new Error("try again, duplicated code"))
            }
        else {
            const room = await Room.findOne({where: {code}})

            if (!room)
                return next(new Error("room not found"))

            if (room.password && room.password != password)
                return next(new Error("incorrect password"))

            await socket.person.setRoom(room)
        }

        socket.room = await socket.person.getRoom()
        next()
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
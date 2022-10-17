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
            catch (error) {
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
    console.log(io.sockets.adapter.rooms.get(socket.room.code).size)

    socket.on('message', async (message) => {
        const newMessage = await Message.create({
            message,
            SenderId: socket.person.id,
            RoomId: socket.room.id
        })

        io.to(socket.room.code).emit('response', {
            message,
            senderName: socket.person.name,
            senderId: socket.person.id,
            hour: newMessage.createdAt
        })
    })
    socket.on('disconnect', (reason) => {
        if (!io.sockets.adapter.rooms.get(socket.room.code)) {
            Message.destroy({where:{RoomId: socket.room.id}})
            Room.destroy({where:{code: socket.room.code}})
        }
        
        io.to(socket.room.code).emit('user_has_left', {
            message: `${socket.person.name} saiu do chat`,
            sender: socket.person.name,
            senderId: socket.person.id,
        })
    })
}

module.exports = {handlers, verifySocket}
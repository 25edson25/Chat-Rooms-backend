const jwt = require('jsonwebtoken')
const dotenv = require('dotenv/config')
const {Person, Room, Message} = require('../models/index')
const generateCode = require('../services/generateCode')

function verifySocket (socket, next) {
    const token = socket.handshake.auth.token.split(" ")[1]
    const code = socket.handshake.query.code
    const password = socket.handshake.query.password
    const roomName = socket.handshake.query.name

    jwt.verify(token, process.env.SECRET, async (err, decoded) => {
        if (err)
            return next(new Error("invalid token"))

        socket.person = await Person.findByPk(decoded.id)

        if (!socket.person)
            return next(new Error("user not found"))

        if (!code) {

            if (!roomName)
                return next(new Error("room name is required"))

            try {
                await socket.person.createRoom({
                    code: generateCode(5),
                    name: roomName,
                    password
                })
            }
            catch (error) {
                return next(new Error("try again, duplicated code"))
            }
        }
        else {
            const room = await Room.findOne({where: {code}})

            if (!room)
                return next(new Error("room not found"))
            console.log(room.password)
            console.log(password)
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

    io.to(socket.room.code).emit('has_entered', {
        message: `${socket.person.name} has entered the room`,
        senderName: socket.person.name,
        senderId: socket.person.id,
        roomCode: socket.room.code
    })

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
        
        io.to(socket.room.code).emit('has_left', {
            message: `${socket.person.name} has left the room`,
            senderName: socket.person.name,
            senderId: socket.person.id,
        })
    })
}

module.exports = {handlers, verifySocket}
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
        
            if (room.password && room.password != password)
                return next(new Error("incorrect password"))

            await socket.person.setRoom(room)
        }

        socket.room = await socket.person.getRoom()
        next()
    })
}

var timeoutId;

function handlers (io, socket) {
    socket.join(socket.room.code)

    io.to(socket.room.code).emit('has_entered', {
        message: `${socket.person.name} has entered the room`,
        senderName: socket.person.name,
        senderId: socket.person.id,
        roomCode: socket.room.code
    })

    socket.on('message', async (message) => {
        if (!message)
            return socket.emit('error', {message: "message can't be empty"})

        const newMessage = await Message.create({
            message,
            SenderId: socket.person.id,
            RoomId: socket.room.id
        })

        io.to(socket.room.code).emit('response', {
            id: newMessage.id,
            message,
            senderName: socket.person.name,
            senderId: socket.person.id,
            hour: newMessage.createdAt
        })
    })

    socket.on('reconnected', () => {
        clearTimeout(timeoutId)
    })
    
    socket.on('disconnect', async (reason) => {
        const hasUsersConnected = io.sockets.adapter.rooms.get(socket.room.code)? true:false

        async function removeUserFromRoom() {
            console.log("apagando")
            if (!hasUsersConnected) {
                await Message.destroy({where:{RoomId: socket.room.id}})
                await Room.destroy({where:{code: socket.room.code}})
            }
            
            io.to(socket.room.code).emit('has_left', {
                message: `${socket.person.name} has left the room`,
                senderName: socket.person.name,
                senderId: socket.person.id
            })
        }

        if (reason == "transport close") {
            timeoutId = setTimeout(() => {
                removeUserFromRoom()
            }, 5000)
        }
        else
            removeUserFromRoom()
    })
}

module.exports = {handlers, verifySocket}
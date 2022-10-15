const Room = require('../models/room')
const generateCode = require('../services/generateCode')

async function create(req, res) {
    try {
        do {
            req.body.code = generateCode(5)
        }
        while (await Room.findOne({where: {code: req.body.code}}))

        const newRoom = await Room.create(req.body)
        res.json(newRoom)
    }
    catch (err) {
        res.json(err)
    }
}

async function findAll(req, res) {
    try {
        const allRooms = await Room.findAll()
        res.json(allRooms)
    }
    catch (err) {
        res.json(err)
    }
}

async function findOne(req, res) {
        const room = await Room.findByPk(req.params.id)
        if (room) {
            res.json(room)
        }
        else{
            res.status(404).json("room not found")
        }
}

async function update(req, res) {
    if (!req.person.isAdmin)
            return res.status(401).json({message: "unauthorized"})
    try {    
        const room = await Room.findByPk(req.params.id)
        room.update(req.body)
        res.json(room)
    }
    catch (err) {
        res.status(404).json("room not found")
    }
}

async function destroy(req, res) {
    if (!req.person.isAdmin)
            return res.status(401).json({message: "unauthorized"})
            
    try {    
        const room = await Room.findByPk(req.params.id)
        room.destroy()
        res.json({message: "sucess"})
    }
    catch (err) {
        res.status(404).json({message: "room not found"})
    }
}

module.exports = {create, findAll, findOne, update, destroy}
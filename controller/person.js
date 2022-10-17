const {Person, Room} = require('../models/index')
const bycript = require('bcryptjs')

async function create(req, res) {
    try {
        req.body.password = bycript.hashSync(req.body.password)
        req.body.isAdmin = false
        const newPerson = await Person.create(req.body)
        res.json(newPerson)
    }
    catch (err) {
        res.json(err)
    }
}

async function findAll(req, res) {
    if (!req.person.isAdmin)
        res.status(401).json({message: "unauthorized"})
    try {
        const allPeople = await Person.findAll()
        res.json(allPeople)
    }
    catch (err) {
        res.json(err)
    }
}

async function findOne(req, res) {
        if (!req.person.isAdmin)
            return res.status(401).json({message: "unauthorized"})

        const person = await Person.findByPk(req.params.id)

        if (person) {
            res.json(person)
        }
        else{
            res.status(404).json({message: "person not found"})
        }
}

async function update(req, res) {
    if (req.person.id != req.params.id && !req.person.isAdmin)
            return res.status(401).json({message: "unauthorized"})

    try {    
        const person = await Person.findByPk(req.params.id)
        person.update(req.body)
        res.json(person)
    }
    catch (err) {
        res.status(404).json({message: "person not found"})
    }
}

async function destroy(req, res) {
    if (req.person.id != req.params.id && !req.person.isAdmin)
            return res.status(401).json({message: "unauthorized"})

    try {    
        const person = await Person.findByPk(req.params.id)
        person.destroy()
        res.json({message: "sucess"})
    }
    catch (err) {
        res.status(404).json({message: "person not found"})
    }
}

async function enterRoom(req, res) {
    const person = await Person.findByPk(req.person.id)

    if (!person)
        return res.status(404).json({message: "person not found"})
    
    const room = await Room.findOne({where: {code: req.params.roomCode}})

    if (!room)
        return res.status(404).json({message: "room not found"})

    person.setRoom(room)
    person.save()
    
    res.json(person)
}

module.exports = {create, findAll, findOne, update, destroy, enterRoom}
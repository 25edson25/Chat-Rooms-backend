const {Person, Room} = require('../models/index')
const bycript = require('bcryptjs')

async function create(req, res) {
    try {
        if(!req.body.name)
            return res.status(400).json({message:"name is required"})
         
        if(!req.body.email)
            return res.status(400).json({message:"email is required"})

        if(!req.body.password)
            return res.status(400).json({message:"password is required"})

        req.body.password = bycript.hashSync(req.body.password)
        req.body.isAdmin = false
        const newPerson = await Person.create(req.body)
        res.json({message: 'ok'})
    }
    catch (err) {
        res.status(409).json({message:"email already in use"})
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
        person.update(req.body.name)
        res.json({
            id: person.id,
            name: person.name
        })
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
const dotenv = require('dotenv/config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {Person} = require('../models/index')

async function login (req, res) {
    const person = await Person.findOne({where: {email: req.body.email}})

    if (!person) 
        return res.status(404).json({message: "user not found"})

    if (!bcrypt.compareSync(req.body.password, person.password))
        return res.status(401).json({message: "incorrect password"})

    const token = jwt.sign(
        {
            id: person.id,
            name: person.name,
            email: person.email,
            password: person.password,
            isAdmin: person.isAdmin
        },
        process.env.SECRET,
        {
            expiresIn: 2400
        })
    res.json({token})
}

async function verifyJWT (req, res, next) {

    let token;
    try {
        token = req.headers['authorization'].split(" ")[1]
    }
    catch (err) {
        return res.status(401).json({message: "No token provided"})
    }
    
    jwt.verify(token, process.env.SECRET, (err, person) => {
        if (err)
            return res.status(401).json({message: "Failed to authenticate token"})
        
        req.person = person
        next()
    })
}

module.exports = {login, verifyJWT}
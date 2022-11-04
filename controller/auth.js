const dotenv = require('dotenv/config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {Person} = require('../models/index')

async function login (req, res) {
    const findedPerson = await Person.findOne({where: {email: req.body.email}})
    console.log(findedPerson)
    console.log(!findedPerson)

    if (!findedPerson) 
        return res.status(404).json({message: "user not found"})

    if (!bcrypt.compareSync(req.body.password, findedPerson.password))
        return res.status(401).json({message: "incorrect password"})

    const person = {
        id: findedPerson.id,
        name: findedPerson.name,
        email: findedPerson.email,
        isAdmin: findedPerson.isAdmin
    }

    const token = jwt.sign(
        {
            ... person,
            password: findedPerson.password
        },
        process.env.SECRET,
        {
            expiresIn: 2400
        })  
    res.json({person, token})
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
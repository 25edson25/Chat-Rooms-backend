const express = require('express')
const auth = require('./controller/auth')
const Person = require('./controller/person')
const Room = require('./controller/room')
const Message = require('./controller/message')

const routes = express.Router()

routes.post('/login', auth.login)

// Person
routes.post(`/person`, Person.create)
routes.get(`/person`, auth.verifyJWT, Person.findAll)
routes.get(`/person/:id`, auth.verifyJWT, Person.findOne)
routes.put(`/person/:id`, auth.verifyJWT, Person.update)
routes.delete(`/person/:id`, auth.verifyJWT, Person.destroy)
routes.put(`/person/:personId/enter/room/:roomId`, auth.verifyJWT, Person.enterRoom)

// Room
routes.post(`/room`, auth.verifyJWT, Room.create)
routes.get(`/room`, auth.verifyJWT, Room.findAll)
routes.get(`/room/:id`, auth.verifyJWT, Room.findOne)
routes.put(`/room/:id`, auth.verifyJWT, Room.update)
routes.delete(`/room/:id`, auth.verifyJWT, Room.destroy)

// Message
routes.post(`/message`, auth.verifyJWT, Message.create)
routes.get(`/message`, auth.verifyJWT, Message.findAll)
routes.get(`/message/:id`, auth.verifyJWT, Message.findOne)
routes.put(`/message/:id`, auth.verifyJWT, Message.update)
routes.delete(`/message/:id`, auth.verifyJWT, Message.destroy)
routes.get(`/room/:id/message`, auth.verifyJWT)

module.exports = routes
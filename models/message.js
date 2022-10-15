const Sequelize = require('sequelize')
const database = require('../db')
const Person = require('./person')
const Room = require('./room')

const Message = database.define('Message', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        unique: true
    },
    message: {
        type: Sequelize.TEXT,
        allowNull: false
    }
})

Message.belongsTo(Person, {
    as: 'Sender',
    allowNull: false
})
Person.hasMany(Message, {
    as: 'Sender',
    allowNull: false
})

Message.belongsTo(Room, {
    allowNull: false
})
Room.hasMany(Message, {
    allowNull: false
})

module.exports = Message
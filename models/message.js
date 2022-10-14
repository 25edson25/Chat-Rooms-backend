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
    foreignKey: 'sender',
    allowNull: false
})
Person.hasMany(Message, {
    foreignKey: 'sender',
    allowNull: false
})

Message.belongsTo(Room, {
    foreignKey: 'room',
    allowNull: false
})
Room.hasMany(Message, {
    foreignKey: 'room',
    allowNull: false
})

module.exports = Message
const Sequelize = require('sequelize')
const database = require('../db')
const Room = require('./room')

const Person = database.define('Person', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        unique: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        default: false
    }
})

Person.belongsTo(Room, {
    foreignKey: 'room',
})
Room.hasMany(Person, {
    foreignKey: 'room'
})

module.exports = Person
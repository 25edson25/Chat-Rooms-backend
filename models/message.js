const Sequelize = require('sequelize')
const database = require('../db')

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

module.exports = Message
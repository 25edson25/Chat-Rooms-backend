const Sequelize = require('sequelize')
const dotenv = require('dotenv/config')

const sequelize = new Sequelize(process.env.DATABASE_URL)

module.exports = sequelize
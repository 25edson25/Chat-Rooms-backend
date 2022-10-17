const Person = require('./person')
const Message = require('./message')
const Room = require('./room')

Person.belongsTo(Room)
Room.hasMany(Person)


Message.belongsTo(Person, {
    as: 'Sender',
    foreignKey: 'SenderId',
    allowNull: false
})
Person.hasMany(Message, {
    as: 'Sender',
    foreignKey: 'SenderId',
    allowNull: false
})


Message.belongsTo(Room, {
    allowNull: false
})
Room.hasMany(Message, {
    allowNull: false
})

module.exports = {Person, Room, Message}
const dotenv = require('dotenv/config')
const express = require("express")
const app = express()
const routes = require("./routes")
const db = require('./db')
const cors = require('cors')
const helmet = require('helmet')
const {handlers, verifySocket} = require("./services/socket")
const http = require('http').Server(app)
const { Server } = require("socket.io")

const io = new Server (http, {
    cors: {
        origin: "*"
    }
})

io.use(verifySocket)

const onConnection = (socket) => {
    handlers(io, socket)
}

io.on('connection', onConnection)

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(routes)

db.sync()

http.listen(process.env.PORT, () => {
    console.log("Escutando")
})
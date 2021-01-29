const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// io is socket wrapping the server
io.on('connection', (socket) => {
    //On a new connection console.log new connection
    console.log('New connection')
    // on a new connection send a welcome message
    socket.emit('message', 'Welcome!')
    // on a new connection boracast a new user connection
    socket.broadcast.emit('message', 'A new user has joined')
    //listen to sendMessage and emit or send it to every user with io.emit
    socket.on('sendMessage', (message) => {
        io.emit('message', message)
    })

    //listen to sendPositon and send it to every user
    socket.on('sendPosition', (position) => {
        io.emit('message', `https://google.com/maps?q=${position.latitude},${position.longitude}`)
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left')
    })

  
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})



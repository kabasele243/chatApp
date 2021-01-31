const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateUrl } = require('./utils/messages')
const { addUser, getUser, removeUser, getUsersInRoom } = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// io is socket wrapping the server whenever someon hit the server from the client the handshake happen
io.on('connection', (socket) => {
    //On a new connection console.log new connection
    console.log('New connection')

//Listening to the event join sending from the client with the user and room name
    socket.on('join', ({ username, room},  callback) => {

        const { error, user} = addUser({id: socket.id, username, room})
        if(error) {
            return callback(error)
        }

        socket.join(user.room)
        // on a new connection send a welcome message
        socket.emit('message', generateMessage(`Welcome`, 'Admin'))
        // on a new connection boracast a new user connection
        socket.broadcast.to(room).emit('message', generateMessage(`${user.username} has joined`, 'Admin'))
        
        io.to(user, room ).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    //listen to sendMessage and emit or send it to every user with io.emit
    socket.on('sendMessage', (message, username, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(message, user.username))
        callback('Delivered')
    })

    //listen to sendPositon and send it to every user
    socket.on('sendPosition', (position, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateUrl(`https://google.com/maps?q=${position.latitude},${position.longitude}`, user.username ))
        callback()
    })

    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

  
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})



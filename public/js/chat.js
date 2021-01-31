const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationSend = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

socket.on('message', (message) => {
      
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (message) => {
    console.log(message.url)
    const html = Mustache.render(locationMessageTemplate,{
        username: message.username,
        url : message.url,
        createdAt: moment(message.createdAt).format('h:m a')
    })
    $messages.insertAdjacentHTML('beforeend', html)

})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, username, (error) => {

        $messageFormButton.removeAttribute('disabled'),
        $messageFormInput.value = " ",
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('Message delivered')
    })
})


$locationSend.addEventListener('click', () => {

    if(!navigator.geolocation){
        return alert('Geolocation is not support by your browser')
    }

    $locationSend.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)
        socket.emit('sendPosition', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $locationSend.removeAttribute('disabled')
            console.log('Location Shared')
        })
    })
})

socket.emit('join', {username, room}, (error) => {
        if(error) {
            alert(error) 
                location.href = '/'
            
        }
})
const socket = io()

const message = document.getElementById('message'),
    handle = document.getElementById('handle'),
    output = document.getElementById('output'),
    typing = document.getElementById('typing'),
    button = document.getElementById('button')


//send menssage to clients
button.addEventListener('click', () => {
    socket.emit('userMessage', {
        handle: handle.value,
        message: message.value
    })
    document.getElementById('message').value = ''
})

//send typing message
message.addEventListener('keypress', () => {
    socket.emit('userTyping', handle.value)
})

//listen for events from the server
socket.on('userMessage', data => {
    typing.innerHTML = ''
    output.innerHTML += `<p> <strong>${data.handle}: </strong> ${data.message}</p>`
})

socket.on('userTyping', data => {
    typing.innerHTML = `<p><em>${data} is typing...</em></p>`
})

/* Video Chat */

//get the local video and display it with permission
function getLocalVideo(callbacks) {
    //navigator.mediaDevices.getUserMedia() = navigator.mediaDevices.getUserMedia() || navigator.mediaDevices.webkitGetUserMedia() || navigator.mediaDevices.mozGetUserMedia()
    //navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.mediaDevices.getUserMedia

    var constraints = {
        audio: true,
        video: true
    }

    //navigator.getUserMedia(constraints, callbacks.success, callbacks.error)
    navigator.mediaDevices.getUserMedia(constraints)
        .then(callbacks.success)
        .catch(callbacks.error)
}

function receiveStream(stream, elementId) {
    var video = document.getElementById(elementId)

    video.srcObject = stream

    window.peer_stream = stream
}

getLocalVideo({
    success: function(stream){
        window.localstream = stream
        receiveStream(stream, 'localVideo')
    },
    error: function(err){
        alert('cannot access your camera')
        console.log(err)
    }
})

var conn, peer_id

//create a peer connection with peer object
var peer = new Peer()

//display the peer id on the DOM
peer.on('open', function(id) {
    document.getElementById('displayId').innerHTML = id
});

peer.on('connection', function(connection){
    conn = connection
    peer_id = connection.peer

    document.getElementById('connect_id').value = peer_id
})

peer.on('error', function(err){
    alert(`an error has happened ${err}`)
    console.log(err)
})

//onclick with the connection button = expose ice info
document.getElementById('connection_button').addEventListener('click', function(){
    peer_id = document.getElementById('connect_id').value

    if(peer_id){
        conn = peer.connect(peer_id)
    }else{
        alert('enter an id')
        return false
    }
})

//call on click (offer and answer is exchanged)
peer.on('call', function(call){

    var acceptCall = confirm("Do you want to answer this call?") || true
    
    if(acceptCall){
        call.answer(window.localstream)

        call.on('stream', function(stream){
            window.peer_stream = stream

            receiveStream(stream, 'remoteVideo')
        })

        call.on('close', function(){
            alert('The call has behind')
        })
    }else{
        console.log('call denied')
    }
})

//ask to call
document.getElementById('call_button').addEventListener('click', function(){
    console.log(`calling a peer: ${peer_id}`)
    console.log(peer)

    var call = peer.call(peer_id, window.localstream)

    call.on('stream', function(stream){
        window.peer_stream = stream

        receiveStream(stream, 'remoteVideo')
    })
})

//accept the call

//display the remote and local video on the clients
var socket = io();
var name = $("#userName").text();
var avatar =$(".avatar").attr('src');
var contacts = [];
var timeout = 3000;


function scroll_to(div){
    if (div.scrollTop < div.scrollHeight - div.clientHeight) {
        div.scrollTop += 10; // move down
    }

}

$('form').submit(function(e) {
    e.preventDefault(); // prevents page reloading
    var formData = $(this).serialize();
    var formAction = $(this).attr('action');
	var msg = $('#m').val();
	if(msg !== ""){
		$.post(formAction, formData, (data)=>{
        console.log(data)
    })
    socket.emit('chat message', msg);
    $('#m').val('');
    return false;	
	}
});

$('form').keyup((e)=>{
    e.preventDefault();
    if(e.which!=13) {
        if ($('.isTyping').text() === "") {
            socket.emit('typing', name);
        }
    }
})

socket.emit('newUser', name);

socket.on('user-connected', function(userName){

    $('#messages').append($('<li class="list-group-item mb-3 align-self-start list-group-item connected-message">').text(userName + " is connected"));
    $('.messages-container').animate({scrollTop: 9999});

});

socket.on('user-online', function(userName){

    $(".contacts-container li:contains('"+userName+"')").css('background','linear-gradient(to right, #52c234, #061700)')

});


socket.on("scroll",()=>{
    $('.messages-container').animate({scrollTop: 9999});
})

socket.on('chat message', function(data){
    if(data.name != name){
        $('.isTyping').remove()
        $('#messages').append($('<li class="list-group-item mb-3 align-self-end list-group-item othermessage m-3">').text(data.name + " : " + data.message));
    }else{
        $('.isTyping').remove()
        $('#messages').append($('<li class="list-group-item mb-3 align-self-start list-group-item mymessage m-3">').text(data.name + " : " + data.message));
    }
    $('.messages-container').animate({scrollTop: 9999});
});

socket.on("user-typing", (userName)=>{
    $('.isTyping').remove()
    $('#messages').append($('<li class="isTyping list-group-item mb-3 align-self-start list-group-item-dander">').text(userName + " typing..."));
    $('.messages-container').animate({scrollTop: 9999});

    setTimeout(() => {
        $('.isTyping').remove()
    }, timeout)
})


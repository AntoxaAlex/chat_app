var socket = io();
var name = $("#userName").text();

function scroll_to(div){
    if (div.scrollTop < div.scrollHeight - div.clientHeight) {
        div.scrollTop += 10; // move down
    }

}

$('form').submit(function(e) {
    e.preventDefault(); // prevents page reloading
    var formData = $(this).serialize();
    var formAction = $(this).attr('action');
    $.post(formAction, formData, (data)=>{
        console.log(data)
    })
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
});

socket.emit('new-user', name);

socket.on('user-connected', function(name){
    $('#messages').append($('<li class="list-group-item mb-3 align-self-start list-group-item-info">').text(name + " is connected"));
});

socket.on("scroll",()=>{
    $('.messages-container').animate({scrollTop: 9999});
})

socket.on('chat message', function(data){
    if(data.name != name){
        console.log(name + " tessafdasfdt");
        $('#messages').append($('<li class="list-group-item mb-3 align-self-end list-group-item-secondary">').text(data.name + " : " + data.message));
    }else{
        console.log(data.name)
        $('#messages').append($('<li class="list-group-item mb-3 align-self-start list-group-item-info">').text(data.name + " : " + data.message));
    }
    $('.messages-container').animate({scrollTop: 9999});
});

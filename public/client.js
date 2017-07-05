$(function() {
  var socket = io();  
  $('.user').submit(function () {
    socket.emit('user connection', $('#u').val());
    $('#m').val('');
    return false;
  });
  socket.on('chat message', function(msg) {
    $('#messages').append($('<li>').text(msg));
  });
  socket.on('user connection', function(msg) {
    $('#messages').append($('<li>').text(msg));
  });
  $('.chat').submit(function(){
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });
});

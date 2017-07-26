var app = angular.module('room', []);
app.value('roomId', window.location.pathname.slice(3));
app.controller('RoomCtrl', ['$scope', 'roomId', '$filter', function($scope, roomId, $filter) {
  var msgContainer = document.getElementById('messages'),
  socket = io('/' + roomId, {transports: ['websocket']});
  $scope.setDisplayName = function() {
    if ($scope.nameField) {
      $scope.displayName = $scope.nameField;
      socket.emit('join room', $scope.displayName);
      socket.on('push message', function(data) {
        var msg = postMessage(data, $filter);
        angular.element(msgContainer).prepend(msg);
        window.scrollTo(0, document.body.scrollHeight);

      });
      socket.on('push notification', function(data) {
        var msg = postNotification(data, $filter);
        angular.element(msgContainer).prepend(msg);
        window.scrollTo(0, document.body.scrollHeight);
      });

    } else {
      $scope.errorMessage = 'Enter a name';
    }
  };
  $scope.sendMessage = function() {
    if ($scope.message) {
      socket.emit('send message', $scope.message);
      $scope.message = '';
    }
  };
  socket.on('load messages', function(data) {
    var msg;
    if (data) {
      for (var i = 0; i < data.length; i++) {
        var dataMsg = JSON.parse(data[i]);
        if (dataMsg.type === 'message') {
          msg = postMessage(dataMsg, $filter);
        } else {
          msg = postNotification(dataMsg, $filter);
        }
        angular.element(msgContainer).prepend(msg);
        window.scrollTo(0, document.body.scrollHeight);
      }
    }
  });
}
]);

function postMessage(data, $filter) {
  return (
    '<div class="post">' + 
    '<div class="avatar" style="background-color: ' + data.color + '">' + data.user.charAt(0) + '</div>' + 
    '<div class="message">' + 
    '<p>' + 
    '<span class="messageUser">' + data.user + '</span> ' + 
    '<span class="messageDate">' + $filter('date')(data.time, 'short') + '</span>' +
    '</p>' +
    '<p class="messageContent">' + data.message + '</p>' + 
    '</div>' +
    '</div>'
  );
}
function postNotification(data, $filter) {
  return (
    '<div class="notification">' + 
    '<p class="notificationMessage">' + '<span style="color:' + data.color + '">' + data.user + '</span> ' + data.message + '</p>' +
    '<p class="notificationDate">' + $filter('date')(data.time, 'short') + '</p>' +
    '</div>'
  );
}

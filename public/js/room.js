angular.module('room', [])
  .value('roomId', window.location.pathname.slice(3))
  .controller('RoomCtrl', ['$scope', 'roomId', '$filter', 
    function($scope, roomId, $filter) {
      var msgContainer = document.getElementById('messages'),
          socket = io('/' + roomId);
      $scope.setDisplayName = function() {
        if ($scope.nameField) {
          $scope.displayName = $scope.nameField;
          socket.emit('join room', $scope.displayName);
        } else {
          $scope.errorMessage = 'Enter a name';
        }
      };
      $scope.sendMessage = function() {
        if ($scope.message) {
          socket.emit('send message', {
            user: $scope.displayName,
            message: $scope.message,
            time: new Date()
          });
          $scope.message = '';
        }
      };
      socket.on('push message', function(data) {
        var msg = (
          '<div class="post">' + 
            '<div class="avatar">' + data.user.charAt(0) + '</div>' + 
            '<div class="message">' + 
              '<p>' + 
                '<span class="messageUser">' + data.user + '</span> ' + 
                '<span class="messageDate">' + $filter('date')(data.time, 'short') + '</span>' +
              '</p>' +
              '<p class="messageContent">' + data.message + '</p>' + 
            '</div>' +
          '</div>'
        );
        angular.element(msgContainer).append(msg);
      });
      socket.on('push notification', function(data) {
        var msg = (
          '<div class="notification">' + 
            '<p class="notificationMessage">' + data.user + data.message + '</p>' +
            '<p class="notificationDate">' + $filter('date')(data.time, 'short') + '</p>' +
          '</div>'
        );
        angular.element(msgContainer).append(msg);
      });
    }
  ]);

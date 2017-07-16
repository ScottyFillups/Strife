angular.module('cubby', [])
  .value('cubbyId', window.location.pathname.slice(3))
  .controller('CubbyCtrl', ['$scope', 'cubbyId', 
    function($scope, cubbyId) {
      var msgContainer = document.getElementById('messages'),
          socket = io('/' + cubbyId);
      $scope.nameSet = false;
      $scope.setDisplayName = function() {
        if ($scope.displayName) {
          socket.emit('join room', $scope.displayName);
          $scope.nameSet = true;
        } else {
          $scope.errorMessage = 'Enter a name';
        }
      };
      $scope.sendMessage = function() {
        if ($scope.message) {
          socket.emit('send message', {
            user: $scope.displayName,
            message: $scope.message
          });
          $scope.message = '';
        }
      };
      socket.on('push message', function(data) {
        var msg = '<p class="message">' + data + '</p>';
        angular.element(msgContainer).append(msg);
      });
    }
  ]);

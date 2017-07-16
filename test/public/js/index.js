var socket = io('/lobby');
angular.module('landingPage', [])
  .controller('UrlGeneratorCtrl', ['$scope', function($scope) {
    $scope.url = '';
    $scope.generateRoom = function() {
      socket.emit('request room');
    };
    socket.on('room generated', function(data) {
      $scope.$apply(function() {
        $scope.url = data;
      });
    });
  }]);

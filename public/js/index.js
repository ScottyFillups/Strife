var socket = io('/lobby', {transports: ['websocket']});
angular.module('landingPage', [])
  .controller('UrlGeneratorCtrl', ['$scope', function($scope) {
    //ill make a factory later
    var quoteDom = document.getElementById('quote');
    var authorDom = document.getElementById('author');
    var linkDom = document.getElementById('room-url');
    $scope.url = '';
    $scope.generateRoom = function() {
      socket.emit('request room');
    };
    socket.on('room generated', function(data) {
      //apply is necessary when doing callbacks
      $scope.$apply(function() {
        $scope.url = data;
      });
      angular.element(linkDom).css('opacity', 1);
    });
    socket.on('daily quote', function(data) {
      if (!data) {
        data = {};
        data.quote = 'IT\'S TIME TO STOP';
        data.author = 'Filthy Frank';
      }
      angular.element(quoteDom).html(data.quote);
      angular.element(authorDom).html('&mdash; ' + data.author);
    });
  }]);

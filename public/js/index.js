var socket = io('/lobby', {transports: ['websocket']});
angular.module('landingPage', [])
  .controller('UrlGeneratorCtrl', ['$scope', '$window', '$http', function($scope, $window, $http) {
    //ill make a factory later
    var quoteDom = document.getElementById('quote');
    var authorDom = document.getElementById('author');
    var linkDom = document.getElementById('room-url');

    $scope.login = function(token) {
      $http({
        method: 'POST',
        url: '/recaptcha',
        data: token,
        headers: {'Content-Type': 'text/plain'}
      }).then(function(res) {
        $scope.$applyAsync(function() {
          $window.location.replace(window.location.href + res.data);
        });
      }, function(err) {
        console.log(err);
      });
    };
    $window.login = $scope.login;

    $scope.url = '';
    socket.on('daily quote', function(data) {
      angular.element(quoteDom).html(data.quote);
      angular.element(authorDom).html('&mdash; ' + data.author);
    });
  }]);

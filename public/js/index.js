var socket = io('/lobby', {transports: ['websocket']});
angular.module('landingPage', [])
  .controller('UrlGeneratorCtrl', ['$scope', '$window', '$http', function($scope, $window, $http) {
    //ill make a factory later
    var quoteDom = document.getElementById('quote');
    var authorDom = document.getElementById('author');
    var linkDom = document.getElementById('room-url');

    $scope.login = function(token) {
      console.log(token);
      $http({
        method: 'POST',
        url: '/recaptcha',
        data: token,
        headers: {'Content-Type': 'text/plain'}
      }).then(function(res) {
        console.log(res.data);
        $scope.$applyAsync(function() {
          $scope.url = res.data;
        });
        angular.element(linkDom).css('opacity', 1);
      }, function(err) {
        alert(err);
      });
    };
    $window.login = $scope.login;

    $scope.url = '';
    socket.on('daily quote', function(data) {
      angular.element(quoteDom).html(data.quote);
      angular.element(authorDom).html('&mdash; ' + data.author);
    });
  }]);

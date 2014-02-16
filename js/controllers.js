var logifierApp = angular.module('logifierApp', []);

logifierApp.factory('logService', ['$http', function(http) {
	return new logService(http, config);
}]);

logifierApp.controller('logsController', function ($scope, logService) {
	$scope.logs = logService.getLogs();
});
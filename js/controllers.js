var logifierApp = angular.module('logifierApp', []);

logifierApp.factory('logService', ['$http', '$q', function(http, q) {
	return new LogService(http, q, config);
}]);

logifierApp.controller('logsController', function ($scope, logService) {
    logService.getLogs().then(function(promise) {
		$scope.logs = promise;
	});
});
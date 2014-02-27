var logifierApp = angular.module('logifierApp', []);

logifierApp.factory('logService', ['$http', '$q', function(http, q) {
	return new logService(http, q, config);
}]);

logifierApp.controller('logsController', function ($scope, logService) {
	var logs = [];

	logService.getLogs().then(function(promise) {
		$scope.logs = promise;
		
		var properties = Object.getOwnPropertyNames(logs[0]);
		var titles = [];
		properties.forEach(function(item) {
			titles.push(item.Humanize());
		});

		$scope.logs.titles = titles;
	});
	$scope.hasError = logService.hasError;
});
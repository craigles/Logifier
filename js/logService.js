function LogService(http, deferred, config) {

	this.getLogs = function () {
        var def = deferred.defer();
        http.get(config.endpoint).success(function (data) {

            var logs = [];
            var responses = getResponses(data);
            var requests = getRequests(data);

            requests.forEach(function (req) {
                var response = findResponse(responses, req.SessionId);

                if (!response)
                    return;

                logs.push({
                    DateTime: req.DateTime,
                    MessageName: req.ServiceName,
                    MemberNumber: req.MemberNumber,
                    HasError: hasError(response.Response),
                    Request: req.Request,
                    Response: format(response.Response)
                });
            });

            def.resolve(logs);
        });

        return def.promise;
    };

	var hasError = function (xml) {
        return xml.match(/<\/ERROR>/) != null;
    };

	var getServiceName = function (xml) {
        return xml.match(/name="(.*)" version/)[1];
    };

	var getMemberNumber = function (xml) {
        var memberNumber = xml.match(/MEMBER_NUMBER>(.*)<\/MEMBER_NUMBER/)[1];
        return memberNumber === "" ? "N/A" : memberNumber;
    };

	var getSessionId = function (xml) {
        return xml.match(/session="(.*)" uid/)[1];
    };

	var format = function (xml) {
        return xml.replace(/>\s*</g, ">\n<");
    };

	var getResponses = function (data) {
        var startTagIndices = getIndices(data, /<RESPONSE\s/gi);
        var endTagIndices = getIndices(data, /<\/RESPONSE>/gi);
        var responses = [];

        for (var i = 0; i < startTagIndices.length; i++) {

            var response = data.substring(startTagIndices[i], endTagIndices[i] + 11);

            responses.push({
                Response: response,
                SessionId: getSessionId(response)
            });
        }

        return responses;
    };

	var getRequests = function (data) {
        var startTagIndices = getIndices(data, /<REQUEST\s/gi);
        var endTagIndices = getIndices(data, /<\/REQUEST>/gi);
        var requests = [];

        for (var i = 0; i < startTagIndices.length; i++) {
            var request = data.substring(startTagIndices[i], endTagIndices[i] + 10);

            requests.push({
                Request: format(request),
                DateTime: new Date(data.substring(endTagIndices[i] + 12, endTagIndices[i] + 31)),
                MemberNumber: getMemberNumber(request),
                ServiceName: getServiceName(request),
                SessionId: getSessionId(request)
            });
        }
        return requests;
    };

	var findResponse = function (responses, sessionId) {
        var response = null;
        responses.forEach(function (res) {
            if (res.SessionId === sessionId)
                response = res;
        });
        return response;
    };

	var getIndices = function(string, regex) {
		var result, indices = [];

	    while ((result = regex.exec(string))) {
		    indices.push(result.index);
		}

		return indices;
	}
}








function logService(http, config) {
	this.http = http;
	this.config = config;

	this.getLogs = function() {
		http.get(config.endpoint).success(function(data) {
	    	var lastClass = "";
	    	var lastRequestTime = 0;
	    	
	    	var responses = getResponses(data);
	    	var requests = getRequests(data);

			requests.forEach(function(req) {
				var response = findResponse(responses, req.SessionId);

				if (!response)
					return;

				var newRequestTime = Date.parse(req.Time);
				lastClass = getRowClass(lastRequestTime, newRequestTime, lastClass);
				lastRequestTime = newRequestTime;

				//todo return synchronously!
			});
	    });
	}
}
	

function getServiceName(xml) {
	return xml.match(/name="(.*)" version/)[1];
}

function getMemberNumber(xml) {
	var memberNumber = xml.match(/MEMBER_NUMBER>(.*)<\/MEMBER_NUMBER/)[1];
	return memberNumber === "" ? "N/A" : memberNumber;
}

function getSessionId(xml) {
	return xml.match(/session="(.*)" uid/)[1];
}

function formatRequest(xml) {
	return xml.replace(/></g, ">\n<");
}

function getRowClass(lastRequestTime, newRequestTime, lastClass) {
	var threshold = 3000;

	if (lastClass === "")
		return "info";

	var isNewRequest = newRequestTime > (lastRequestTime + threshold);

	if (isNewRequest)
		return lastClass === "" ? "info" : "";

	return lastClass;
}

function getResponses(data) {
	var startTagIndices = getIndices(data, /<RESPONSE\s/gi);
    var endTagIndices = getIndices(data, /<\/RESPONSE>/gi);
    var responses = [];

    for (i in startTagIndices) {
    	var response = data.substring(startTagIndices[i], endTagIndices[i]+11);

    	responses.push({
    		Response: response,
    		SessionId: getSessionId(response)
    	});
    }

    return responses;
}

function getRequests(data) {
	var startTagIndices = getIndices(data, /<REQUEST\s/gi);
    var endTagIndices = getIndices(data, /<\/REQUEST>/gi);
    var requests = [];

    for (i in startTagIndices) {
    	var request = data.substring(startTagIndices[i], endTagIndices[i]+10);

    	requests.push({
    		Request: request,
    		Time: data.substring(endTagIndices[i]+12, endTagIndices[i]+32),
    		MemberNumber: getMemberNumber(request),
    		ServiceName: getServiceName(request),
    		SessionId: getSessionId(request)
    	});
    }
    return requests;
}

function findResponse(responses, sessionId) {
	var response;
	responses.forEach(function(res) {
		if (res.SessionId === sessionId)
			response = res;
	});
	return response;
}

function getIndices(string, regex) {
	var result, indices = [];

    while ((result = regex.exec(string))) {
	    indices.push(result.index);
	}

	return indices;
}
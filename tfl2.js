
var busStopInfoDiv = null;
var arrivalsInfoDiv = null;
var selectionInfoDiv = null;
var stopPointInfoDiv = null;

//
// HTTP request object
//

var searchReq = {
	resultCallback: null,
	statusCallback: null,
	
	request: function (url, resultCallback, statusCallback) {
		this.req = new XMLHttpRequest();
		//var url = "https://api.tfl.gov.uk/StopPoint/Search/" + text;
		this.req.onreadystatechange = this.status;
		this.resultCallback = resultCallback;
		this.statusCallback = statusCallback;
		this.req.open("GET", url, true);
		this.req.send();
	},
	status: function () {
		// NOTE: status() is called from XMLHTTPRequest() context
		if (searchReq.req.readyState == 4 && searchReq.req.status == 200) {
			var obj = JSON.parse(searchReq.req.responseText);
			searchReq.resultCallback(searchReq.req.status, obj);
		} else
			searchReq.statusCallback(searchReq.req);
	}
};

var arrivalsReq = {
	resultCallback: null,
	statusCallback: null,
	
	request: function (url, resultCallback, statusCallback) {
		this.req = new XMLHttpRequest();
		//var url = "https://api.tfl.gov.uk/StopPoint/" + id + "/Arrivals";
		console.log("arrivalsReq.request(): url", url);
		this.req.onreadystatechange = this.status;
		this.resultCallback = resultCallback;
		this.statusCallback = statusCallback;
		this.req.open("GET", url, true);
		this.req.send();
	},
	status: function () {
		// NOTE: status() is called from XMLHTTPRequest() context
		if (arrivalsReq.req.readyState == 4 && arrivalsReq.req.status == 200) {
			var obj = JSON.parse(arrivalsReq.req.responseText);
			arrivalsReq.resultCallback(arrivalsReq.req.status, obj);
		} else
			arrivalsReq.statusCallback(arrivalsReq.req);
	}
};

var stopPointReq = {
	resultCallback: null,
	statusCallback: null,
	
	request: function (url, resultCallback, statusCallback) {
		this.req = new XMLHttpRequest();
		//var url = "https://api.tfl.gov.uk/StopPoint/" + id;
		console.log("stopPointReq.request(): url", url);
		this.req.onreadystatechange = this.status;
		this.resultCallback = resultCallback;
		this.statusCallback = statusCallback;
		this.req.open("GET", url, true);
		this.req.send();
	},
	status: function () {
		// NOTE: status() is called from XMLHTTPRequest() context
		if (stopPointReq.req.readyState == 4 && stopPointReq.req.status == 200) {
			var obj = JSON.parse(stopPointReq.req.responseText);
			stopPointReq.resultCallback(stopPointReq.req.status, obj);
		} else
			stopPointReq.statusCallback(stopPointReq.req);
	}
};

function getStopPointSearchUrl(text)
{
	return "https://api.tfl.gov.uk/StopPoint/Search/" + text;
}

function getStopPointInfoUrl(id)
{
	return "https://api.tfl.gov.uk/StopPoint/" + id;
}

function getStopPointArrivalsUrl(id)
{
	return getStopPointInfoUrl(id) + "/Arrivals";
}

//
// Arrival predictions functionality and callbacks
//

function arrivalsError(status)
{
	console.log("ArrivalsError(", status, ")");
}

function arrivalPredictionsResultCb(status, arrivalsObj)
{
	if (status == 200) {
		displayArrivalsInfo(arrivalsObj);
	} else {
		arrivalsError(status);
	}
}

function arrivalPredictionsStatusCb(req)
{
	//console.log("arrivalPredictionsStatusCb(", req, ")");
}

function requestArrivalPredictions(id)
{
	arrivalsReq.request(getStopPointArrivalsUrl(id), arrivalPredictionsResultCb, arrivalPredictionsStatusCb);
}

//
// Search functionality and callbacks
//

function extractLineNames(lines)
{
	var names = [];
	for (var l of lines) {
		if (l.name) {
			names.push(capitalise(l.name));
		}
	}
	return names;
}

function extractBusStopInfoFromMatches(obj)
{
	var ret = [];
	console.log(obj);
	if (obj.matches) {
		for (var match of obj.matches) {
			if (!match.id) {
				console.log("extractBusStopInfoFromMatches(): id not in match");
			} else {
				var obj = {};
				obj.id = match.id;
				if (match.towards) {
					obj.towards = match.towards;
				}
				if (match.name) {
					obj.name = match.name;
				}
				if (match.stopLetter) {
					obj.stopLetter = match.stopLetter;
				}
				if (match.lines && match.lines.length > 0) {
					obj.lines = extractLineNames(match.lines);
				}
				if (match.modes && match.modes.length > 0) {
					obj.modes = match.modes;
				}
				
				/* hack - we assume this mismatch means we can use "id" directly as arrivals id */
				if (match.topMostParentId && match.topMostParentId != match.id)
					obj.idUsable = true;
				else
					obj.idUsable = false;
				ret.push(obj);
			}
		}
	}
	return ret;
}

function requestTextSearchMatches(text)
{
	searchReq.request(getStopPointSearchUrl(text), searchResultCb, searchStatusCb);
}

function searchError(status)
{
	console.log("searchError(", status, ")");
}

function searchResultCb(status, matchesObj)
{
	if (status == 200) {
		var info = extractBusStopInfoFromMatches(matchesObj);
		if (info.length == 1 && info[0].idUsable) {
			displayBusStopInfo(info[0]);
			requestArrivalPredictions(info[0].id);
		} else {
			displaySelection(info);
		}
	} else
		searchError(status);
}

function searchStatusCb(req)
{
	//console.log("Search status: readyState", req.readyState, "status", req.status);
}

//
// HTML callbacks
//
function resetArrivalsDiv()
{
	arrivalsInfoDiv.innerHTML = "";
}

function resetStopPointDiv()
{
	stopPointInfoDiv.innerHTML = "";
}

function resetDivs()
{

	busStopInfoDiv.innerHTML = "";
	selectionInfoDiv.innerHTML = "";
	resetStopPointDiv();
	resetArrivalsDiv();
}

function searchOnChange(ev)
{
	resetDivs();
	requestTextSearchMatches(ev.target.value);
}

function bodyLoadedEvent(event)
{
	busStopInfoDiv = document.getElementById("busStopInfoDiv");
	arrivalsInfoDiv = document.getElementById("arrivalsInfoDiv");
	selectionInfoDiv = document.getElementById("selectionInfoDiv");
	stopPointInfoDiv = document.getElementById("stopPointInfoDiv");
}

//
// Display functions
//

function displayBusStopInfo(info)
{
	var s = "<br>";
	if (info.name)
		s += info.name;
	if (info.stopLetter)
		s += " (stop " + info.stopLetter + ")";
	if (info.lines) {
		s += "<br>" + info.lines.join(", ");
	}
	if (info.towards) {
		s += " - " + info.towards;
	}
	
	busStopInfoDiv.innerHTML = s;
}

function timeToStationStr(t)
{
	var min = Math.floor(t/60);
	var sec = t - (min * 60);
	var sec10 = Math.floor(sec / 10);
	sec = sec - (sec10 * 10);
	return "" + min + ":" + sec10 + sec;
}

function displayArrivalsInfo(info)
{
	console.log("displayArrivalsInfo(", info, ")");
	var s = '<br><table border="1">';
	info.sort(function(a,b) { return a.timeToStation - b.timeToStation; });
	for (var entry of info) {
		s += "<tr><td>" + entry.lineName + "<td>" + entry.destinationName + "<td>" + timeToStationStr(entry.timeToStation + 0) + "</tr>";
	}
	s += "</table>";
	arrivalsInfoDiv.innerHTML = s;
}


function onclickStopPoint(id)
{
	console.log("onclickStopPoint: ", id);
	resetArrivalsDiv();
	requestArrivalPredictions(id);
}

//
// Display StopPoint info
//

function capitalise(s)
{
	if (s && s.length > 0)
		return s.charAt(0).toUpperCase() + s.substring(1);
	else
		return s;
}

function lineIdentifierInfo(obj)
{
	var s = '';
	var first = true;
	for (var line of obj.lineIdentifier) {
		if (first) {
			s = capitalise(line);
			first = false;
		} else {
			s += ', ' + capitalise(line);
		}
	}
	return s;
}

function lineGroupInfo(arr)
{
	console.log('lineGroupInfo: ', arr);
	var s = '';
	if (arr.length > 1)
		alert("lineGroupInfo: more than one entry - taking first");
	obj = arr[0];
	if (obj.lineIdentifier && obj.lineIdentifier.length > 0) {
		var arrivalsId;
		if (obj.naptanIdReference)
			arrivalsId = obj.naptanIdReference;
		else
			arrivalsId = obj.stationAtcoCode ? obj.stationAtcoCode : '';
		s = lineIdentifierInfo(obj);
	}
	return { str: s, id: arrivalsId };
	
}

function parseAdditionalProperties(obj)
{
	var info = {};
	if (obj.additionalProperties && obj.additionalProperties.length > 0) {
		for (var prop of obj.additionalProperties) {
			if (prop.category) {
				switch (prop.category) {
				case "Geo":
					if (prop.key && prop.key == "Zone") {
						info.zone = prop.value;
					}
					break;
				case "Direction":
					if (prop.key) {
						switch (prop.key) {
						case "CompassPoint":
							info.direction = prop.value;
							break;
						case "Towards":
							info.towards = prop.value;
							break;
						}
					}
					break;
				default:
					break;
				}
			}
		}
	}
	return info;
}

function displayStopPointLeafInfo(obj)
{
	console.log('displayStopPointLeafInfo: ', obj);
	var s = "";
	var arrivalsId = null;
	if (obj.lineGroup && obj.lineGroup.length > 0) {
		if (obj.stopLetter)
			s += '<td>Stop ' + obj.stopLetter;
		else
			s += '<td>';
		var info = lineGroupInfo(obj.lineGroup);
		s += '<td>' + info.str + '<td>';
		arrivalsId = info.id;

		var props = parseAdditionalProperties(obj);
		var first = true;
		
		if (props.towards) {
			s += props.towards;
		} else
		if (props.direction)
			s += props.direction;
	}
	return { str: s, id: arrivalsId };
}

function walkChildren(obj)
{
	var s = "";
	if (obj.children && obj.children.length > 0) {
		for (var child of obj.children) {
			s += walkChildren(child);
		}
	} else {
		var info = displayStopPointLeafInfo(obj);
		s += '<tr onclick="onclickStopPoint(\'' + info.id + '\')">' + info.str + '</tr>';
	}
	return s;
}

function displayStopPointInfo(obj)
{
	console.log("displayStopPointInfo: ", obj);
	var s = '<br><table border="1">';
	s += walkChildren(obj);
	s += '</table>';
	stopPointInfoDiv.innerHTML = s;
}

function stopPointResultCb(status, stopPointObj)
{
	displayStopPointInfo(stopPointObj);
}

function stopPointStatusCb(req)
{
}

function onclickSelectionEvent(event, id)
{
	resetArrivalsDiv();
	resetStopPointDiv();
	stopPointReq.request(getStopPointInfoUrl(id), stopPointResultCb, stopPointStatusCb);
}

//
// Display match info
//

function displaySelection(info)
{
	console.log("displaySelection: ", info);
	var s = '<br><table border="1">';
	for (var entry of info) {
		var modeStr = "";
		var first = true;
		for (var mode of entry.modes) {
			if (first) {
				modeStr = capitalise(mode);
				first = false;
			} else {
				modeStr += ', ' + capitalise(mode);
			}
		}
		s += '<tr onclick="onclickSelectionEvent(event, \'' + entry.id + '\')"><td>' + entry.name + "<td>" + modeStr + "</tr>";
	}
	s += "</table>";
	selectionInfoDiv.innerHTML = s;
}

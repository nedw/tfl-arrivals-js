//
// NOTES:
// Shepherds Bush Central line Stop Point information contains:
//		id: 9400ZZLUSBC1
//		lines: central
//		modes: tube
//		naptanId: 9400ZZLUSBC1
//		stationNaptan: 940GZZLUSBC
//		stopType: NaptanMetroPlatform
//
// and arrivals can be retrieved via:
//
//		https://api.tfl.gov.uk/StopPoint/940GZZLUSBC/Arrivals
//		https://api.tfl.gov.uk/Line/central/Arrivals/?stopPointId=940GZZLUSBC
//
// Hammersmith District line Stop Point information contains:
//
//		id: 9400ZZLUHSD1
//		lines: district
//		modes: tube
//		naptanId: 9400ZZLUHSD1
//		stationNaptan: 940GZZLUHSD
//		stopType: NaptanMetroPlatform
//	
// and arrivals can be retrieved via:
//
//		https://api.tfl.gov.uk/StopPoint/940GZZLUHSD/Arrivals
//		https://api.tfl.gov.uk/Line/district/Arrivals/?stopPointId=940GZZLUHSD
//
// Hammersmith H&C and Circle doesn't work

var DEBUG_DISPLAY = 1;
var DEBUG_REQUEST = 2;
var DEBUG_PARSE = 4;
var debug = 0;

var busStopInfoDiv = null;
var arrivalsInfoDiv = null;
var selectionInfoDiv = null;
var stopPointInfoDiv = null;
var searchTextEl = null;
var displayNightBuses = false;
var highlightedSelectionRow = null;
var highlightedStopPointRow = null;

var currentArrivalRequestId = null;
var currentStopPointInfo = null;

//
// HTTP Request instances
//

var searchReq = null;
var arrivalsReq = null;
var stopPointReq = null;

//
// HTTP request object
//

class Request {
	constructor() {
	}
	
	request(url, resultCallback, statusCallback) {
		this.resultCallback = resultCallback;
		this.statusCallback = statusCallback;
		
		this.httpReq = new XMLHttpRequest();
		this.httpReq.onreadystatechange = this.status;
		this.httpReq.req = this;
		
		this.httpReq.open("GET", url, true);
		this.timeSent = Date.now();
		this.httpReq.send();
	}
	
	status() {
		// NOTE: status() is called from XMLHTTPRequest() context
		if (this.readyState == 4 && this.status == 200) {
			var obj = JSON.parse(this.responseText);
			this.req.resultCallback(this.status, obj);
			this.req = null;				// reference no longer needed
		} else
			this.req.statusCallback(this);
	}
}

var readyStateNames = [ "", "(Opened)", "(Headers received)", "(Loading)", "(Done)" ];

function displayRequestStatus(div, req)
{
	if (req.readyState > 0 && req.readyState < readyStateNames.length ) {
		div.innerHTML = "<p>" + readyStateNames[req.readyState];
	}
}

//
// Functions for forming URLs
//

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

function unhighlightRow(ele)
{
	if (ele)
		ele.setAttribute("class", "");
}

function highlightRow(ele)
{
	if (ele) {
		ele.setAttribute("class", "highlight");
	}
}

//
// Arrival predictions functionality and callbacks
//

function arrivalsError(status)
{
	if (debug & DEBUG_REQUEST)
		console.log("ArrivalsError(", status, ")");
	setCurrentArrivalRequestId(null);
}

function addIdToString(id, s)
{
	arr = s.split(',');
	for (var i = 0 ; i < arr.length ; ++i) {
		console.log("setIdToString: " + i + ":" + arr[i]);
	}
	s += id + ",";
	console.log("setIdToString: s",s);
	return s;
}

function setCurrentArrivalRequestId(id)
{
	currentArrivalRequestId = id;
	/* localStorage */
}

function getcurrentArrivalRequestId()
{
	return currentArrivalRequestId;
}

function arrivalPredictionsResultCb(status, arrivalsObj)
{
	if (debug & DEBUG_REQUEST)
		console.log("arrivalPredictionsResultCb", arrivalsObj);
	arrivalsReq = null;					// reference no longer needed
	if (status == 200) {
		displayArrivalsInfo(arrivalsObj);
	} else {
		arrivalsError(status);
	}
}

function arrivalPredictionsStatusCb(req)
{
	//console.log("arrivalPredictionsStatusCb(", req, ")");
	displayRequestStatus(arrivalsInfoDiv, req);
}

function requestArrivalPredictions(id)
{
	if (debug & DEBUG_REQUEST)
		console.log("requestArrivalPredictions: id", id);
	setCurrentArrivalRequestId(id);
	arrivalsReq = new Request();
	arrivalsReq.request(getStopPointArrivalsUrl(id), arrivalPredictionsResultCb, arrivalPredictionsStatusCb);
}

function requestStopPointInfo(id)
{
	stopPointReq = new Request();
	stopPointReq.request(getStopPointInfoUrl(id), stopPointResultCb, stopPointStatusCb);
}

/********************
 * Search functions *
 ********************/
 
//
// Search HTML callbacks
//

function searchOnChange(ev)
{
	resetDivs();
	requestTextSearchMatches(ev.target.value);
}

function searchSubmitOnClick(ev)
{
	resetDivs();
	console.log(searchTextEl.value);
	requestTextSearchMatches(searchTextEl.value);
}

//
// Search result parsing
//

function getLineNames(lines)
{
	var names = [];
	for (var l of lines) {
		if (l.name) {
			names.push(capitalise(l.name));
		}
	}
	return names;
}

function getInfoFromSearchMatches(obj)
{
	var ret = [];
	if (debug & DEBUG_PARSE)
		console.log("getInfoFromSearchMatches: obj", obj);
	if (obj.matches) {
		for (var match of obj.matches) {
			if (!match.id) {
				console.log("getInfoFromSearchMatches(): id not in match");
			} else {
				var info = {};
				info.id = match.id;
				if (match.towards) {
					info.towards = match.towards;
				}
				if (match.name) {
					info.name = match.name;
				}
				if (match.stopLetter) {
					info.stopLetter = match.stopLetter;
				}
				if (match.lines && match.lines.length > 0) {
					info.lines = getLineNames(match.lines);
				}
				if (match.modes && match.modes.length > 0) {
					info.modes = match.modes;
				}
				
				/* hack - we assume this mismatch means we can use "id" directly as arrivals id */
				if (match.topMostParentId && match.topMostParentId != match.id)
					info.idUsable = true;
				else
					info.idUsable = false;
				ret.push(info);
			}
		}
	}
	if (debug & DEBUG_PARSE)
		console.log("getInfoFromSearchMatches: return", ret);
	return ret;
}

//
// Search requests and callbacks
//

function requestTextSearchMatches(text)
{
	searchReq = new Request();
	searchReq.request(getStopPointSearchUrl(text), searchResultCb, searchStatusCb);
}

function searchError(status)
{
	if (debug & DEBUG_REQUEST)
		console.log("searchError(", status, ")");
	selectionInfoDiv.innerHTML = "<b>Search Error " + status;
}

function searchResultCb(status, matchesObj)
{
	searchReq = null;				// reference no longer required

	if (status == 200) {
		var info = getInfoFromSearchMatches(matchesObj);	// info is an array
		if (info.length == 1 && info[0].idUsable) {
			displaySearchSelection(info);
			resetArrivalsDiv();
			resetStopPointDiv();
			requestStopPointInfo(info[0].id);
			//displayBusStopInfo(info[0]);
			requestArrivalPredictions(info[0].id);
		} else {
			displaySearchSelection(info);
		}
	} else
		searchError(status);
}

function searchStatusCb(req)
{
	//console.log("Search status: readyState", req.readyState, "status", req.status);
	displayRequestStatus(selectionInfoDiv, req);

}
//
// Search display formatting
//

function displaySearchSelection(info)
{
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
		if (entry.stopLetter) {
			modeStr += " (stop " + entry.stopLetter + ")";
		}
		var name = entry.name;
		if (entry.towards)
			name += "<br>(towards " + entry.towards + ")";
		s += '<tr onclick="searchOnClick(event, \'' + entry.id + '\')"><td>' + name + "</td><td>" + modeStr + "</td></tr>";
	}
	s += "</table>";
	selectionInfoDiv.innerHTML = s;
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

function bodyLoadedEvent(event)
{
	busStopInfoDiv = document.getElementById("busStopInfoDiv");
	arrivalsInfoDiv = document.getElementById("arrivalsInfoDiv");
	selectionInfoDiv = document.getElementById("selectionInfoDiv");
	stopPointInfoDiv = document.getElementById("stopPointInfoDiv");
	searchTextEl = document.getElementById("searchText");
}

//
// Display functions
//

function displayBusStopInfo(info)
{
	var s = "<p>";
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

function formatTimeToStationStr(t)
{
	var min = Math.floor(t/60);
	var sec = t - (min * 60);
	var sec10 = Math.floor(sec / 10);
	sec = sec - (sec10 * 10);
	return "" + min + ":" + (sec10 ? sec10 * 10 : "00");
}

function displayArrivalsInfo(info)
{
	if (debug & DEBUG_REQUEST)
		console.log("displayArrivalsInfo: ", info);
	var s = "";
	if (info.length > 0) {
		s = '<br><table border="1">';
		info.sort(function(a,b) { return a.timeToStation - b.timeToStation; });
		for (var entry of info) {
			var dest = entry.destinationName ? entry.destinationName : '';
			s += "<tr><td>" + entry.lineName + "</td><td>" + dest + "</td><td>" + formatTimeToStationStr(entry.timeToStation + 0) + "</td>";
			if (entry.modeName && entry.modeName == "tube") {
				s += "<td>" + (entry.currentLocation ? entry.currentLocation : "") + "</td>";
				s += "<td>" + (entry.platformName ? entry.platformName : "") + "</td>";
			}
		}
		s += "</table>";
	} else
		s = "<p>(No arrivals information)<br>";
	s += '<input type="button" class="info" id="arrivalsRefresh" onclick="arrivalsRequestOnClick()" value="Submit" />';
	arrivalsInfoDiv.innerHTML = s;
}

function arrivalsRequestOnClick()
{
	id = getcurrentArrivalRequestId();
	if (id) {
		requestArrivalPredictions(id);
	}
}

function setStopPointHighlight(ele)
{
	unhighlightRow(highlightedStopPointRow);
	highlightRow(ele);
	highlightedStopPointRow = ele;
}

function stopPointOnClick(event, id)
{
	if (debug & DEBUG_REQUEST)
		console.log("stopPointOnClick: ", id);
	var rowEle = event.target.parentNode;
	setStopPointHighlight(rowEle);
	resetArrivalsDiv();
	requestArrivalPredictions(id);
}

/*****************************
 * Leaf Stop Point Functions *
 *****************************/

//
// Leaf Stop Point result parsing
//

function capitalise(s)
{
	if (s && s.length > 0)
		return s.charAt(0).toUpperCase() + s.substring(1);
	else
		return s;
}

function formatLineIdentifierInfo(obj)
{
	var s = '';
	var first = true;
	for (var line of obj.lineIdentifier) {
		if (line[0] != 'n' || displayNightBuses) {
			if (first) {
				s = capitalise(line);
				first = false;
			} else {
				s += ', ' + capitalise(line);
			}
		}
	}
	return s;
}

function formatLineGroupInfo(arr)
{
	//console.log('formatLineGroupInfo: ', arr);
	var s = '';
	if (arr.length > 1)
		alert("formatLineGroupInfo: more than one entry - taking first");
	obj = arr[0];
	if (obj.lineIdentifier && obj.lineIdentifier.length > 0) {
		var arrivalsId;
		if (obj.naptanIdReference)
			arrivalsId = obj.naptanIdReference;
		else
			arrivalsId = obj.stationAtcoCode ? obj.stationAtcoCode : '';
		s = formatLineIdentifierInfo(obj);
	}
	return { str: s, id: arrivalsId };
	
}

function getAdditionalProperties(obj)
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

function getStopPointLeafInfo(obj, parent)
{
	var info = {};

	if (obj.lines && obj.lines.length > 0) {
		if (obj.stopLetter)
			info.stopName = "Stop " + obj.stopLetter;
		else
		if (parent && parent.commonName)
			info.stopName = parent.commonName;
		else
			info.stopName = "";

		var props = getAdditionalProperties(obj);
		if (props.towards)
			info.dir = props.towards;
		else
		if (props.direction)
			info.dir = props.direction;

		// TODO - rename "lines" and "ids"
		info.lines = [];
		info.ids = [];
		for (var line of obj.lines) {
			if (line.name)
				info.lines.push(line.name);
			if (line.id)
				info.ids.push(line.id);
		}
		
		if (obj.stopType == "NaptanMetroPlatform")	// TODO - better way?
			info.id = obj.stationNaptan;
		else
		if (obj.naptanId)
			info.id = obj.naptanId;
		else
		if (obj.id)
			info.id = obj.id;
		else
		if (obj.stationNaptan)
			info.id = obj.stationNaptan;
		else
			info.id = null;			// what to do here if there is no id ?
	}
	return info;
}

function getStopPointInfo(obj)
{
	if (debug & DEBUG_PARSE)
		console.log("getStopPointInfo: obj", obj);
	var info = [];
	getStopPointInfo_recurse(obj, null, info);
	if (debug & DEBUG_PARSE)
		console.log("getStopPointInfo: return info", info);
	return info;
}

function getStopPointInfo_recurse(obj, parent, result)
{
	if (obj.children && obj.children.length > 0) {
		for (var child of obj.children) {
			getStopPointInfo_recurse(child, obj, result);
		}
	} else {
		var leaf_info = getStopPointLeafInfo(obj, parent);
		if (leaf_info.id && !isDuplicate(result, leaf_info)) {
			result.push(leaf_info);
		}
	}
}

function compareEqual(obj1, obj2)
{
	for (var n in obj1) {
		if (!(n in obj2)) {
			return false;
		}
		if (typeof(obj1[n]) == "object") {
			if (!compareEqual(obj1[n], obj2[n])) {
				return false;
			}
		} else
		if (obj1[n] != obj2[n]) {
			return false;
		}
	}
	return true;
}

function isDuplicate(list, obj)
{
	for (var i = 0 ; i < list.length; ++i) {
		if (compareEqual(list[i], obj)) {
			if (debug & DEBUG_PARSE)
				console.log("isDuplicate:", obj);
			return true;
		}
	}
	return false;
}

//
// Leaf Stop Point display formatting
//

function formatStopPointInfo(info)
{
	var s = '<br><table border="1">';
	for (var stop of info) {
		s += '<tr onclick="stopPointOnClick(event, \'' + stop.id + '\')">';
		s += '<td>' + stop.stopName;
		s += '<td>';
		if (stop.lines)
			s += stop.lines.join(', ');
		s += '<td>';
		if (stop.dir)
			s += stop.dir;
	}
	s += '</table>';
	return s;
}

function displayStopPointInfo(obj)
{
	if (debug & DEBUG_DISPLAY)
		console.log("displayStopPointInfo: ", obj);
	var s = formatStopPointInfo(obj);
	stopPointInfoDiv.innerHTML = s;
}

function setSelectionHighlight(ele)
{
	unhighlightRow(highlightedSelectionRow);
	highlightRow(ele);
	highlightedSelectionRow = ele;
}

//
// Leaf Stop Point request and callbacks
//

function stopPointResultCb(status, stopPointObj)
{
	if (status == 200) {
		stopPointReq = null;			// reference no longer needed
		var info = getStopPointInfo(stopPointObj);
		currentStopPointInfo = info;	// save away stop point list
		displayStopPointInfo(info);
	} else {
		stopPointInfoDiv.innerHTML = "Stop Point Error " + status;
		currentStopPointInfo = null;
	}
}

function stopPointStatusCb(req)
{
	displayRequestStatus(stopPointInfoDiv, req);
}

function searchOnClick(event, id)
{
	if (debug & DEBUG_REQUEST)
		console.log("searchOnClick", id);
	var rowEle = event.target.parentNode;
	setSelectionHighlight(rowEle);
	resetArrivalsDiv();
	resetStopPointDiv();

	stopPointReq = new Request();
	stopPointReq.request(getStopPointInfoUrl(id), stopPointResultCb, stopPointStatusCb);
}


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

const DEBUG_DISPLAY = 1;
const DEBUG_REQUEST = 2;
const DEBUG_PARSE = 4;
const debug = 0;

const CLASS_HIGHLIGHT = "highlight";

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

function bodyLoadedEvent(event)
{
	busStopInfoDiv = document.getElementById("busStopInfoDiv");
	arrivalsInfoDiv = document.getElementById("arrivalsInfoDiv");
	selectionInfoDiv = document.getElementById("selectionInfoDiv");
	stopPointInfoDiv = document.getElementById("stopPointInfoDiv");
	searchTextEl = document.getElementById("searchText");
	initSelect();
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

//
// Table row highlighting
//

function unhighlightRow(ele)
{
	if (ele) {
		ele.classList.remove(CLASS_HIGHLIGHT);
	}
}

function highlightRow(ele)
{
	if (ele) {
		ele.classList.add(CLASS_HIGHLIGHT);
	}
}

function setSelectionHighlight(ele)
{
	unhighlightRow(highlightedSelectionRow);
	highlightRow(ele);
	highlightedSelectionRow = ele;
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
		const s = formatArrivalsInfo(arrivalsObj);
		arrivalsInfoDiv.innerHTML = s;

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
			//const s = formatBusStopInfo(info[0]);
			//busStopInfoDiv.innerHTML = s;

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

function displayStopPointInfo(obj)
{
	if (debug & DEBUG_DISPLAY)
		console.log("displayStopPointInfo: ", obj);
	var s = formatStopPointInfo(obj);
	stopPointInfoDiv.innerHTML = s;
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


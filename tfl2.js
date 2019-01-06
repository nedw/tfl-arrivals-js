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

var arrivalsInfoFrame = null;
var selectionInfoFrame = null;
var stopPointInfoFrame = null;
var savedStopPointFrame = null;

var searchTextEl = null;
var displayNightBuses = false;
var highlightedSelectionRow = null;
var highlightedStopPointRow = null;

var currentArrivalRequestId = null;
var currentStopPointInfo = null;
var currentSearchResultsInfo = null;

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

function displayRequestStatus(frame, req)
{
	if (req.readyState > 0 && req.readyState < readyStateNames.length ) {
		frame.setHTML("<p>" + readyStateNames[req.readyState]);
	}
}

function bodyLoadedEvent(event)
{
	selectionInfoFrame = new Frame();
	stopPointInfoFrame = new Frame();
	arrivalsInfoFrame = new Frame();
	savedStopPointFrame = new Frame();
	disruptions.bodyLoaded();

	selectionInfoFrame.addToBody();
	stopPointInfoFrame.addToBody();
	arrivalsInfoFrame.addToBody();
	savedStopPointFrame.addToBody();
	disruptions.getFrame().addToBody();

	searchTextEl = document.getElementById("searchText");
	storage.loadStopPoints();
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
		formatArrivalsInfo(arrivalsInfoFrame, arrivalsObj);
	} else {
		arrivalsError(status);
	}
}

function arrivalPredictionsStatusCb(req)
{
	//console.log("arrivalPredictionsStatusCb(", req, ")");
	displayRequestStatus(arrivalsInfoFrame, req);
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
	resetFrames();
	requestTextSearchMatches(ev.target.value);
}

function searchSubmitOnClick(ev)
{
	resetFrames();
	console.log(searchTextEl.value);
	requestTextSearchMatches(searchTextEl.value);
}

//
// Search requests and callbacks
//

function getCurrentSearchResultsInfo()
{
	return currentSearchResultsInfo;
}

function setCurrentSearchResultsInfo(info)
{
	currentSearchResultsInfo = info;
}

function requestTextSearchMatches(text)
{
	searchReq = new Request();
	searchReq.request(getStopPointSearchUrl(text), searchResultCb, searchStatusCb);
}

function searchError(status)
{
	if (debug & DEBUG_REQUEST)
		console.log("searchError(", status, ")");
	selectionInfoFrame.setHTML("<b>Search Error " + status);
}

function displaySearchResults(info)
{
	formatSearchResults(selectionInfoFrame, info);
}

function searchResultCb(status, matchesObj)
{
	searchReq = null;				// reference no longer required

	setCurrentSearchResultsInfo(null);
	if (status == 200) {
		var info = getInfoFromSearchMatches(matchesObj);	// info is an array
		setCurrentSearchResultsInfo(info);
		if (info.length == 1 && info[0].idUsable) {
			displaySearchResults(info);
			resetArrivalsFrame();
			resetStopPointFrame();
			requestStopPointInfo(info[0].id);
			requestArrivalPredictions(info[0].id);
		} else {
			displaySearchResults(info);
		}
	} else
		searchError(status);
}

function searchStatusCb(req)
{
	//console.log("Search status: readyState", req.readyState, "status", req.status);
	displayRequestStatus(selectionInfoFrame, req);
}
//
// HTML callbacks
//

function resetArrivalsFrame()
{
	arrivalsInfoFrame.clear();
}

function resetStopPointFrame()
{
	stopPointInfoFrame.clear();
}

function resetSavedStopPointFrame()
{
	savedStopPointFrame.clear();
}

function resetFrames()
{

	selectionInfoFrame.clear();
	resetStopPointFrame();
	resetArrivalsFrame();
}

function arrivalsRequestOnClick()
{
	id = getcurrentArrivalRequestId();
	if (id) {
		requestArrivalPredictions(id);
	}
}

function getTableRowElement(frame, row)
{
	let rowEles = frame.getElementsByTag("tr");
	return rowEles[row];
}

function targetIsCheckbox(event)
{
	return (event.target.type && event.target.type == "checkbox");
}

function setStopPointHighlight(ele)
{
	unhighlightRow(highlightedStopPointRow);
	highlightRow(ele);
	highlightedStopPointRow = ele;
}

function stopPointOnClick(event, rowStr)
{
	let row = parseInt(rowStr, 10);
	if (debug & DEBUG_REQUEST)
		console.log("stopPointOnClick: ", row);
	//var rowEle = event.target.parentNode;
	if (!targetIsCheckbox(event)) {
		let rowEle = getTableRowElement(stopPointInfoFrame, row);
		setStopPointHighlight(rowEle);
		resetArrivalsFrame();
		let id = getCurrentStopPointInfo().info[row].id;
		requestArrivalPredictions(id);
	}
}

function displayStopPointInfo(info)
{
	if (debug & DEBUG_DISPLAY)
		console.log("displayStopPointInfo: ", info);
	formatStopPointFrame(stopPointInfoFrame, info);
}

function setCurrentStopPointInfo(info)
{
	currentStopPointInfo = info;
}

function getCurrentStopPointInfo()
{
	return currentStopPointInfo;
}

//
// Leaf Stop Point request and callbacks
//

function stopPointResultCb(status, stopPointObj)
{
	if (status == 200) {
		stopPointReq = null;			// reference no longer needed
		let info = getStopPointInfo(stopPointObj);
		setCurrentStopPointInfo(info);	// save away stop point list
		displayStopPointInfo(info.info);
	} else {
		stopPointInfoFrame.setHTML("Stop Point Error " + status);
		setCurrentStopPointInfo(null);
	}
}

function stopPointStatusCb(req)
{
	displayRequestStatus(stopPointInfoFrame, req);
}

function searchOnClick(event, row)
{
	row = parseInt(row, 10);
	if (debug & DEBUG_REQUEST)
		console.log("searchOnClick", row);
	let rowEle = event.target.parentNode;
	setSelectionHighlight(rowEle);
	resetArrivalsFrame();
	resetStopPointFrame();

	stopPointReq = new Request();
	let id = getCurrentSearchResultsInfo()[row].id;
	stopPointReq.request(getStopPointInfoUrl(id), stopPointResultCb, stopPointStatusCb);
}

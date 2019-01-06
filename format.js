var searchTable = null;
var stopPointTable = null;
var arrivalsTable = null;

class Formatter {
	static formatButton(value, callback)
	{
		return `<input type="button" value="${value}" onClick="${callback}(event)" />`;
	}
}

// Capitalise a string

function capitalise(s)
{
	if (s && s.length > 0)
		return s.charAt(0).toUpperCase() + s.substring(1);
	else
		return s;
}

//
// Functions for formatting Search Result information
//

function generateSearchResultsTable(info)
{
	var tableData = [];

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
			modeStr += ` (stop ${entry.stopLetter})`;
		}

		var name = entry.name;
		if (entry.towards)
			name += `<br>(towards ${entry.towards})`;
		
		tableData.push( [ name, modeStr ] );
	}
	return tableData;
}

function formatSearchResults(frame, info)
{
	var tableData = generateSearchResultsTable(info);
	frame.setVisibility(false);
	var s = '<p>Search Results:<br>';
	frame.setHTML(s);

	searchTable = new Table(tableData, 'searchOnClick', null);
	frame.appendNode(searchTable.getNode());
	frame.setVisibility(true);
}

//
// Functions for formatting Stop Point information
//

function generateStopPointTable(info, useName)
{
	let tableData = [];

	if (info) {
		// Table of stop points
		for (var i = 0 ; i < info.length ; i++) {
			var stop = info[i];

				

			var lines;
			if (stop.lines)
				lines = stop.lines.join(', ');
			else
				lines = '';

			var dir;
			if (stop.dir)
				dir = stop.dir;
			else
				dir = '';
			
			if (useName)
				tableData.push( [ stop.name ? stop.name : "", stop.stopName,  lines, dir ] );
			else
				tableData.push( [ stop.stopName,  lines, dir ] );
		}
	}
	return tableData;
}

function formatStopPointFrame(frame, info)
{
	let tableData = generateStopPointTable(info, false);
	stopPointTable = new Table(tableData, 'stopPointOnClick', 'Table.checkboxOnChange');

	frame.setVisibility(false);
	// "Select" and "Save" buttons
	var s = '<p>' +
			Formatter.formatButton("Select", "selectButtonOnClick") + '&emsp;' +
			Formatter.formatButton("Save",   "saveButtonOnClick")    +
			'<br>';

	frame.setHTML('<p>Stop Points:<br>' + s);
	frame.appendNode(stopPointTable.getNode());
	frame.setVisibility(true);
}

/*
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
*/

//
// Given time t in seconds, generate an output string of the form "<min>:<sec>"

function formatTimeToStationStr(t)
{
	var min = Math.floor(t/60);
	var sec = t - (min * 60);
	var sec10 = Math.floor(sec / 10);
	sec = sec - (sec10 * 10);
	return "" + min + ":" + (sec10 ? sec10 * 10 : "00");
}

//
// Arrivals info formatting
//

function generateArrivalsInfoTable(info)
{
	let tableData = [];
	for (let entry of info) {
		let dest = entry.destinationName ? entry.destinationName : '';
		let isTube = (entry.modeName && entry.modeName == "tube");
		if (isTube)
			dest = dest.replace('Underground Station', '');
		let tableRow = [ entry.lineName, dest, formatTimeToStationStr(entry.timeToStation + 0) ];
		if (isTube) {
			tableRow.push(entry.currentLocation ? entry.currentLocation : "");
			tableRow.push(entry.platformName ? entry.platformName : "");
		}
		tableData.push(tableRow);
	}
	return tableData;
}

function formatArrivalsInfo(frame, info)
{
	if (debug & DEBUG_REQUEST)
		console.log("formatArrivalsInfo: ", info);
	var s;
	frame.setVisibility(false);
	if (info.length > 0) {
		info.sort(function(a,b) { return a.timeToStation - b.timeToStation; });
		let tableData = generateArrivalsInfoTable(info);
		arrivalsTable = new Table(tableData, null, null);
		arrivalsInfoFrame.setHTML('<p>Arrivals:<br>');
		arrivalsInfoFrame.appendNode(arrivalsTable.getNode());
		s = '';
	} else
		s = '<p>(No arrivals information)<br>';
	s += '<p>' + Formatter.formatButton("Refresh", "arrivalsRequestOnClick");
	frame.appendHTML(s);
	frame.setVisibility(true);
	return s;
}


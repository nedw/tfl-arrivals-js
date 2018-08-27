const tableStartBorder = '<table border="1">';
const tableEnd     = '</table>';
const tableRow     = '<tr>';
const tableRowEnd  = '</tr>'
const tableData    = '<td>';
const tableDataEnd = '</td>';

function formatTableRowOnClick(funcName, funcArg)
{
	return '<tr onclick="' + funcName + '(event, \'' + funcArg + '\')">';
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
// data:	[
//			  [ col, ... ],
//			  [ col, ... ],
//			       ...
//			]
//

function formatTable(tableData, rowOnClick, isSelectable)
{
	var s = '<table border="1">';

	for (var rowIndex = 0 ; rowIndex < tableData.length ; rowIndex++) {
		if (rowOnClick)
			s += formatTableRowOnClick(rowOnClick, rowIndex);
		else
			s += '<tr>';
		
		for (var colIndex = 0 ; colIndex < tableData[rowIndex].length ; colIndex++) {
			s += '<td>' + tableData[rowIndex][colIndex] + '</td>';
		}

		if (isSelectable) {
			// Select check box (normally hidden)
			s += formatCheckBoxSelectCell(rowIndex);
		}

		s += '</tr>'
	}
	s += '</table>';
	return s;
}

//
// Functions for formatting Search Result information
//

function formatSearchResults(info)
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
			modeStr += " (stop " + entry.stopLetter + ")";
		}

		var name = entry.name;
		if (entry.towards)
			name += "<br>(towards " + entry.towards + ")";
		
		tableData.push( [ name, modeStr ] );
	}
	var s = '<br>' + formatTable(tableData, 'searchOnClick', false);
	return s;
}

function formatButton(value, callback)
{
	var s = '<input type="button" value="' + value + '" onClick="' + callback + '(event)" />';
	return s;
}

//
// Functions for formatting Stop Point information
//

function formatCheckBoxSelectCell(i)
{
	return '<td class="selectClass">' +
		   '<input type="checkbox" name="selectCheckbox"  onchange="selectOnChange(event, ' + i +  ')"></input>' +
		   tableDataEnd;
}

function formatStopPointInfo(info)
{
	// "Select" and "+" buttons
	var s = formatButton("Select", "selectButtonOnClick") + '&emsp;' +
			formatButton("Save", "addButtonOnClick") + '<br>';
	
	var tableData = [];

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
		
		tableData.push( [ stop.stopName,  lines, dir ] );
	}
	s += formatTable(tableData, 'stopPointOnClick', true);
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

function formatBusStopInfo(info)
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
	return s;
}

//
// Arrivals info formatting
//

function formatArrivalsInfo(info)
{
	if (debug & DEBUG_REQUEST)
		console.log("formatArrivalsInfo: ", info);
	var s = '';
	if (info.length > 0) {
		s = '<br>';
		info.sort(function(a,b) { return a.timeToStation - b.timeToStation; });
		var tableData = [];
		for (var entry of info) {
			var dest = entry.destinationName ? entry.destinationName : '';
			var isTube = (entry.modeName && entry.modeName == "tube");
			if (isTube)
				dest = dest.replace('Underground Station', '');
			var tableRow = [ entry.lineName, dest, formatTimeToStationStr(entry.timeToStation + 0) ];
			if (isTube) {
				tableRow.push(entry.currentLocation ? entry.currentLocation : "");
				tableRow.push(entry.platformName ? entry.platformName : "");
			}
			tableData.push(tableRow);
		}
		s += formatTable(tableData, null, false);
	} else
		s = '<p>(No arrivals information)<br>';
	s += formatButton("Submit", "arrivalsRequestOnClick");
	return s;
}


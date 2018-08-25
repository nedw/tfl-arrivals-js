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
// Functions for formatting Search Result information
//

function displaySearchSelection(info)
{
	var s = '<br>' + tableStartBorder;
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
			s += formatTableRowOnClick("searchOnClick", entry.id) + 
		     tableData + name + tableDataEnd +
			 tableData + modeStr + tableDataEnd + tableRowEnd;
	}
	s += tableEnd;
	selectionInfoDiv.innerHTML = s;
}

//
// Functions for formatting Stop Point information
//

function formatCheckBoxSelectCell()
{
	return '<td class="selectClass">' +
		   '<input type="checkbox" name="selectCheckbox"  onchange="selectOnChange(event)"></input>' +
		   tableDataEnd;
}

function formatSelectButton()
{
	return '<input type="button" name="selectButton" value="Select" onClick="selectButtonOnClick(event)"/>';
}

function formatStopPointInfo(info)
{
	// "Select" button
	var s = formatSelectButton();
	
	// Table of stop points
	s += '<br>' + tableStartBorder;
	for (var stop of info) {
		s += formatTableRowOnClick("stopPointOnClick", stop.id) + 
			 tableData + stop.stopName +
			 tableData;
		if (stop.lines)
			s += stop.lines.join(', ');
		s += tableData;
		if (stop.dir)
			s += stop.dir;
		// Select check box (normally hidden)
		s += formatCheckBoxSelectCell() + tableRowEnd;
	}
	s += tableEnd;
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
	var s = "";
	if (info.length > 0) {
		s = '<br>' + tableStartBorder;
		info.sort(function(a,b) { return a.timeToStation - b.timeToStation; });
		for (var entry of info) {
			var dest = entry.destinationName ? entry.destinationName : '';
			s += tableRow +
				 tableData + entry.lineName + tableDataEnd +
				 tableData + dest + tableDataEnd +
				 tableData + formatTimeToStationStr(entry.timeToStation + 0) + tableDataEnd;

			if (entry.modeName && entry.modeName == "tube") {
				s += tableData + (entry.currentLocation ? entry.currentLocation : "") + tableDataEnd;
				s += tableData + (entry.platformName ? entry.platformName : "") + tableDataEnd;
			}
		}
		s += tableEnd;
	} else
		s = '<p>(No arrivals information)<br>';
	s += '<input type="button" class="info" id="arrivalsRefresh" onclick="arrivalsRequestOnClick()" value="Submit" />';
	return s;
}


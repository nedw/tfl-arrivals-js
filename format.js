class Formatter {
	static formatButton(value, callback)
	{
		return `<input type="button" value="${value}" onClick="${callback}(event)" />`;
	}

	//
	// Given func and arg parameters, generate a table row of the form:
	//
	//	<tr onclick='<func>(event, <arg>)'>
	//

	static formatTableRowOnClick(func, arg)
	{
		return `<tr onclick="${func}(event, ${arg})">`;
	}

	//
	// Generate a checkbox within a table data cell of the form:
	//
	//	<td class="<prefix>SelectClass">
	//	<input type="checkbox" class="<prefix>SelectCheckbox"  onchange="selectOnChange(event, <i>)" />
	//	</td>
	//
	// Where 'prefix' and 'i' are parameters.
	//


	static formatCheckBoxSelectCell(prefix, i)
	{
		let [selectClass, selectCheckbox, selectOnChange] = Selector.cellAttributes(prefix);
		return `<td class="${selectClass}" style="display: none">` +
			   `<input type="checkbox" class="${selectCheckbox}" onchange="${selectOnChange}(event, ${i})" /></td>`;
	}

	//
	// Generate a table from a two dimensional array of strings, where each element represents a table
	// data cell.  Each row can have a variable number of columns, ie:
	//
	// tableData: [
	//			  [ col1, col2, ..., colM ],
	//			  [ col1, col2, ..., colN ],
	//			       ...
	//			  ]
	//

	static formatTable(prefix, tableData, rowOnClick, isSelectable)
	{
		var s = '<table border="1">';

		for (var rowIndex = 0 ; rowIndex < tableData.length ; rowIndex++) {
			if (rowOnClick)
				s += Formatter.formatTableRowOnClick(rowOnClick, rowIndex);
			else
				s += '<tr>';
			
			for (var colIndex = 0 ; colIndex < tableData[rowIndex].length ; colIndex++) {
				s += `<td>${tableData[rowIndex][colIndex]}</td>`;
			}

			if (isSelectable) {
				// Select check box (normally hidden)
				s += Formatter.formatCheckBoxSelectCell(prefix, rowIndex);
			}

			s += '</tr>'
		}
		s += '</table>';
		return s;
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

function formatSearchResults(info)
{
	var tableData = generateSearchResultsTable(info);
	var s = '<p>Search Results:<br>' + Formatter.formatTable("", tableData, 'searchOnClick', false);
	return s;
}

//
// Functions for formatting Stop Point information
//

function generateStopPointTable(info)
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
			
			tableData.push( [ stop.stopName,  lines, dir ] );
		}
	}
	return tableData;
}

function formatStopPointInfo(info)
{
	let tableData = generateStopPointTable(info);

	let s = Formatter.formatTable("", tableData, 'stopPointOnClick', true);
	return s;
}

function formatStopPointFrame(info)
{
	// "Select" and "+" buttons
	var s = Formatter.formatButton("Select", "selectButtonOnClick") + '&emsp;' +
			Formatter.formatButton("Save",   "addButtonOnClick")    +
			'<br>';

	s += formatStopPointInfo(info)
	return s;
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

/*
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
*/

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

function formatArrivalsInfo(info)
{
	if (debug & DEBUG_REQUEST)
		console.log("formatArrivalsInfo: ", info);
	var s = '<p>Arrivals:';
	if (info.length > 0) {
		s += '<br>';
		info.sort(function(a,b) { return a.timeToStation - b.timeToStation; });
		let tableData = generateArrivalsInfoTable(info);
		s += Formatter.formatTable("", tableData, null, false);
	} else
		s = '<p>(No arrivals information)<br>';
	s += Formatter.formatButton("Refresh", "arrivalsRequestOnClick");
	return s;
}


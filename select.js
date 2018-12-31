
//
// Called when a checkbox is clicked.
//
// Just used to prevent propagation of event to the parent <tr> which would otherwise
// trigger retrieval of arrivals info for the row in question.
//

function checkboxOnChange(ev, infoIndex)
{
	//console.log("checkboxOnChange(", ev, ",", getCurrentStopPointInfo().info[infoIndex], ")");
	ev.stopPropagation();
}

//
// Called when "Select" button in Stop Point frame is cilcked
//

function selectButtonOnClick(ev)
{
	console.log("selectButtonOnClick(", ev, ")");
	stopPointTable.toggleCheckBoxVisibility();
}

function generateSavedStopPoints(stopPointInfo)
{
	let savedStopPoints = storage.getStopPoints();
	if (savedStopPoints == null)
		savedStopPoints = [];

	for (let i = 0 ; i < stopPointTable.rows() ; i++) {
		if (stopPointTable.isCheckboxChecked(i)) {
			let info = stopPointInfo.info[i];
			console.log("Saving", info);
			let obj = savedStopPoints.find(o => o.id == info.id);
			if (!obj)
				savedStopPoints.push(info);
		}
	}
	return savedStopPoints;
}

//
// Called when "Save" button in Stop Point frame is clicked
//

function saveButtonOnClick(ev)
{
	let stopPointInfo = getCurrentStopPointInfo();
	console.log("saveButtonOnClick(", ev, "): name ", stopPointInfo.name);
	let savedStopPoints = generateSavedStopPoints(stopPointInfo);
	storage.setStopPoints(savedStopPoints);
}

//
// Called when "Saved" button in search bar is clicked
//

function savedOnClick(ev)
{
	if (savedStopPointInfoVisible) {
		resetSavedStopPointFrame();
		savedStopPointInfoVisible = false;
	} else {
		let savedStopPoints = storage.getStopPoints();
		let tableData = generateStopPointTable(savedStopPoints);
		let s = '<p>Saved Stop Points:';
		savedStopPointTable = new Table(tableData, 'savedStopPointOnClick', 'checkboxOnChange')
		savedStopPointFrame.setHTML(s);
		savedStopPointFrame.appendNode(savedStopPointTable.getNode());
		savedStopPointInfoVisible = true;
	}
}

//
// Called when a row in the saved stop point table is clicked
//

function savedStopPointOnClick(ev, row)
{
	console.log("savedStopPointOnClick:", ev, row);
	let info = storage.getStopPoints();
	setCurrentStopPointInfo( { name: "", info: info } );
	resetSavedStopPointFrame();
	savedStopPointInfoVisible = false;
	displayStopPointInfo(info);
	stopPointOnClick(ev, row);
}

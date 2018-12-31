var savedStopPointTable = null;
var savedStopPointInfoVisible = false;

//
// Called when "Select" button in Stop Point frame is cilcked
//

function selectButtonOnClick(ev)
{
	console.log("selectButtonOnClick(", ev, ")");
	stopPointTable.toggleCheckBoxVisibility();
}

function generateStopPointsToSave(stopPointInfo)
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
	let savedStopPoints = generateStopPointsToSave(stopPointInfo, false);
	storage.setStopPoints(savedStopPoints);
}

function generateSavedStopPointTable(savedStopPoints, checkboxesVisible)
{
	let tableData = generateStopPointTable(savedStopPoints);
	savedStopPointTable = new Table(tableData, 'savedStopPointOnClick', 'Table.checkboxOnChange');
	if (checkboxesVisible)
		savedStopPointTable.toggleCheckBoxVisibility();
	let s = '<p>Saved Stop Points:<br>' + Formatter.formatButton('Select', 'selectSavedOnClick') + '&emsp;' +
			 Formatter.formatButton('Delete', 'deleteSavedOnClick'); + '<br>';
	savedStopPointFrame.setVisibility(false);
	savedStopPointFrame.setHTML(s);
	savedStopPointFrame.appendNode(savedStopPointTable.getNode());
	savedStopPointFrame.setVisibility(true);
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
		generateSavedStopPointTable(savedStopPoints, false);
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

function selectSavedOnClick(ev)
{
	console.log("selectSavedOnClick:", ev);
	savedStopPointTable.toggleCheckBoxVisibility();
}

function generateStopPointsToDelete()
{
	let savedStopPoints = storage.getStopPoints();
	if (savedStopPoints == null)
		savedStopPoints = [];

	for (let i = 0 ; i < savedStopPointTable.rows() ; ++i) {
		if (savedStopPointTable.isCheckboxChecked(i))
			savedStopPoints[i] = null;
	}

	for (let i = 0 ; i < savedStopPoints.length ; ) {
		if (!savedStopPoints[i])
			savedStopPoints.splice(i, 1);
		else
			++i;
	}

	storage.setStopPoints(savedStopPoints);
	generateSavedStopPointTable(savedStopPoints, true);
}

function deleteSavedOnClick(ev)
{
	console.log("deleteSavedOnClick:", ev);
	generateStopPointsToDelete();
}

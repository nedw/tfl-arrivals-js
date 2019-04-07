var savedStopPointTable = null;
var savedStopPointInfoVisible = false;

//
// Called when "Select" button in Stop Point frame is cilcked
//

function selectButtonOnClick(ev)
{
	//console.log("selectButtonOnClick(", ev, ")");
	stopPointTable.toggleCheckBoxVisibility();
}

function generateStopPointsToSave(stopPointTable, stopPointInfo)
{
	let savedStopPoints = storage.getStopPoints();
	if (savedStopPoints == null)
		savedStopPoints = [];

	for (let i = 0 ; i < stopPointTable.rows() ; i++) {
		if (stopPointTable.isCheckboxChecked(i)) {
			let info = stopPointInfo.info[i];
			//console.log("Saving", info);
			let obj = savedStopPoints.find(o => o.id == info.id);
			if (!obj)
				savedStopPoints.push( { name: stopPointInfo.name, ...info} );
		}
	}

	//
	// sort according to 'name' property
	//
	savedStopPoints.sort((a, b) => (a.name == b.name) ? 0 : (a.name < b.name) ? -1 : 1);
	return savedStopPoints;
}

//
// Called when "Save" button in Stop Point frame is clicked
//

function saveButtonOnClick(ev)
{
	let stopPointInfo = getCurrentStopPointInfo();
	//console.log("saveButtonOnClick(", ev, "): name ", stopPointInfo.name);
	let savedStopPoints = generateStopPointsToSave(stopPointTable, stopPointInfo);
	storage.setStopPoints(savedStopPoints);
}

function generateSavedStopPointTable(savedStopPoints, checkboxesVisible)
{
	let tableData = generateStopPointTable(savedStopPoints, true);
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
		//resetSavedStopPointFrame();
		//savedStopPointInfoVisible = false;
	} else {
		searchInfoFrame.clear();
		let savedStopPoints = storage.getStopPoints();
		generateSavedStopPointTable(savedStopPoints, false);
		resetSearchFrame();
		resetArrivalsFrame();
		resetStopPointFrame();
		savedStopPointInfoVisible = true;
	}
}

//
// Called when a row in the saved stop point table is clicked
//

function savedStopPointOnClick(ev, row)
{
	let info = storage.getStopPoints();
	setCurrentStopPointInfo( { name: "", info: info } );
	resetSavedStopPointFrame();
	resetSearchFrame();
	savedStopPointInfoVisible = false;
	displayStopPointInfo(info, true);
	stopPointOnClick(ev, row);
}

function selectSavedOnClick(ev)
{
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
	generateStopPointsToDelete();
}

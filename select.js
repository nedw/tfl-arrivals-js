
function selectOnChange(ev, infoIndex)
{
	//console.log("selectOnChange(", ev, ",", getCurrentStopPointInfo().info[infoIndex], ")");
	ev.stopPropagation();
}

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

function addButtonOnClick(ev)
{
	let stopPointInfo = getCurrentStopPointInfo();
	console.log("addButtonOnClick(", ev, "): name ", stopPointInfo.name);
	let savedStopPoints = generateSavedStopPoints(stopPointInfo);
	storage.setStopPoints(savedStopPoints);
}

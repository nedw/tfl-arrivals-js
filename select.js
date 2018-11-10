var selectionHideElements = null;
var selectionCheckboxElements = null;
var selectionMode = false;

function initSelect()
{
	selectionHideElements = document.getElementsByClassName("selectClass");
	selectionCheckboxElements = document.getElementsByName("selectCheckbox");
}

function selectOnChange(ev, infoIndex)
{
	//console.log("selectOnChange(", ev, ",", getCurrentStopPointInfo().info[infoIndex], ")");
	ev.stopPropagation();
}

function updateSelectionElementVisibility()
{
	for (var e of selectionHideElements) {
		if (selectionMode) {
			e.style.display = "table-cell";
		} else {
			e.style.display = "none";
		}
	}

	if (!selectionMode) {
		for (var e of selectionCheckboxElements) {
			e.checked = false;
		}
	}
}

function selectButtonOnClick(ev)
{
	console.log("selectButtonOnClick(", ev, ")");
	selectionMode = !selectionMode;
	updateSelectionElementVisibility();
}

function addButtonOnClick(ev)
{
	let stopPointInfo = getCurrentStopPointInfo();
	let savedStopPoints = storage.getStopPoints();

	console.log("addButtonOnClick(", ev, "): name ", stopPointInfo.name);

	if (savedStopPoints == null)
		savedStopPoints = [];

	for (let i = 0 ; i < selectionCheckboxElements.length ; i++) {
		e = selectionCheckboxElements[i];
		if (e.checked) {
			let info = stopPointInfo.info[i];
			console.log("Saving", info);
			let obj = savedStopPoints.find(o => o.id == info.id);
			if (!obj)
				savedStopPoints.push(info);
		}
	}
	storage.setStopPoints(savedStopPoints);
}

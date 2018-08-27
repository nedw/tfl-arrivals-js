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
	console.log("selectOnChange(", ev, ",", getCurrentStopPointInfo().info[infoIndex], ")");
	ev.stopPropagation();
}

function selectButtonOnClick(ev)
{
	console.log("selectButtonOnClick(", ev, ")");
	selectionMode = !selectionMode;
	
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

function addButtonOnClick(ev)
{
	var stopPointInfo = getCurrentStopPointInfo();
	console.log("addButtonOnClick(", ev, "): name ", stopPointInfo.name);
	for (var i = 0 ; i < selectionCheckboxElements.length ; i++) {
		e = selectionCheckboxElements[i];
		if (e.checked) {
			console.log(stopPointInfo.info[i]);
		}
	}
}

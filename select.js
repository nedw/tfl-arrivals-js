class Selector {
	constructor() {
		this.selectionHideElements = null;
		this.selectionCheckboxElements = null;
		this.selectionMode = false;
	}

	static cellAttributes(prefix)
	{
		return [`${prefix}SelectClass`, `${prefix}SelectCheckbox`, `selectOnChange`];
	}
	initSelect(prefix)
	{
		this.selectionHideElements = document.getElementsByClassName(`${prefix}SelectClass`);
		this.selectionCheckboxElements = document.getElementsByClassName(`${prefix}SelectCheckbox`);
	}

	checkBoxLength()
	{
		return this.selectionCheckboxElements.length;
	}
	
	isChecked(i)
	{
		return !!this.selectionCheckboxElements[i].checked;
	}
	
	setSelectionElementVisibility(visible)
	{
		for (var e of this.selectionHideElements) {
			if (visible) {
				e.style.display = "table-cell";
			} else {
				e.style.display = "none";
			}
		}

		if (!visible) {
			for (let e of this.selectionCheckboxElements) {
				e.checked = false;
			}
		}
	}
	
	toggleSelectionMode()
	{
		this.selectionMode = !this.selectionMode;
		this.setSelectionElementVisibility(this.selectionMode);
	}
}

var selector = new Selector();

function selectOnChange(ev, infoIndex)
{
	//console.log("selectOnChange(", ev, ",", getCurrentStopPointInfo().info[infoIndex], ")");
	ev.stopPropagation();
}

function selectButtonOnClick(ev)
{
	console.log("selectButtonOnClick(", ev, ")");
	selector.toggleSelectionMode();
}

function generateSavedStopPoints(stopPointInfo)
{
	let savedStopPoints = storage.getStopPoints();
	if (savedStopPoints == null)
		savedStopPoints = [];

	for (let i = 0 ; i < selector.checkBoxLength() ; i++) {
		if (selector.isChecked(i)) {
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

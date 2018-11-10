class Storage {
	constructor()
	{
		this.stopPoints = null;
		this.loadedFlag = false;
	}

	loaded()
	{
		return this.loaded;
	}

	loadStopPoints()
	{
		let s = localStorage.getItem("stopPoints");
		this.stopPoints = JSON.parse(s);
		this.loadedFlag = true;
	}

	storeStopPoints(stopPoints)
	{
		let s = JSON.stringify(stopPoints);
		localStorage.setItem("stopPoints", s);
	}

	setStopPoints(stopPoints)
	{
		if (!this.loaded()) {
			this.loadStopPoints();
		}
		this.storeStopPoints(stopPoints);
	}

	getStopPoints()
	{
		if (!this.loaded()) {
			this.loadStopPoints();
		}
		return this.stopPoints;
	}
}

var storage = new Storage();
var savedStopPointInfoVisible = false;

function setSavedStopPointDiv(s)
{
	savedStopPointDiv.innerHTML = s;
	if (s)
		savedStopPointInfoVisible = true;
}

function resetSavedStopPointDiv()
{
	setSavedStopPointDiv("");
	savedStopPointInfoVisible = false;
}

//
// Called from "Saved" button beside search text
//

function savedOnClick(ev)
{
	if (savedStopPointInfoVisible) {
		resetSavedStopPointDiv();
	} else {
		let savedStopPoints = storage.getStopPoints();
		console.log("savedOnClick", savedStopPoints);
		let tableData = generateStopPointTable(savedStopPoints);
		let s = '<p>Saved Stop Points:';
		s += formatTable(tableData, 'savedStopPointOnClick', true);
		setSavedStopPointDiv(s);
	}
}

function savedStopPointOnClick(ev, row)
{
	console.log("savedStopPointOnClick:", ev, row);
	let info = storage.getStopPoints();
	setCurrentStopPointInfo( { name: "", info: info } );
	resetSavedStopPointDiv();
	displayStopPointInfo(info);
	stopPointOnClick(ev, row);
}

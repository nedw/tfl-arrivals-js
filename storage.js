var savedStopPointTable = null;
var savedStopPointInfoVisible = false;

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
		this.stopPoints = stopPoints;
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

//
// Called from "Saved" button beside search text
//

function savedOnClick(ev)
{
	if (savedStopPointInfoVisible) {
		console.log("savedOnClick: visible - hiding");
		resetSavedStopPointFrame();
		savedStopPointInfoVisible = false;
	} else {
		let savedStopPoints = storage.getStopPoints();
		console.log("savedOnClick: not visible - exposing", savedStopPoints);
		let tableData = generateStopPointTable(savedStopPoints);
		let s = '<p>Saved Stop Points:';
		savedStopPointTable = new Table(tableData, 'savedStopPointOnClick', 'selectOnChange')
		savedStopPointFrame.setHTML(s);
		savedStopPointFrame.appendNode(savedStopPointTable.getNode());
		savedStopPointInfoVisible = true;
	}
}

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

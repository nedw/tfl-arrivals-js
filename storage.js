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


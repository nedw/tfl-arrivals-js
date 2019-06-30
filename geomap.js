
class GeoMap {
    getStopPointsCentre()
	{
		let info = getCurrentStopPointInfo();
		// Calculate centroid of stop locations
		let lat = 0;
		let lon = 0;
		let n = 0;
		for (let o of info.info) {
			if (o.pos) {
				lat += o.pos[0];
				lon += o.pos[1];
				n += 1;
			}
		}

		lat /= n;
		lon /= n;
		return [ lat, lon ];
	}

	onDismiss()
	{
		mapFrame.setVisibility(false);
	}

	formatMapFrame()
	{
		mapFrame.setVisibility(false);
		let s = '<div id="map"></div><br>';
		s += Formatter.formatButton('Dismiss', 'geomap.onDismiss');
		mapFrame.setHTML(s);
		mapFrame.setVisibilityType("block");
	}

	displayMap(info)
	{
		if (debug & DEBUG_PARSE)
			console.log("displayMap: info: ", info);

		this.formatMapFrame();

		let [lat, lon] = this.getStopPointsCentre();

		if (this._map) {
			this._map.remove();
			this._map = null;
		}

		this._map = L.map('map')
				.setView([lat, lon], 16);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(this._map);

		for (let o of info.info) {
			if (o.pos) {
				const style = "font-size: 200%;";
				let popupText = `<span style="${style}">` +
								o.stopName + ', ' + o.name + '<br>' +
								o.lines.join(', ') + '<br>' + 
								o.dir + '<br>' +
								'</span>';
				let pos = o.pos;
				const popup_props = '{ maxWidth: 500 }';
				let popup = L.popup(popup_props)
							.setLatLng(pos)
							.setContent(popupText)
							.openOn(this._map);
				L.marker(pos)
					.addTo(this._map)
					.bindPopup(popup)	
					.closePopup();
			}
		}
	}

	onClick(event)
	{
		let info = getCurrentStopPointInfo();
		this.displayMap(info);
	}

	mapApiLoaded()
	{
		if (debug & DEBUG_REQUEST)
			console.log("Map API Loaded");
	}
};

var geomap = new GeoMap();

function mapApiLoaded()
{
    geomap.mapApiLoaded();
}
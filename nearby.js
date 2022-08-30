
class Nearby {

	// ["CarPickupSetDownArea","NaptanAirAccessArea","NaptanAirEntrance","NaptanAirportBuilding",  "NaptanBusCoachStation"(*), "NaptanBusWayPoint",
	//	"NaptanCoachAccessArea","NaptanCoachBay","NaptanCoachEntrance","NaptanCoachServiceCoverage","NaptanCoachVariableBay",
	//	"NaptanFerryAccessArea","NaptanFerryBerth","NaptanFerryEntrance","NaptanFerryPort","NaptanFlexibleZone","NaptanHailAndRideSection",
	//	"NaptanLiftCableCarAccessArea","NaptanLiftCableCarEntrance","NaptanLiftCableCarStop","NaptanLiftCableCarStopArea",
	//	"NaptanMarkedPoint","NaptanMetroAccessArea","NaptanMetroEntrance","NaptanMetroPlatform",  "NaptanMetroStation"(*),
	//	"NaptanOnstreetBusCoachStopCluster","NaptanOnstreetBusCoachStopPair","NaptanPrivateBusCoachTram", "NaptanPublicBusCoachTram" (*),
	//	"NaptanRailAccessArea","NaptanRailEntrance","NaptanRailPlatform",  "NaptanRailStation"(*),  "NaptanSharedTaxi","NaptanTaxiRank",
	//	"NaptanUnmarkedPoint","TransportInterchange"]
	//
	// https://api.tfl.gov.uk/StopPoint?radius=200&stopTypes=NaptanBusCoachStation,NaptanPublicBusCoachTram&lat=51.5267869&lon=-0.1072012
	//
	// https://api.tfl.gov.uk/Stoppoint?lat=51.513395&lon=-0.089095&stoptypes=NaptanMetroStation,NaptanRailStation,NaptanBusCoachStation,
	//		NaptanFerryPort,NaptanPublicBusCoachTram
	//

	static NEARBY_RADIUS = 600;

	static get fix_location() {
		if (false)
			return { lat: 51.501527, lon: -0.219916 };
		else
			return false;
	}

	static get radius() {
		return Nearby.NEARBY_RADIUS;
	}

	static get stopTypes() {
		return "NaptanMetroStation,NaptanRailStation,NaptanBusCoachStation,NaptanPublicBusCoachTram";
	}

	static url(lat, lon, radius) {
		return `https://api.tfl.gov.uk/StopPoint?radius=${radius}&stopTypes=${Nearby.stopTypes}&lat=${lat}&lon=${lon}`;
	}

	nearbyError(status) {
		if (debug & DEBUG_REQUEST)
			console.log("nearby: nearbyError(status" + status + ")");
		stopPointInfoFrame.setHTML("Stop Point Error " + status);
		setCurrentStopPointInfo(null);
	}


	nearbyResultCb(status, obj) {
		if (status == 200) {
			if (debug & DEBUG_REQUEST)
				console.log("nearby: nearbyResultCb(obj): ", obj);
			//
			// Object returned by stop point radius request has an array called "stopPoints"
			// rather than one called "children"
			//
			if (obj.stopPoints) {
				let info = getStopPointInfo(obj);
				if (debug & DEBUG_REQUEST)
					console.log("nearby: nearbyResultCb(): info (set current)", info);
				setCurrentStopPointInfo(info.name, info.info);	// save away stop point list
				displayStopPointInfo(info.info, true);
			} else {
				stopPointInfoFrame.setHTML("(No stop points)");
				setCurrentStopPointInfo(null);
			}
		} else {
			nearby.nearbyError(status);
		}
	}

	nearbyStatusCb(req) {
		if (debug & DEBUG_REQUEST)
			console.log("nearby: nearbyStatusCb(req):", req);
	}

	requestNearbyStops(lat, lon) {
		nearbyReq = new Request();

		if (Nearby.fix_location) {
			var { lat, lon } = Nearby.fix_location;
			console.log(`Fix location: lat ${lat}, lon ${lon}`);
		}
		nearbyReq.request(Nearby.url(lat, lon, Nearby.radius), nearby.nearbyResultCb, nearby.nearbyStatusCb);
	}

	locationResult(pos) {
		nearby._lastPosition = [ pos.coords.latitude, pos.coords.longitude ];
		nearby.requestNearbyStops(...nearby._lastPosition);
	}

	onClick(event) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(nearby.locationResult);
		} else
			alert("No navigator object!");
	}

}

var nearby = new Nearby();

// For some reason, mapApiLoaded() cannot be a static function within Nearby class.

function mapApiLoaded()
{
	nearby.mapApiLoaded();
}

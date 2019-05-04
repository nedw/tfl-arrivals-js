
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

	static get fix_location() {
		if (false)
			return { lat: 51.501527, lon: -0.219916 };
		else
			return false;
	}

	static get radius() {
		return 500;
	}

	static get stopTypes() {
		return "NaptanMetroStation,NaptanRailStation,NaptanBusCoachStation,NaptanPublicBusCoachTram";
	}

	static url(lat, lon, radius) {
		return `https://api.tfl.gov.uk/StopPoint?radius=${radius}&stopTypes=${Nearby.stopTypes}&lat=${lat}&lon=${lon}`;
	}

	static nearbyError(status) {
		if (debug & DEBUG_REQUEST)
			console.log("nearbyError:", status);
		stopPointInfoFrame.setHTML("Stop Point Error " + status);
		setCurrentStopPointInfo(null);
	}


	static nearbyResultCb(status, obj) {
		if (status == 200) {
			if (debug & DEBUG_REQUEST)
				console.log("nearbyResultCb:", obj);
			//
			// Object returned by stop point radius request has an array called "stopPoints"
			// rather than one called "children"
			//
			if (obj.stopPoints) {
				let info = getStopPointInfo(obj);
				setCurrentStopPointInfo(info);	// save away stop point list
				displayStopPointInfo(info.info, true);
			} else {
				stopPointInfoFrame.setHTML("(No stop points)");
				setCurrentStopPointInfo(null);
			}
		} else {
			Nearby.nearbyError(status);
		}
	}

	static nearbyStatusCb(req) {
		if (debug & DEBUG_REQUEST)
			console.log("nearby status", req);
	}

	static requestNearbyStops(lat, lon) {
		nearbyReq = new Request();

		if (Nearby.fix_location) {
			var { lat, lon } = Nearby.fix_location;
			console.log(`Fix location: lat ${lat}, lon ${lon}`);
		}
		nearbyReq.request(Nearby.url(lat, lon, Nearby.radius), Nearby.nearbyResultCb, Nearby.nearbyStatusCb);
	}

	static locationResult(pos) {
		console.log("Location: lat " + pos.coords.latitude + ", lon " + pos.coords.longitude);
		Nearby.requestNearbyStops(pos.coords.latitude, pos.coords.longitude);
	}

	static onClick() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(Nearby.locationResult);
		}
	}

}



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

	static url(lat,lon) {
		const stopTypes = "NaptanMetroStation,NaptanRailStation,NaptanBusCoachStation,NaptanPublicBusCoachTram";
		const radius = 300;
		return `https://api.tfl.gov.uk/StopPoint?radius=${radius}&stopTypes=${stopTypes}&lat=${lat}&lon=${lon}`;
	}

	static locationResult(pos) {
		alert("Location: lat " + pos.coords.latitude + ", lon " + pos.coords.longitude);

	}

	static onClick() {
		console.log("Nearby.onClick")
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(Nearby.locationResult);
		}
	}

}


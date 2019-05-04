//
// Functions for parsing TFL Search Result information
//

class Parser {
	static getLineNames(lines)
	{
		var names = [];
		for (var l of lines) {
			if (l.name) {
				names.push(capitalise(l.name));
			}
		}
		return names;
	}

	static getInfoFromSearchMatch(match)
	{
		var info = {};
		info.id = match.id;
		if (match.towards) {
			info.towards = match.towards;
		}
		if (match.name) {
			info.name = match.name;
		}
		if (match.stopLetter) {
			info.stopLetter = match.stopLetter;
		}
		if (match.lines && match.lines.length > 0) {
			info.lines = Parser.getLineNames(match.lines);
		}
		if (match.modes && match.modes.length > 0) {
			info.modes = match.modes;
		}
		
		/* hack - we assume this mismatch means we can use "id" directly as arrivals id */
		if (match.topMostParentId && match.topMostParentId != match.id)
			info.idUsable = true;
		else
			info.idUsable = false;
		return info;
	}

	static getAdditionalProperties(obj)
	{
		var info = {};
		if (obj.additionalProperties && obj.additionalProperties.length > 0) {
			for (var prop of obj.additionalProperties) {
				if (prop.category) {
					switch (prop.category) {
					case "Geo":
						if (prop.key && prop.key == "Zone") {
							info.zone = prop.value;
						}
						break;
					case "Direction":
						if (prop.key) {
							switch (prop.key) {
							case "CompassPoint":
								info.direction = prop.value;
								break;
							case "Towards":
								info.towards = prop.value;
								break;
							}
						}
						break;
					default:
						break;
					}
				}
			}
		}
		return info;
	}

	static getStopPointLeafInfo(obj, parent)
	{
		var info = {};

		if (obj.lines && obj.lines.length > 0) {
			if (obj.commonName)								// For radius stop point request
				info.name = obj.commonName;

			if (obj.stopLetter)
				info.stopName = "Stop " + obj.stopLetter;
			else
			if (obj.commonName)
				info.stopName = obj.commonName;
			else
			if (parent && parent.commonName)
				info.stopName = parent.commonName;
			else
				info.stopName = "";

			var props = Parser.getAdditionalProperties(obj);
			if (props.towards)
				info.dir = props.towards;
			else
			if (props.direction)
				info.dir = props.direction;

			// TODO - rename "lines" and "ids"
			info.lines = [];
			//info.ids = [];
			for (var line of obj.lines) {
				if (line.name)
					info.lines.push(line.name);
				//if (line.id)
				//	info.ids.push(line.id);
			}
			
			if (obj.stopType == "NaptanMetroPlatform")	// TODO - better way?
				info.id = obj.stationNaptan;
			else
			if (obj.naptanId)
				info.id = obj.naptanId;
			else
			if (obj.id)
				info.id = obj.id;
			else
			if (obj.stationNaptan)
				info.id = obj.stationNaptan;
			else
				info.id = null;			// what to do here if there is no id ?
			
				if (obj.distance)
					info.distance = parseInt(obj.distance);
			
		}
		return info;
	}

	static getStopPointInfo_recurse(obj, parent, result)
	{
		if (obj.children && obj.children.length > 0) {
			for (var child of obj.children) {
				Parser.getStopPointInfo_recurse(child, obj, result);
			}
		} else 
		if (obj.stopPoints && obj.stopPoints.length > 0) {
			//
			// Object returned by stop point radius request has an array called "stopPoints"
			// instead of than one called "children".
			//
			for (var child of obj.stopPoints) {
				Parser.getStopPointInfo_recurse(child, obj, result);
			}
		} else {
			var leaf_info = Parser.getStopPointLeafInfo(obj, parent);
			if (leaf_info.id && !isDuplicate(result, leaf_info)) {
				result.push(leaf_info);
			}
		}
	}
}

function getInfoFromSearchMatches(obj)
{
	var ret = [];
	if (debug & DEBUG_PARSE)
		console.log("getInfoFromSearchMatches: obj", obj);
	if (obj.matches) {
		for (var match of obj.matches) {
			if (!match.id) {
				console.log("getInfoFromSearchMatches(): id not in match");
			} else {
				let info = Parser.getInfoFromSearchMatch(match);
				ret.push(info);
			}
		}
	}
	if (debug & DEBUG_PARSE)
		console.log("getInfoFromSearchMatches: return", ret);
	return ret;
}

function getStopPointInfo(obj)
{
	if (debug & DEBUG_PARSE)
		console.log("getStopPointInfo: obj", obj);
	var info = [];
	Parser.getStopPointInfo_recurse(obj, null, info);
	if (debug & DEBUG_PARSE)
		console.log("getStopPointInfo: return info", info);
	return { name: obj.commonName, info: info };
}

function compareEqual(obj1, obj2)
{
	for (var n in obj1) {
		if (!(n in obj2)) {
			return false;
		}
		if (typeof(obj1[n]) == "object") {
			if (!compareEqual(obj1[n], obj2[n])) {
				return false;
			}
		} else
		if (obj1[n] != obj2[n]) {
			return false;
		}
	}
	return true;
}

function isDuplicate(list, obj)
{
	for (var i = 0 ; i < list.length; ++i) {
		if (compareEqual(list[i], obj)) {
			if (debug & DEBUG_PARSE)
				console.log("isDuplicate:", obj);
			return true;
		}
	}
	return false;
}


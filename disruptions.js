var disruptions = null;

class Disruptions {
	//
	// Frame handling methods
	//

	bodyLoaded() {
		// In context of body loaded
		this.frame = new Frame();
	}

	getFrame() {
		return this.frame;
	}

	//
	// Result display methods
	//

	insertSpacesBeforeCapitals(s)
	{
		return s.charAt(0).toUpperCase() + s.slice(1).replace(/([A-Z][a-z])/g, " $1");
	}

	// Return the css class name corresponding to a line name
	lineToClass(s)
	{
		var singleWordLines = [ "bakerloo", "piccadilly", "central", "jubilee", "victoria", "circle", "metropolitan",
								"district", "northern" ];
		var multiWordLines = {
			"waterloo and city": "waterloo_city",
			"waterloo & city": "waterloo_city",
			"hammersmith and city" : "hammersmity_city",
			"hammersmith & city" : "hammersmity_city",
			"london overground" : "overground"
		}
	
		s = s.toLowerCase();
		if (s.endsWith(' line'))
			s = s.slice(0, -5);
	
		if (singleWordLines.indexOf(s) != -1)
			return s;
	
		if (s in multiWordLines) {
			return multiWordLines[s];
		} else {
			return null;
		}
	}

	hashCode(s) {
		var code = 0;
		var len = s.length;
		for (var i = 0 ; i < len ; ++i) {
			code += ((code << 5) - code) + s.charCodeAt(i) >>> 0;
		}
		return code >>> 0;
	}

	//
	// Display disruptions request
	displayResult(obj) {
			/*
		obj = [
		{
			closureText: "minorDelays",
			description: "Central Line: Minor Delays Text"
		},
		{
			closureText: "partSuspended",
			description: "London Overground: Part Suspended Text"
		}
		]
		*/
		let s;
		if (obj.length > 0) {
			s = '<table>';
			let dups = [];
			for (let i = 0 ; i < obj.length ; ++i) {
				let p = obj[i];
				//
				// Check for duplicates - just rely on checking the hash rather than
				// re-checking the string content as well.
				//
				var hash = this.hashCode(p.description);
				if (dups.indexOf(hash) == -1) {
					dups.push(hash);
					let closureText = this.insertSpacesBeforeCapitals(p.closureText);
					let index = p.description.indexOf(':');
					if (index > 0) {
						let line = p.description.substring(0, index);
						let className = this.lineToClass(line);
						if (className) {
							s += '<tr><td class="line_box ' + className + '">';
						} else {
							s += "<tr><td>";
						}
						s += line + "<td>" + closureText + "<td>" + p.description.substring(index + 1) + "</tr>";
					} else {
						s += "<tr><td>-<td>" + closureText + "<td>" + p.description + "</tr>";
					}
				}
			}
			s += "</table>";
		} else {
			s 
			s = '<p class="disrupt_para">No Disruptions';
		}
		s += '<br>&emsp;' + Formatter.formatButton('Dismiss', 'disruptions.dismiss');
		this.frame.setHTML(s);
	}

	dismiss() {
		this.frame.clear();
	}

	//
	// Request processing methods
	//

	static url() {
		return "https://api.tfl.gov.uk/Line/Mode/tube,overground,dlr/Disruption";
	}

	static onClick(ev) {
		// In context of event handling
		disruptions.issueRequest();
	}

	issueRequest()
	{
		this.req = new Request();
		this.req.request(Disruptions.url(),
						 (status, obj) => this.resultCb(status, obj),
						 (req) => this.statusCb(req));
	}

	requestError(status) {
		disruptions.frame.setHTML("Error " + status + " requesting disruptions");
	}

	resultCb(status, obj) {
		this.req = null;
		if (status == 200) {
			this.displayResult(obj);
		} else {
			this.requestError(status);
		}
	}

	statusCb(req) {
		displayRequestStatus(this.frame, req);
	}
};

var disruptions = new Disruptions();


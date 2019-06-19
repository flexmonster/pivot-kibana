/** 
 * @license
 * Integration of FusionCharts with Flexmonster Pivot Table & Charts Component
 * Copyright (c) 2018 Flexmonster [https://flexmonster.com/]
 */
(function() {
	FlexmonsterFusioncharts = {};

	FlexmonsterFusioncharts.getData = function(options, callbackHandler, updateHandler) {
		var type = options.type;
		var _options = {
			type: options.type
		}

		//define slice to select the data you would like to show (different from data that flexmonster instance is showing)
		//leave it undefined to get the data that flexmonster instance is showing
		var slice = options.slice;
		
		//in case FlexmonsterFusioncharts does not include the type of chart you need 
		//or you need to preprocess the data in a different way
		//please use prepareDataFunction
		var _prepareDataFunction = options.prepareDataFunction;
		
		var _updateHandler;
		if (updateHandler != null) {
			_updateHandler = function(data) {
				if (_prepareDataFunction != undefined) {
					updateHandler(_prepareDataFunction(data, _options), data);
				} else {
					updateHandler(prepareData(data, _options.type), data);
				}
			};
		}

		this.instance.getData({
				slice: slice
			}, function(data) { 
				if (_prepareDataFunction != undefined) {
					callbackHandler(_prepareDataFunction(data, _options), data);
				} else {
					callbackHandler(prepareData(data, _options.type), data);
				}
			}, _updateHandler
		);
	}
	
	FlexmonsterFusioncharts.getNumberFormat = function(fmt) {
		var format = {};
		if (fmt != null) {
			var thousandsSeparator = (fmt["thousandsSeparator"] != undefined && fmt["thousandsSeparator"] != "");
			if (thousandsSeparator) {
				format.thousandSeparator = fmt["thousandsSeparator"];
			}

			var decimalSeparator = (fmt["decimalSeparator"] != undefined && fmt["decimalSeparator"] != "");
			if (decimalSeparator) {
				format.decimalSeparator = fmt["decimalSeparator"];
			}

			var decimalPlaces = (fmt["decimalPlaces"] != undefined && fmt["decimalPlaces"] != -1);
			if (decimalPlaces) {
				format.decimals = fmt["decimalPlaces"];
				format.forceDecimals = "1";
			}

			var currencySymbol = fmt["currencySymbol"] != undefined && fmt["currencySymbol"] != "";
			if (currencySymbol) {
				if (fmt["currencySymbolAlign"] == "left") {
					format.numberPrefix = fmt["currencySymbol"];
				} else if (fmt["currencySymbolAlign"] == "right") {
					format.numberSuffix = fmt["currencySymbol"];
				}
			}
		}
		return format;
	}

	function prepareData(data, type) {
		switch (type) {
			case "column2d":
			case "column3d":
			case "line":
			case "area2d":
			case "bar2d":
			case "bar3d":
			case "pie2d":
			case "pie3d":
			case "doughnut2d":
			case "doughnut3d":
			case "pareto2d":
			case "pareto3d":
			case "spline":
			case "splinearea":
				return prepareSingleSeriesChart(data, type);
			case "mscolumn2d":
			case "mscolumn3d":
			case "mscolumn3dlinedy":
			case "msline":
			case "msbar2d":
			case "msbar3d":
			case "msarea":
			case "marimekko":
			case "stackedcolumn2d":
			case "stackedcolumn3d":
			case "stackedbar2d":
			case "stackedbar2d":
			case "stackedarea2d":
			case "msspline":
			case "mssplinearea":
			case "radar":
				return prepareMultiSeriesChart(data, type);
			case "maps/worldwithcountries":
				return prepareMap(data, type);
			default:
				return data;
		}
	}
	
	function prepareSingleSeriesChart(data, type) {
		var output = prepareChartInfo(data, type);
		output.data = [];
		for (var i = 0; i < data.data.length; i++) {
			var elem = {};
			var record = data.data[i];
			if (data.meta["rAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined || record["c0"] != undefined || record["v0"] == undefined) continue;
				elem["label"] = record["r0"];
				elem["value"] = record["v0"];
			} else if (data.meta["cAmount"] > 0) {
				if (record["c0"] == undefined || record["c1"] != undefined || record["r0"] != undefined || record["v0"] == undefined) continue;
				elem["label"] = record["c0"];
				elem["value"] = record["v0"];
			} else {
				if (record["v0"] == undefined) continue;
				elem["value"] = record["v0"];
			}
			output.data.push(elem);
		}
		return output;
	}
	
	function prepareMultiSeriesChart(data, type) {
		var output = prepareChartInfo(data, type);
		
		output.categories = [];
		output.dataset = [];
		var categories = {};
		var series = {};
		for (var i = 0; i < data.data.length; i++) {
			var record = data.data[i];
			if (data.meta["rAmount"] > 0 && data.meta["cAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined || record["v0"] == undefined) continue;
				if (categories[record["r0"]] == undefined) categories[record["r0"]] = {"label": record["r0"]};
				if (record["c0"] == undefined || record["c1"] != undefined) continue;
				if (series[record["c0"]] == undefined) series[record["c0"]] = [];
				series[record["c0"]].push({"value": [record["v0"]]});
			} else if (data.meta["rAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined || record["v0"] == undefined) continue;
				if (categories[record["r0"]] == undefined) categories[record["r0"]] = {"label": record["r0"]};
				if (series[""] == undefined) series[""] = [];
				series[""].push({"value": [record["v0"]]});
			} else if (data.meta["cAmount"] > 0) {
				if (record["c0"] == undefined || record["c1"] != undefined || record["v0"] == undefined) continue;
				if (categories[record["c0"]] == undefined) categories[record["c0"]] = {"label": record["c0"]};
				if (series[""] == undefined) series[""] = [];
				series[""].push({"value": [record["v0"]]});
			}
		}
		
		var cats = [];
		for (var category in categories) {
			cats.push(categories[category]);
		}
		output.categories.push({"category": cats});
		for (var seriesname in series) {
			output.dataset.push({"seriesname": seriesname, "data": series[seriesname]});
		}
		
		return output;
	}
	
	function prepareChartInfo(data, type) {
		var output = {
			chart: {}
		};
		output.chart.caption = data.meta.caption;
		
		//number formatting
		var format = FlexmonsterFusioncharts.getNumberFormat(data.meta.formats[0]);
		for (var prop in format) {
			output.chart[prop] = format[prop];
		}
		//for the 2nd y axis
		if (data.meta.formats.length > 1) {
			var format2 = FlexmonsterFusioncharts.getNumberFormat(data.meta.formats[1]);
			for (var prop in format2) {
				output.chart["s"+prop] = format2[prop];
			}
		}
		
		switch (type) {
			case "pie2d":
			case "pie3d":
			case "doughnut2d":
			case "doughnut3d":
			case "radar":
				break;
			case "pareto2d":
			case "pareto3d":
				output.chart.pYAxisName = data.meta.v0Name;
				break;
			default:
				output.chart.xAxisName = (data.meta.r0Name != undefined) ? data.meta.r0Name : ((data.meta.c0Name != undefined) ? data.meta.c0Name : "");
				output.chart.yAxisName = data.meta.v0Name;
		}
		return output;
	}
	
	function prepareMap(data, type) {
		var output = prepareMapInfo(data, type);
		
		output.data = [];
		var minValue;
		var maxValue;
		for (var i = 0; i < data.data.length; i++) {
			var record = data.data[i];
			if (data.meta["rAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined || record["c0"] != undefined || record["v0"] == undefined) continue;
				output.data.push({
					"id": toMapID(record["r0"]),
					"value": record["v0"]
				});
				minValue = (minValue == undefined || record["v0"] < minValue) ? record["v0"] : minValue;
				maxValue = (maxValue == undefined || record["v0"] > maxValue) ? record["v0"] : maxValue;
			} else if (data.meta["cAmount"] > 0) {
				if (record["c0"] == undefined || record["c1"] != undefined || record["r0"] != undefined || record["v0"] == undefined) continue;
				output.data.push({
					"id": toMapID(record["c0"]),
					"value": record["v0"]
				});
				minValue = (minValue == undefined || record["v0"] < minValue) ? record["v0"] : minValue;
				maxValue = (maxValue == undefined || record["v0"] > maxValue) ? record["v0"] : maxValue;
			}
		}
		
		output.extradata = {
			"minValue": minValue,
			"maxValue": maxValue
		};
		
		return output;
	}
	
	function prepareMapInfo(data, type) {
		var output = {
			chart: {}
		};
		output.chart.caption = data.meta.caption;
		//number formatting
		var format = FlexmonsterFusioncharts.getNumberFormat(data.meta.formats[0]);
		for (var prop in format) {
			output.chart[prop] = format[prop];
		}
		return output;
	}
	
	function toMapID(label) {
		var countries = {
			"Antigua and Barbuda": "01",
			"Bahamas": "02",
			"Barbados": "03",
			"Belize": "04",
			"Canada": "05",
			"Costa Rica": "06",
			"Cuba": "07",
			"Dominica": "08",
			"Dominican Republic": "09",
			"El Salvador": "10",
			"Grenada": "11",
			"Guatemala": "12",
			"Haiti": "13",
			"Honduras": "14",
			"Jamaica": "15",
			"Mexico": "16",
			"Nicaragua": "17",
			"Panama": "18",
			"St.Kitts & Nevis": "19",
			"St.Lucia": "20",
			"St.Vincent & the Grenadines": "21",
			"Trinidad & Tobago": "22",
			"United States": "23",
			"Greenland": "24",
			"Argentina": "25",
			"Bolivia": "26",
			"Brazil": "27",
			"Chile": "28",
			"Colombia": "29",
			"Ecuador": "30",
			"Falkland Islands": "31",
			"French Guiana": "32",
			"Guyana": "33",
			"Paraguay": "34",
			"Peru": "35",
			"Suriname": "36",
			"Uruguay": "37",
			"Venezuela": "38",
			"Algeria": "39",
			"Angola": "40",
			"Benin": "41",
			"Botswana": "42",
			"Burkina Faso": "43",
			"Burundi": "44",
			"Cameroon": "45",
			"Cape Verde": "46",
			"Central African Republic": "47",
			"Chad": "48",
			"Comoros": "49",
			"Cote d’ivoire": "50",
			"Democratic Republic of the Congo": "51",
			"Djibouti": "52",
			"Egypt": "53",
			"Equatorial Guinea": "54",
			"Eritrea": "55",
			"Ethiopia": "56",
			"Gabon": "57",
			"Ghana": "58",
			"Guinea": "59",
			"Guinea-Bissau": "60",
			"Kenya": "61",
			"Lesotho": "62",
			"Liberia": "63",
			"Libya": "64",
			"Madagascar": "65",
			"Malawi": "66",
			"Mali": "67",
			"Mauritania": "68",
			"Morocco": "69",
			"Mozambique": "70",
			"Namibia": "71",
			"Niger": "72",
			"Nigeria": "73",
			"Rwanda": "74",
			"Sao Tome and Principe": "75",
			"Senegal": "76",
			"Seychelles": "77",
			"Sierra Leone": "78",
			"Somalia": "79",
			"South Africa": "80",
			"Sudan": "81",
			"Swaziland": "82",
			"Tanzania": "83",
			"Togo": "84",
			"Tunisia": "85",
			"Uganda": "86",
			"Western Sahara": "87",
			"Zambia": "88",
			"Zimbabwe": "89",
			"Gambia": "90",
			"Congo": "91",
			"Mauritius": "92",
			"Afghanistan": "93",
			"Armenia": "94",
			"Azerbaijan": "95",
			"Bangladesh": "96",
			"Bhutan": "97",
			"Brunei": "98",
			"Burma (Myanmar)": "99",
			"Cambodia": "100",
			"China": "101",
			"East Timor": "102",
			"Georgia": "103",
			"India": "104",
			"Indonesia": "105",
			"Iran": "106",
			"Japan": "107",
			"Kazakhstan": "108",
			"Korea (north)": "109",
			"Korea (south)": "110",
			"Kyrgyzstan": "111",
			"Laos": "112",
			"Malaysia": "113",
			"Mongolia": "114",
			"Nepal": "115",
			"Pakistan": "116",
			"Philippines": "117",
			"Russia": "118",
			"Singapore": "119",
			"Sri Lanka": "120",
			"Tajikistan": "121",
			"Thailand": "122",
			"Turkmenistan": "123",
			"Uzbekistan": "124",
			"Vietnam": "125",
			"Taiwan": "126",
			"Hong Kong": "127",
			"Macau": "128",
			"Albania": "129",
			"Andorra": "130",
			"Austria": "131",
			"Belarus": "132",
			"Belgium": "133",
			"Bosnia and Herzegovina": "134",
			"Bulgaria": "135",
			"Croatia": "136",
			"Czech Republic": "137",
			"Denmark": "138",
			"Estonia": "139",
			"Finland": "140",
			"France": "141",
			"Germany": "142",
			"Greece": "143",
			"Hungary": "144",
			"Iceland": "145",
			"Ireland": "146",
			"Italy": "147",
			"Latvia": "148",
			"Liechtenstein": "149",
			"Lithuania": "150",
			"Luxembourg": "151",
			"Macedonia": "152",
			"Malta": "153",
			"Moldova": "154",
			"Monaco": "155",
			"Montenegro": "156",
			"Netherlands": "157",
			"Norway": "158",
			"Poland": "159",
			"Portugal": "160",
			"Romania": "161",
			"San Marino": "162",
			"Serbia": "163",
			"Slovakia": "164",
			"Slovenia": "165",
			"Spain": "166",
			"Sweden": "167",
			"Switzerland": "168",
			"Ukraine": "169",
			"United Kingdom": "170",
			"Vatican City": "171",
			"Cyprus": "172",
			"Turkey": "173",
			"Australia": "175",
			"Fiji": "176",
			"Kiribati": "177",
			"Marshall Islands": "178",
			"Micronesia": "179",
			"Nauru": "180",
			"New Zealand": "181",
			"Palau": "182",
			"Papua New Guinea": "183",
			"Samoa": "184",
			"Solomon Islands": "185",
			"Tonga": "186",
			"Tuvalu": "187",
			"Vanuatu": "188",
			"New Caledonia": "189",
			"Bahrain": "190",
			"Iraq": "191",
			"Israel": "192",
			"Jordan": "193",
			"Kuwait": "194",
			"Lebanon": "195",
			"Oman": "196",
			"Qatar": "197",
			"Saudi Arabia": "198",
			"Syria": "199",
			"United Arab Emirates": "200",
			"Yemen": "201",
			"Puerto Rico": "202",
			"Cayman Islands": "203",
			"South Sudan": "204",
			"Kosovo": "205",
			"Aruba": "206",
			"Anguilla": "207",
			"American Samoa": "208",
			"Bermuda": "209",
			"Christmas Island": "210",
			"Cocos (Keeling) Islands": "211",
			"Cook Islands": "212",
			"Faroe Islands": "213",
			"French Polynesia": "214",
			"Gaza Strip": "215",
			"Gibraltar": "216",
			"Guadeloupe": "217",
			"Guam": "218",
			"Guernsey": "219",
			"Jersey": "220",
			"Kingman Reef": "221",
			"Maldives": "222",
			"Isle of Man": "223",
			"Martinique": "224",
			"Mayotte": "225",
			"Montserrat": "226",
			"BES Islands": "227",
			"Curacao": "228",
			"Sint Maarten": "229",
			"Niue": "230",
			"Norfolk Island": "231",
			"Northern Mariana Islands": "232",
			"Pitcairn Islands": "233",
			"Reunion": "234",
			"Saint Helena": "235",
			"Saint Pierre and Miquelon": "236",
			"Turks and Caicos Islands": "237",
			"Virgin Islands (UK)": "238",
			"Virgin Islands (US)": "239",
			"West Bank": "240",
			"Wallis and Futuna": "241"
		};
		if (countries[label] == undefined) {
			if (label == "Moldova Republic of") label = "Moldova";
			if (label == "United Kingdom (Scotland)") label = "United Kingdom";
			if (label == "Korea, Democratic People's Republic of") label = "Korea (north)";
			if (label == "Russian Federation") label = "Russia";
			
		}
		//if (countries[label] == undefined) console.log(">>>>", label);
		return (countries[label] != undefined) ? countries[label] : "";
	}
	
})();
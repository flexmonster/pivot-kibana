/** 
 * @license
 * Integration of Google Charts with Flexmonster Pivot Table & Charts Component
 * Copyright (c) 2018 Flexmonster [https://flexmonster.com/]
 */
(function() {
	FlexmonsterGooglecharts = {};

	FlexmonsterGooglecharts.getData = function(options, callbackHandler, updateHandler) {
		var type = options.type;

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
					updateHandler(_prepareDataFunction(data), data);
				} else {
					updateHandler(prepareData(data, type), data);
				}
			};
		}

		this.instance.getData({
				slice: slice
			}, function(data) { 
				if (_prepareDataFunction != undefined) {
					callbackHandler(_prepareDataFunction(data), data);
				} else {
					callbackHandler(prepareData(data, type), data);
				}
			}, _updateHandler
		);
	}
	
	FlexmonsterGooglecharts.getNumberFormat = function(format) {
		if (format == null) return {};
		var googleFormat = {
			decimalSymbol: format["decimalSeparator"]
		};
		if (format["decimalPlaces"] != undefined && format["decimalPlaces"] != -1) {
			googleFormat.fractionDigits = format["decimalPlaces"];
		}
		if (format["thousandsSeparator"] != undefined && format["thousandsSeparator"] != "") {
			googleFormat.groupingSymbol = format["thousandsSeparator"];
		}
		if (format["currencySymbol"] != undefined && format["currencySymbol"] != "") {
			if (format["currencySymbolAlign"] == "left" || (format["isPercent"] == true && format["currencySymbol"] == "%")) {
				googleFormat.prefix = format["currencySymbol"];
			} else {
				googleFormat.suffix = format["currencySymbol"];
			}
		} else  if (format["isPercent"] == true) {
			googleFormat.suffix = "%";
		}
		return googleFormat;
	}
	
	FlexmonsterGooglecharts.getNumberFormatPattern = function(format) {
		var str = "###";
		if (format == null) return str;
		var thousandsSeparator = (format["thousandsSeparator"] != undefined && format["thousandsSeparator"] != "");
		if (thousandsSeparator) {
			str = "#," + str;
		}
		var decimalPlaces = (format["decimalPlaces"] != undefined && format["decimalPlaces"] > 0);
		if (decimalPlaces) {
			str = str + format["decimalSeparator"];
			for (var i = 0; i < format["decimalPlaces"]; i++) {
				str = str + "#";
			}
		}
		if (format["currencySymbol"] != undefined && format["currencySymbol"] != "") {
			str = (format["currencySymbolAlign"] == "left" || (format["isPercent"] == true && format["currencySymbol"] == "%"))
				? format["currencySymbol"]+str
				: str+format["currencySymbol"];
		} else if (format["isPercent"] == true) {
			str = str+"%";
		}
		return str;
	}

	function prepareData(data, type) {
		var output = {};
		output.options = prepareChartInfo(data);
		switch (type) {
			case "area":
			case "bar":
			case "column":
			case "line":
			case "pie":
				prepareSingleSeries(output, data);
				break;
			case "sankey":
			default:
				prepareSeries(output, data);
		}
		return output;
	}

	function prepareChartInfo(data) {
		var output = {
			title: data.meta.caption,
			/*hAxis: {
				title: (data.meta.r0Name != undefined) ? data.meta.r0Name : ((data.meta.c0Name != undefined) ? data.meta.c0Name : "")
			},
			vAxis: {
				title: data.meta.v0Name
			}*/
		};
		return output;
	}
	
	function prepareSingleSeries(output, data) {
		var table = [];
		var basedOnRows = false;
		var basedOnColumns = false;
		for (var i = 0; i < data.data.length; i++) {
			if (i == 0) {
				var headerRow = [];
				if (data.meta["rAmount"] > 0) {
					headerRow.push(data.meta["r0Name"]);
					basedOnRows = true;
				} else if (data.meta["cAmount"] > 0) {
					headerRow.push(data.meta["c0Name"]);
					basedOnColumns = true;
				}
				for (var j = 0; j < data.meta["vAmount"]; j++) {
					headerRow.push(data.meta["v"+j+ "Name"]);
				}
				table.push(headerRow);
			}
			var record = data.data[i];
			var recordIsNotAFact = false;
			var _record = [];
			if (basedOnRows) {
				if (record["r0"] == undefined || record["r1"] != undefined || record["c0"] != undefined || record["v0"] == undefined) continue;
				_record.push(record["r0"]);
			}
			if (basedOnColumns) {
				if (record["c0"] == undefined || record["c1"] != undefined || record["r0"] != undefined || record["v0"] == undefined) continue;
				_record.push(record["c0"]);
			}
			for (var j = 0; j < data.meta["vAmount"]; j++) {
				if (record["v"+j] == undefined) {
					recordIsNotAFact = true;
					continue;
				}
				_record.push(!isNaN(record["v"+j]) ? record["v"+j] : 0);
			}
			
			if (recordIsNotAFact) continue;
			table.push(_record);
		}
		output.data = table;
	}
	
	function prepareSeries(output, data) {
		var table = [];
		for (var i = 0; i < data.data.length; i++) {
			if (i == 0) {
				var headerRow = [];
				for (var j = 0; j < data.meta["rAmount"]; j++) {
					headerRow.push(data.meta["r"+j+ "Name"]);
				}
				for (var j = 0; j < data.meta["cAmount"]; j++) {
					headerRow.push(data.meta["c"+j+ "Name"]);
				}
				for (var j = 0; j < data.meta["vAmount"]; j++) {
					headerRow.push(data.meta["v"+j+ "Name"]);
				}
				table.push(headerRow);
			}
			var record = data.data[i];
			var recordIsNotAFact = false;
			var _record = [];
			for (var j = 0; j < data.meta["rAmount"]; j++) {
				if (record["r"+j] == undefined) {
					recordIsNotAFact = true;
					continue;
				}
				_record.push(record["r"+j]);
			}
			for (var j = 0; j < data.meta["cAmount"]; j++) {
				if (record["c"+j] == undefined) {
					recordIsNotAFact = true;
					continue;
				}
				_record.push(record["c"+j]);
			}
			for (var j = 0; j < data.meta["vAmount"]; j++) {
				if (record["v"+j] == undefined) {
					recordIsNotAFact = true;
					continue;
				}
				_record.push(!isNaN(record["v"+j]) ? record["v"+j] : 0);
			}
			
			if (recordIsNotAFact) continue;
			table.push(_record);
		}
		output.data = table;
	}
	
})();
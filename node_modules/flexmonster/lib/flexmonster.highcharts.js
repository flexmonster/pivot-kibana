/** 
 * @license
 * Integration of Highcharts with Flexmonster Pivot Table & Charts Component
 * Copyright (c) 2018 Flexmonster [https://flexmonster.com/]
 */
(function() {
	FlexmonsterHighcharts = {};

	FlexmonsterHighcharts.getData = function(options, callbackHandler, updateHandler) {
		var _options = {
			type: options.type,
			xAxisType: (options.xAxisType == "datetime") ? options.xAxisType : "",
			valuesOnly: (options.valuesOnly != undefined && options.valuesOnly == true) ? true : false,
			withDrilldown: (options.withDrilldown != undefined && options.withDrilldown == true) ? true : false
		}

		//define slice to select the data you would like to show (different from data that flexmonster instance is showing)
		//leave it undefined to get the data that flexmonster instance is showing
		var slice = options.slice;
		
		//in case FlexmonsterHighcharts does not include the type of chart you need 
		//or you need to preprocess the data in a different way
		//please use prepareDataFunction
		var _prepareDataFunction = options.prepareDataFunction;

		var _updateHandler;
		if (updateHandler != null) {
			_updateHandler = function(data) { 
				if (_prepareDataFunction != undefined) {
					updateHandler(_prepareDataFunction(data, _options), data);
				} else {
					_options.withDrilldown = options.withDrilldown && data.meta["rAmount"] > 0 && data.meta["cAmount"] > 0; //not enough data
					updateHandler(prepareData(data, _options), data);
				}
			};
		}

		this.instance.getData({
				slice: slice
			}, function(data) { 
				if (_prepareDataFunction != undefined) {
					callbackHandler(_prepareDataFunction(data, _options), data);
				} else {
					_options.withDrilldown = options.withDrilldown && data.meta["rAmount"] > 0 && data.meta["cAmount"] > 0; //not enough data
					callbackHandler(prepareData(data, _options), data);
				}
			}, _updateHandler
		);
	}
	
	FlexmonsterHighcharts.getAxisFormat = function(format) {
		return getFormatedString("value", format);
	}
	
	FlexmonsterHighcharts.getPointXFormat = function(format) {
		return getFormatedString("point.x", format);
	}
	
	FlexmonsterHighcharts.getPointYFormat = function(format) {
		return getFormatedString("point.y", format);
	}
	
	FlexmonsterHighcharts.getPointZFormat = function(format) {
		return getFormatedString("point.z", format);
	}

	function getFormatedString(val, format) {
		var str = val;
		if (format == null) return str;
		var thousandsSeparator = (format["thousandsSeparator"] != undefined && format["thousandsSeparator"] != "");
		var decimalPlaces = (format["decimalPlaces"] != undefined && format["decimalPlaces"] != -1);
		if (thousandsSeparator || decimalPlaces) {
			str = thousandsSeparator
				? str + ":,." + (decimalPlaces ? format["decimalPlaces"] : "") + "f"
				: str + ":." + (decimalPlaces ? format["decimalPlaces"] : "") + "f";
		}
		str = "{" + str + "}";
		if (format["currencySymbol"] != undefined && format["currencySymbol"] != "") {
			str = (format["currencySymbolAlign"] == "left")
				? format["currencySymbol"]+str
				: str+format["currencySymbol"];
		}
		return str;
	}
	
	function prepareData(data, options) {
		switch (options.type) {
			case "area":
			case "areaspline":
			case "bar":
			case "column":
			case "waterfall":
				return prepareDataWithCategories(data, options);
			case "funnel":
			case "pie":
			case "pyramid":
				return prepareDataForPie(data, options);
			case "arearange":
			case "areasplinerange":
			case "columnrange":
			case "errorbar":
				return prepareDataRange(data, options);
			case "bubble":
				return prepareDataForBubble(data, options);
			case "scatter":
				options.valuesOnly = true;
			case "polygon":
			case "spline":
			default:
				//line chart
				if (options.valuesOnly == true) {
					return prepareDataWithNumbers(data, options);
				} else {
					return prepareDataWithCategories(data, options);
				}
			//not included
			//case "boxplot":
			//case "gauge":
			//case "solidgauge":
			//case "heatmap":
			//case "treemap":
		}
	}
	
	function prepareDataWithCategories(data, options) {
		var output = prepareChartInfo(data, options);
		if (options.withDrilldown) {
			prepareSeriesWithDrilldown(output, data);
		} else {
			if (options.xAxisType == "datetime") {
				prepareSeriesDatetime(output, data);
			} else {
				prepareSeries(output, data);
			}
		}
		return output;
	}

	function prepareDataForPie(data, options) {
		var output = prepareChartInfo(data, options);
		if (options.withDrilldown) {
			prepareSeriesWithDrilldown(output, data);
		} else {
			prepareSeriesWithY(output, data);
		}
		return output;
	}
	
	function prepareDataWithNumbers(data, options) {
		var output = prepareChartInfo(data, options);
		prepareSeriesXYNumeric(output, data);
		return output;
	}

	function prepareDataRange(data, options) {
		var output = prepareChartInfo(data, options);
		prepareSeriesRange(output, data);
		return output;
	}

	function prepareDataForBubble(data, options) {
		var output = prepareChartInfo(data, options);
		if (options.valuesOnly == true) {
			prepareSeriesXYZNumeric(output, data);
		} else {
			prepareSeriesXYZ(output, data);
		}
		return output;
	}

	function prepareChartInfo(data, options) {
		var output = {
			title: {
				text: data.meta.caption
			}
		};

		if (options.type != undefined) output.chart =  { type: options.type };

		if (options.valuesOnly == true) {
			output.xAxis = {
				title: {
					text: data.meta.v0Name
				}
			};
			output.yAxis = {
				title: {
					text: (data.meta.v1Name != undefined) ? data.meta.v1Name : ""
				}
			};
		} else { 
			output.xAxis = {
				title: {
					text: (data.meta.r0Name != undefined) ? data.meta.r0Name : ((data.meta.c0Name != undefined) ? data.meta.c0Name : "")
				}
			};
			output.yAxis = [];
			var yAxesAmount = (options.valuesOnly == true || options.withDrilldown == true 
							|| options.type == "arearange" || options.type == "areasplinerange" 
							|| options.type == "columnrange" || options.type == "errorbar"
							|| options.type == "bubble")
							? 1 : data.meta.vAmount;
			for (var i = 0; i < yAxesAmount; i++) {
				output.yAxis.push({
					title: {
						text: data.meta["v"+i+"Name"]
					},
					opposite: (i > 0)
				});
			}
		}		
		
		if (options.xAxisType == "datetime") {
			output.xAxis.type = "datetime";
		}
		if (options.withDrilldown) {
			output.xAxis.type = "category";
		}
		
		return output;
	}
	
	function prepareSeries(output, data) {
		var categories = [];
		var series = {};
		var _yName;
		var _seriesName;
		var value;
		var _seriesBasedOnC = false;
		for (var i = 0; i < data.data.length; i++) {
			var record = data.data[i];
			if (data.meta["rAmount"] > 0 && data.meta["cAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined) continue;
				if (categories.indexOf(record["r0"]) == -1) categories.push(record["r0"]);
				if (record["c0"] == undefined || record["c1"] != undefined) continue;
				_seriesBasedOnC = true;
			} else if (data.meta["rAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined) continue;
				if (categories.indexOf(record["r0"]) == -1) categories.push(record["r0"]);
			} else if (data.meta["cAmount"] > 0) {
				if (record["c0"] == undefined || record["c1"] != undefined) continue;
				if (categories.indexOf(record["c0"]) == -1) categories.push(record["c0"]);
			}
			for (var j = 0; j < data.meta.vAmount; j++) {
				_yName = data.meta["v"+j+"Name"];
				_seriesName = _seriesBasedOnC ? record["c0"] : _yName;
				if (series[_yName] == undefined) {
					series[_yName] = {};
				}
				if (series[_yName][_seriesName] == undefined) {
					series[_yName][_seriesName] = [];
				}
				value = isNaN(record["v"+j]) ? null : record["v"+j];
				series[_yName][_seriesName].push(value);
			}
		}
		output.xAxis.categories = categories;

		output.series = [];
		var yn = 0;
		for (var yAxis in series) {
			var _series = series[yAxis];
			for (var seriesname in _series) {
				var s = {
					name: (data.meta["rAmount"] > 0 && data.meta["cAmount"] > 0 && data.meta["vAmount"] > 1) 
							? yAxis + " - " + seriesname 
							: seriesname,
					data: _series[seriesname]
				};
				if (output.yAxis.length > 1) {
					s.yAxis = yn;
				}
				output.series.push(s);
			}
			if (output.yAxis.length > 1) {
				yn++;
			}
		}
	}
	
	function prepareSeriesDatetime(output, data) {
		var categories = [];
		var series = {};
		var _yName;
		var _seriesName;
		var value;
		var _seriesBasedOnC = false;
		for (var i = 0; i < data.data.length; i++) {
			var record = data.data[i];
			if (data.meta["rAmount"] > 0 && data.meta["cAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined) continue;
				if (categories.indexOf(record["r0"]) == -1) categories.push(record["r0"]);
				if (record["c0"] == undefined || record["c1"] != undefined) continue;
				_seriesBasedOnC = true;
			} else if (data.meta["rAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined) continue;
				if (categories.indexOf(record["r0"]) == -1) categories.push(record["r0"]);
			} else if (data.meta["cAmount"] > 0) {
				if (record["c0"] == undefined || record["c1"] != undefined) continue;
				if (categories.indexOf(record["c0"]) == -1) categories.push(record["c0"]);
			}
			for (var j = 0; j < data.meta.vAmount; j++) {
				_yName = data.meta["v"+j+"Name"];
				_seriesName = _seriesBasedOnC ? record["c0"] : _yName;
				if (series[_yName] == undefined) {
					series[_yName] = {};
				}
				if (series[_yName][_seriesName] == undefined) {
					series[_yName][_seriesName] = [];
				}
				value = isNaN(record["v"+j]) ? null : record["v"+j];
				series[_yName][_seriesName].push([(record["r0"] != undefined ? record["r0"] : record["c0"]), value]);
			}
		}
		//output.xAxis.categories = categories;

		output.series = [];
		var yn = 0;
		for (var yAxis in series) {
			var _series = series[yAxis];
			for (var seriesname in _series) {
				var s = {
					name: (data.meta["rAmount"] > 0 && data.meta["cAmount"] > 0 && data.meta["vAmount"] > 1) 
							? yAxis + " - " + seriesname 
							: seriesname,
					data: _series[seriesname]
				};
				if (output.yAxis.length > 1) {
					s.yAxis = yn;
				}
				output.series.push(s);
			}
			if (output.yAxis.length > 1) {
				yn++;
			}
		}
	}
	
	function prepareSeriesWithY(output, data) {
		var series = {};
		var value;
		for (var i = 0; i < data.data.length; i++) {
			var record = data.data[i];
			if (data.meta["rAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined || record["c0"] != undefined) continue;
				if (series[data.meta.v0Name] == undefined) series[data.meta.v0Name] = [];
				value = isNaN(record["v0"]) ? null : record["v0"];
				series[data.meta.v0Name].push({ name: record["r0"], y: value} );
			} else if (data.meta["cAmount"] > 0) {
				if (record["c0"] == undefined || record["c1"] != undefined || record["r0"] != undefined) continue;
				if (series[data.meta.v0Name] == undefined) series[data.meta.v0Name] = [];
				value = isNaN(record["v0"]) ? null : record["v0"];
				series[data.meta.v0Name].push({ name: record["c0"], y: value} );
			}
		}
		output.series = [];
		for (var seriesname in series) {
			output.series.push({"name": seriesname, "data": series[seriesname]});
		}
	}
	
	function prepareSeriesXYNumeric(output, data) {
		output.series = [];
		if (data.meta.v1Name == undefined) return; //not enough data
		var series = {};
		var xValue;
		var yValue;
		for (var i = 0; i < data.data.length; i++) {
			var record = data.data[i];
			if (data.meta["rAmount"] > 0 && data.meta["cAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined || record["c0"] == undefined || record["c1"] != undefined) continue;
				if (series[record["c0"]] == undefined) series[record["c0"]] = [];
				xValue = isNaN(record["v0"]) ? null : record["v0"];
				yValue = isNaN(record["v1"]) ? null : record["v1"];
				series[record["c0"]].push({ name: record["r0"], x: xValue, y: yValue });
			} else if (data.meta["rAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined) continue;
				if (series[data.meta.v1Name] == undefined) series[data.meta.v1Name] = [];
				xValue = isNaN(record["v0"]) ? null : record["v0"];
				yValue = isNaN(record["v1"]) ? null : record["v1"];
				series[data.meta.v1Name].push({ name: record["r0"], x: xValue, y: yValue });
			} else if (data.meta["cAmount"] > 0) {
				if (record["c0"] == undefined || record["c1"] != undefined) continue;
				if (series[data.meta.v1Name] == undefined) series[data.meta.v1Name] = [];
				xValue = isNaN(record["v0"]) ? null : record["v0"];
				yValue = isNaN(record["v1"]) ? null : record["v1"];
				series[data.meta.v1Name].push({ name: record["c0"], x: xValue, y: yValue });
			}
		}
		for (var seriesname in series) {
			output.series.push({"name": seriesname, "data": series[seriesname]});
		}
	}
	
	function prepareSeriesXYZNumeric(output, data) {
		output.series = [];
		if (data.meta.v2Name == undefined) return; //not enough data
		var series = {};
		var xValue;
		var yValue;
		var zValue;
		for (var i = 0; i < data.data.length; i++) {
			var record = data.data[i];
			if (data.meta["rAmount"] > 0 && data.meta["cAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined || record["c0"] == undefined || record["c1"] != undefined) continue;
				if (series[record["c0"]] == undefined) series[record["c0"]] = [];
				xValue = isNaN(record["v0"]) ? null : record["v0"];
				yValue = isNaN(record["v1"]) ? null : record["v1"];
				zValue = isNaN(record["v2"]) ? null : record["v2"];
				series[record["c0"]].push({ name: record["r0"], x: xValue, y: yValue, z: zValue });
			} else if (data.meta["rAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined || record["c0"] != undefined) continue;
				if (series[data.meta.v2Name] == undefined) series[data.meta.v2Name] = [];
				xValue = isNaN(record["v0"]) ? null : record["v0"];
				yValue = isNaN(record["v1"]) ? null : record["v1"];
				zValue = isNaN(record["v2"]) ? null : record["v2"];
				series[data.meta.v2Name].push({ name: record["r0"], x: xValue, y: yValue, z: zValue });
			} else if (data.meta["cAmount"] > 0) {
				if (record["c0"] == undefined || record["c1"] != undefined || record["r0"] != undefined) continue;
				if (series[data.meta.v2Name] == undefined) series[data.meta.v2Name] = [];
				xValue = isNaN(record["v0"]) ? null : record["v0"];
				yValue = isNaN(record["v1"]) ? null : record["v1"];
				zValue = isNaN(record["v2"]) ? null : record["v2"];
				series[data.meta.v2Name].push({ name: record["c0"], x: xValue, y: yValue, z: zValue });
			}
		}

		for (var seriesname in series) {
			output.series.push({"name": seriesname, "data": series[seriesname]});
		}
	}

	function prepareSeriesXYZ(output, data) {
		output.series = [];
		if (data.meta.v1Name == undefined) return; //not enough data
		var categories = [];
		var series = {};
		var yValue;
		var zValue;
		for (var i = 0; i < data.data.length; i++) {
			var record = data.data[i];
			if (data.meta["rAmount"] > 0 && data.meta["cAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined) continue;
				if (categories.indexOf(record["r0"]) == -1) categories.push(record["r0"]);
				if (record["c0"] == undefined || record["c1"] != undefined) continue;
				if (series[record["c0"]] == undefined) series[record["c0"]] = [];
				yValue = isNaN(record["v0"]) ? null : record["v0"];
				zValue = isNaN(record["v1"]) ? null : record["v1"];
				series[record["c0"]].push([ record["r0"], yValue, zValue ]);
			} else if (data.meta["rAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined || record["c0"] != undefined) continue;
				if (series[data.meta.v1Name] == undefined) series[data.meta.v1Name] = [];
				yValue = isNaN(record["v0"]) ? null : record["v0"];
				zValue = isNaN(record["v1"]) ? null : record["v1"];
				series[data.meta.v1Name].push([ record["r0"], yValue, zValue ]);
			} else if (data.meta["cAmount"] > 0) {
				if (record["c0"] == undefined || record["c1"] != undefined || record["r0"] != undefined) continue;
				if (series[data.meta.v1Name] == undefined) series[data.meta.v1Name] = [];
				yValue = isNaN(record["v0"]) ? null : record["v0"];
				zValue = isNaN(record["v1"]) ? null : record["v1"];
				series[data.meta.v1Name].push([ record["c0"], yValue, zValue ]);
			}
		}

		output.xAxis.categories = categories;

		for (var seriesname in series) {
			output.series.push({"name": seriesname, "data": series[seriesname]});
		}
	}

	function prepareSeriesWithDrilldown(output, data) {//can drill be for more than one level?
		var mainSeries = {};
		var series = {};
		var value;
		for (var i = 0; i < data.data.length; i++) {
			var record = data.data[i];
			if (data.meta["rAmount"] > 0 && data.meta["cAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined) continue;
				if (mainSeries[data.meta["r0Name"]] == undefined) mainSeries[data.meta["r0Name"]] = [];
				if (record["c0"] == undefined) {
					value = isNaN(record["v0"]) ? null : record["v0"];
					mainSeries[data.meta["r0Name"]].push({ name: record["r0"], y: value, drilldown: record["r0"] });
				}
				if (record["c0"] == undefined || record["c1"] != undefined) continue;
				if (series[record["r0"]] == undefined) series[record["r0"]] = [];
				value = isNaN(record["v0"]) ? null : record["v0"];
				series[record["r0"]].push([record["c0"], value]);
			}
		}
		
		output.series = [];
		for (var mainseriesname in mainSeries) {
			output.series.push({"name": mainseriesname, colorByPoint: true, "data": mainSeries[mainseriesname]});
		}
		
		output.drilldown = {};
		output.drilldown.series = [];
		for (var seriesname in series) {
			output.drilldown.series.push({"name": seriesname, "id": seriesname, "data": series[seriesname]});
		}
	}

	function prepareSeriesRange(output, data) {
		var categories = [];
		var series = {};
		var low;
		var high;
		for (var i = 0; i < data.data.length; i++) {
			var record = data.data[i];
			if (data.meta["rAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined || record["c0"] != undefined) continue;
				if (categories.indexOf(record["r0"]) == -1) categories.push(record["r0"]);
			} else if (data.meta["cAmount"] > 0) {
				if (record["c0"] == undefined || record["c1"] != undefined || record["r0"] != undefined) continue;
				if (categories.indexOf(record["c0"]) == -1) categories.push(record["c0"]);
			}
			if (series[data.meta.v0Name] == undefined) series[data.meta.v0Name] = [];
			low = isNaN(record["v0"]) ? null : record["v0"];
			high = (data.meta.v1Name != undefined) 
				? isNaN(record["v1"]) ? null : record["v1"]
				: low;
			series[data.meta.v0Name].push([low, high]);
		}

		output.xAxis.categories = categories;

		output.series = [];
		for (var seriesname in series) {
			output.series.push({"name": seriesname, "data": series[seriesname]});
		}
	}
	
})();
module.exports = {
	parseCSV : function(fileName, callBack) {
		var presentInstance = this;
		var fs = require('fs');
		fs.exists(fileName, function(exists) {
			if(exists) {
				return presentInstance.parseFile(fileName, callBack);
			} else {
				console.log("The provided file " + fileName + " doesn't exists or inaccessible");
			}
		});
	},

	parseFile : function(fileName, callBack) {
		var presentInstance = this;
		var fs = require('fs');
		fs.readFile(fileName, 'utf-8', function(data) {
			var dataArray = presentInstance.getDataSeparatedByNewLine(data);
			var finalDataArray = presentInstance.getDataArray(dataArray);
			callBack(finalDataArray);
		})
	},

	getDataSeparatedByNewLine : function(data) {
		var dataArray = data.split("\n");
		return dataArray;
	},

	getDataArray : function(dataArray) {
		presentInstance = this;
		var attributeNameArray = dataArray[0].split(",");
		var finalArray = [];
		for(var index=1; index<dataArray.length; index++) {
			var tempArray = [];
			var dataList = presentInstance.getDataFromLine(dataArray[index]);
			for(var index2=0; index2<attributeNameArray.length; index2++) {
				tempArray[attributeNameArray[index2]] = dataList[index2];
			}
			finalArray.push(tempArray);
		}
		return finalArray;

	},

	getDataFromLine : function(line) {
		
	}

}
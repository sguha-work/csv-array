module.exports = {
	maxSizeForDirectRead : 10000000,
	parseCSV : function(fileName, callBack) {
		var presentInstance = this;
		var fs = require('fs');
		fs.exists(fileName, function(exists) {
			if(exists) {
				fs.stat(fileName, function(err, stats){
					if(stats.size > presentInstance.maxSizeForDirectRead) {
						presentInstance.parseBigFile(fileName, callBack);
					} else {
						presentInstance.parseFile(fileName, callBack);	
					}
				});
			} else {
				console.log("The provided file " + fileName + " doesn't exists or inaccessible");
			}
		});
	},

	parseFile : function(fileName, callBack) {
		var presentInstance = this;
		var fs = require('fs');
		fs.readFile(fileName, 'utf-8', function(err, data) {
			var dataArray = presentInstance.getDataSeparatedByNewLine(data);
			var finalDataArray = presentInstance.getDataArray(dataArray);
			callBack(finalDataArray);
		})
	},

	getDataSeparatedByNewLine : function(data) {
		var dataArray = data.split("\n");
		return dataArray;
	},

	// returns total data
	getDataArray : function(dataArray) {
		presentInstance = this;
		var attributeNameArray = dataArray[0].split(",");
		var finalArray = [];
		for(var index=1; index<dataArray.length; index++) {
			var tempArray = {};
			var dataList = presentInstance.getDataFromLine(dataArray[index]);
			for(var index2=0; index2<attributeNameArray.length; index2++) {
				tempArray[attributeNameArray[index2]] = dataList[index2];
			}
			finalArray.push(tempArray);
		}
		return finalArray;

	},

	// returns data from a single line 
	getDataFromLine : function(line) {
		var dataArray = [];
		var tempString="";
		for(var index=0; index<line.length; index++) {
			if(line[index]=='"') {
				var index2=index+1;
				while(line[index2]!='"') {
					tempString += line[index2];
					index2++;
				}
				dataArray.push(tempString);
				tempString = "";
				index = index2 + 1;
			}else if(line[index] != ",") {
				tempString += line[index];
			} else {
				dataArray.push(tempString);
				tempString = "";
			}
		}
		return dataArray;
	},
	tempLineCounter : 0,// only used for large files
	tempDataArray : [],// only used for large files
	tempAttributeNameArray : [],// only used for large files
	parseBigFile : function(fileName, callBack) {
		var presentObject = module.exports;
		var lblReader = require('line-by-line');
		var readStream = new lblReader(fileName);

		presentObject.tempDataArray = [];
		presentObject.tempAttributeNameArray = [];
		presentObject.tempLineCounter = 0;
		
		readStream.on('error', function(){
			console.log("cannot read the file any more.");
		});
		readStream.on('line', function(line) {
			readStream.pause();
			presentObject.buildOutputData(line);
			setTimeout(function() {
				readStream.resume();
			},100);
			
		});
		readStream.on('end', function() {
			callBack(presentObject.tempDataArray);
		});
	},

	buildOutputData : function(line) {
		var presentObject = module.exports;
		if(presentObject.tempLineCounter == 0) {
			presentObject.tempAttributeNameArray = line.split(",");
		} else {
			var dataArray = presentObject.getDataFromLine(line);
			var tempObject = {};
			for(var index=0; index<presentObject.tempAttributeNameArray.length; index++) {
				tempObject[presentObject.tempAttributeNameArray[index]] = dataArray[index];
			}
			presentObject.tempDataArray.push(tempObject);
		}
		presentObject.tempLineCounter += 1;
	}

}

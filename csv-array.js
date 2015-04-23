module.exports = {
	maxSizeForDirectRead : 100,
	parseCSV : function(fileName, callBack) {
		var presentInstance = this;
		var fs = require('fs');
		fs.exists(fileName, function(exists) {
			if(exists) {
				presentInstance.parseBigFile(fileName, callBack);
			} else {
				console.log("The provided file " + fileName + " doesn't exists or inaccessible");
			}
		});
	},

	// returns data from a single line 
	getDataFromLine : function(line) {
		var dataArray = [];
		var tempString="";
		var lineLength = line.length;
		for(var index=0; index<lineLength; index++) {
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
			presentObject.buildOutputData(line);
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
			var tempAttributeNameArrayLength = presentObject.tempAttributeNameArray.length;
			for(var index=0; index<tempAttributeNameArrayLength; index++) {
				tempObject[presentObject.tempAttributeNameArray[index]] = dataArray[index];
			}
			presentObject.tempDataArray.push(tempObject);
		}
		presentObject.tempLineCounter += 1;
	}

}

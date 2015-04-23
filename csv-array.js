module.exports = {
	maxSizeForDirectRead : 100,
	parseCSV : function(fileName, callBack) {
		var presentInstance = this;
		var fs = require('fs');
		fs.exists(fileName, function(exists) {
			if(exists) {
				presentInstance.parseFile(fileName, callBack);
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
	
	parseFile : function(fileName, callBack) {
		var presentObject = module.exports;
		var lblReader = require('line-by-line');
		var readStream = new lblReader(fileName);

		var tempDataArray = [];
		var tempAttributeNameArray = [];
		var tempLineCounter = 0;
		
		readStream.on('error', function(){
			console.log("cannot read the file any more.");
		});
		
		readStream.on('line', function(line) {
			readStream.pause();
			setTimeout(function () {
				if(tempLineCounter == 0) {
					tempAttributeNameArray = line.split(",");
					if(tempAttributeNameArray.length == 1) {
						tempDataArray.push(line);
					}
					tempLineCounter = 1;
				} else {
					if(tempAttributeNameArray.length == 1) {
						tempDataArray.push(line);
					} else {
						tempDataArray.push(presentObject.buildOutputData(tempAttributeNameArray, line));
					}
				}
		        readStream.resume();
		    }, 2);
			
		});
		
		readStream.on('end', function() {
			if(tempDataArray.length == 0) {
				tempDataArray = tempAttributeNameArray;
			}
			callBack(tempDataArray);
		});
	},

	buildOutputData : function(tempAttributeNameArray, line) {
		var presentObject = module.exports;
		
			var dataArray = presentObject.getDataFromLine(line);
			var tempObject = {};
			var tempAttributeNameArrayLength = tempAttributeNameArray.length;
			for(var index=0; index<tempAttributeNameArrayLength; index++) {
				tempObject[tempAttributeNameArray[index]] = dataArray[index];
			}
			return tempObject;
		
		
	}

}

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
		
	}

}
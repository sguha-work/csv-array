class CSVArray {
	checkOption(userGivenOption) {
		let systemGeneretedOption;
		return systemGeneretedOption;
	}
	parseCSV(fileName, option) {
		let option = this.checkOption(option);
	}
}
module.exports = {
	
	parseCSV: (fileName, option) => {
		let obj = new CSVArray();
		return new Promise((resolve, reject) => {
			obj.parseCSV(fileName, option).then((data) => {
				resolve(data);
			}).catch((error) => {
				reject(error);
			});
		});
			
	}

}

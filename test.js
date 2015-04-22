var csv = require('./csv-array');
csv.parseCSV("test.csv", function(data){
	console.log(JSON.stringify(data));
});
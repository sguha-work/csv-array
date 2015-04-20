var csv = require('./csv-parse');
csv.parseCSV("test.csv", function(data){
	console.log(JSON.stringify(data));
});
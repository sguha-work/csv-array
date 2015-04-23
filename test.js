var csv = require('./csv-array');
csv.parseCSV("test2.csv", function(data){
	console.log(JSON.stringify(data));
	console.log("*****************");
});

// csv.parseCSV("test2.csv", function(data){
// 	console.log(JSON.stringify(data));
	
// });
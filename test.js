var csv = require('./csv-array');
var fs = require('fs');
csv.parseCSV("test2.csv", function(data){
	fs.writeFile("test.json", JSON.stringify(data), function(){console.log("done")});
});

// csv.parseCSV("test2.csv", function(data){
// 	console.log(JSON.stringify(data));
	
// });
var csv = require('./csv-array');
var fs = require('fs');
// csv.parseCSV("test.csv", function(data){
// 	fs.writeFile("test.json", JSON.stringify(data), function(){console.log("done")});
// });

// csv.parseCSV("test2.csv", function(data){
// 	fs.writeFile("test2.json", JSON.stringify(data), function(){console.log("done")});
	
// });

csv.parseCSV("test3.csv", function(data){
	fs.writeFile("test3.json", JSON.stringify(data), function(){console.log("done")});
	
}, false);

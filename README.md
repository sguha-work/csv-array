#CSV-parse
##usage guide
After installing the package you can use the "parseCSV" method as follows

> parseCSV("<CSV file name>", callBack)
> where callBack is a function having the argument data which is an array structure of the CSV file

### Example
> var csv = require('./csv-parse');
> csv.parseCSV("test.csv", function(data){
>   console.log(JSON.stringify(data));
> });
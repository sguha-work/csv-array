#csv-array
> Simple. lighweight, intelligent CSV-parser for nodeJS

## Dependencies
This package got only one dependencies of "line-by-line".

## Change log
* Performence improvement
* Removed dependency of fs
* Streaming improvement by adding a tiny delay, it will increase execution time but also increase stability
* Bug fix of parsing
    * Fixed a bug in file containg single coloumn
    * Empty string if null
    
  

## Usage Guide

### Installing

The installation is just a command

```
 npm install csv-array
```

After installing the package you can use the "parseCSV" method as follows
```
 parseCSV("CSV-file-name.csv", callBack)
 //where callBack is a function having the argument data 
 //which is an array structure of the CSV file
```
### Example

```javascript
 var csv = require('csv-array');
 csv.parseCSV("test.csv", function(data){
   console.log(JSON.stringify(data));
 });
``` 
If the test.csv file contains something like this

```
 Question Statement,Option 1,Option 2,Option 3,Option 4,Option 5,Answer,Deficulty,Category
this is a test question answer it?,answer 1,answer 2,answer3,answer 4,,answer 2,3,test
this is another test question answer it?,"answer1,answer2","answer2,answer3","answer4,answer5","answer5,answer6","answer7,answer8","answer1,answer2",2,test
```

Then the resulting data is as follows
```json
[  
   {  
      "Question Statement":"this is a test question answer it?",
      "Option 1":"answer 1",
      "Option 2":"answer 2",
      "Option 3":"answer3",
      "Option 4":"answer 4",
      "Option 5":"",
      "Answer":"answer 2",
      "Deficulty":"3"
   },
   {  
      "Question Statement":"this is another test question answer it?",
      "Option 1":"answer1,answer2",
      "Option 2":"answer2,answer3",
      "Option 3":"answer4,answer5",
      "Option 4":"answer5,answer6",
      "Option 5":"answer7,answer8",
      "Answer":"answer1,answer2",
      "Deficulty":"2"
   }
]
```

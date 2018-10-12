class CSVArray {
	/**
	 * This function checks the user given options and also it populates the default option
	 * @param {*} userGivenOption 
	 */
	checkOption(userGivenOption) {
		let systemGeneretedOption;
		systemGeneretedOption = {
			fileoutput: false,
			outputfilename: null,
			firstlineasheading: true
		}
		if(typeof userGivenOption === 'undefined' || userGivenOption === null) {
			return systemGeneretedOption;
		} else {
			if(typeof userGivenOption.fileoutput !== 'undefined' && userGivenOption.fileoutput !==null && (userGivenOption.fileoutput === true || userGivenOption.fileoutput === false)) {
				systemGeneretedOption.fileoutput = userGivenOption.fileoutput;
			}
			if(typeof userGivenOption.outputfilename !== 'undefined' && userGivenOption.outputfilename !==null && userGivenOption.outputfilename !== '') {
				systemGeneretedOption.outputfilename = userGivenOption.outputfilename;
			} else {
				// this block will be executed if output file name is empty in user given object
				if(systemGeneretedOption.fileoutput) {
					systemGeneretedOption.outputfilename = Date.now() + '.json';
				}
			}
			return systemGeneretedOption;
		}
	}

	/**
	 * This is the main function to begin the parsing
	 * @param {*} fileName 
	 * @param {*} option 
	 */
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

/*
var fs = require('fs')
    , es = require('event-stream');

var lineNr = 0;

var s = fs.createReadStream('very-large-file.csv')
    .pipe(es.split())
    .pipe(es.mapSync(function(line){

        // pause the readstream
        s.pause();

        lineNr += 1;

        // process line here and call s.resume() when rdy
        // function below was for logging memory usage
        logMemoryUsage(lineNr);

        // resume the readstream, possibly from a callback
        s.resume();
    })
    .on('error', function(err){
        console.log('Error while reading file.', err);
    })
    .on('end', function(){
        console.log('Read entire file.')
    })
);
*/

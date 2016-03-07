var express = require('express');
var router = express.Router();
require('datejs');

//converts the unix timestamp (date in seconds since 1/1/1970) to natural language date and returns both as json 
function jsonFromUnixTimestamp ( timeStamp ) {  
    var date = new Date(timeStamp * 1000);
    var dateString = monthNameFromNumber(date.getMonth()) + " " + date.getDate() + ", " + date.getFullYear();
    return { "unix": timeStamp, "natural": dateString };
}

//converts natural date to unix timestamp and returns both as json
function jsonFromDate ( naturalDate ) {
    var date = Date.parse(naturalDate);
    var timeStamp = date.getTime()/1000;
    return { "unix": timeStamp, "natural": naturalDate };
}

//helper function to convert a numeric month to the full month name
function monthNameFromNumber(number) {
    var months = ["January", "February","March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[number];
}

//helper function to send server responses with a provided status code
function sendJsonResponse( res, status, content ){
    res.status(status);
    res.json(content);
}

/* GET home page. */
router.get('/', function(req, res, next) {
    sendJsonResponse( res, status, { "error": "Improper url format.  Use /api/'date'"});
});

router.get('/api/:date', function(req, res, next) {
    //regex test if the date is a number
    if(/^\d+$/.test(req.params.date)){
       return sendJsonResponse( res, 200, jsonFromUnixTimestamp(req.params.date));
    }
    //regex test if the date matches a natural language date
    else if ( /^(January|February|March|April|May|June|July|August|September|October|November|December)\s\d\d,\s\d{4}$/i.test(req.params.date)) { 
        //separate day month and year to use in Date.validateDay()    
        var date = req.params.date.split(",").join("").split(" "); 
        //return error if date is invalid, return the date json otherwise
        if(Date.validateDay(Number(date[1]), Number(date[2]) , Date.getMonthNumberFromName(date[0]))){
            
            //force capitalisation of month name
            date = req.params.date.charAt(0).toUpperCase() + req.params.date.slice(1);
            return sendJsonResponse( res, 200, jsonFromDate(date));
        }
        else {
            //day was not between 1 and 28/30/31 depending on the month
            return sendJsonResponse( res, 400, { "error" : "The provided day was not valid" });
        }
    }
    //the date wasn't specified in the proper format
    sendJsonResponse( res, 400, { "error" : "Improper date format.  Use unix timestamp or 'MONTH DAY, YEAR'"});
});


module.exports = router;

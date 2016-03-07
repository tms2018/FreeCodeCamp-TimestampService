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
    res.render("index",{
                        title: "FreeCodeCamp Timestamp Microservice",
                        userStories: ["I can pass a string as a parameter, and it will check to see whether that string contains either a unix timestamp or a natural language date (example: January 1, 2016).",
                                       "If it does, it returns both the Unix timestamp and the natural language form of that date.",
                                       "If it does not contain a date or Unix timestamp, it returns null for those properties."
                                      ],
                        exampleUsage: "https://timestamp.herokuapp.com/January%2010,%202016<br/>https://timestamp.herokuapp.com/1438228800",
                        exampleResponse: '{ "unix" : 1438228800, "natural" : "July 10, 2015" }' 
    });
});

router.get('/:date', function(req, res, next) {
    //regex test if the date is a number
    if(/^-?\d+$/.test(req.params.date)){
            
        //make sure number is within maximum and minimum range for a Date object
        if (req.params.date <= 8640000000000 && req.params.date >= -8640000000000)
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
    }
    //the date wasn't specified in the proper format
    sendJsonResponse( res, 400, { "unix": null, "natural" : null});
});


module.exports = router;

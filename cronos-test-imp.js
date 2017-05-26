var system = require('system');
var args = system.args;

var startTimeString;
var endTimeString;

if (args.length === 1) {
  console.log('Try to pass some arguments when invoking this script!');
} else {

  startTimeString = args[1];
  endTimeString = args[2];
}


function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    // console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};



/*********SETTINGS*********************/

var requestAcceptCalled = false;
var webPage = require('webpage');
var page = webPage.create();
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36';
page.settings.javascriptEnabled = true;
page.settings.resourceTimeout = 10000;
page.settings.loadImages = false;//Script is much faster with this field set to false
phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;
/*********SETTINGS END*****************/

page.onConsoleMessage = function (msg) {
  console.log(msg);
};

page.open("https://library.cronosccs.com/UserLogin/Login.aspx", function(status) {

  page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {

    if (page.injectJs('timeResolver.js')) {
      page.evaluate(function(startStr,endStr) {
        const startTimeTime = Date.parse("Jul 8, 2005, "+startStr);
        const endTimeTime = Date.parse("Jul 8, 2005, "+endStr);

        console.log(timeSolver.getString(startTimeTime, "HH:MM:SS"));
        console.log(timeSolver.getString(endTimeTime, "HH:MM:SS"));

      },startTimeString,endTimeString);
      phantom.exit();
    }
  });


});

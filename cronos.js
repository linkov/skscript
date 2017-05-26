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


var webPage = require('webpage');
var page = webPage.create();
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36';
page.settings.javascriptEnabled = true;
page.settings.resourceTimeout = 10000;
page.settings.loadImages = false;//Script is much faster with this field set to false
phantom.cookiesEnabled = true;
phantom.javascriptEnabled = true;
/*********SETTINGS END*****************/

page.open("https://library.cronosccs.com/UserLogin/Login.aspx", function(status) {

});


phantom.onError = function(err){
};

page.onConsoleMessage = function (msg) {
  console.log(msg);
};

page.onError = function(err){

};

page.onAlert = function(){

};

page.onConfirm = function(){
  return true;
};

page.onLoadFinished = function(){


	if(page.title == "Log In"){
    console.log("in Cronos Login");
    page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
      page.evaluate(function() {
        document.getElementById("MainContent_LoginUser_Password").value="Welcome123!";
        document.getElementById("MainContent_LoginUser_UserName").value="APieluzek";
        $("#MainContent_LoginUser_LoginButton").click();
        return;
      });

    });


	}
	else if (page.title == "Cronos Library") {
    console.log("in Cronos Library");
    page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
      page.evaluate(function() {
        $("#img1").click();
        return;
      });

    });


  } else if (page.title == "CRONOS CIRP - 2.9.7.5") {

    if (page.url == "https://cirp.cronosccs.com/Rater/Setup") {


        console.log("in CRONOS CIRP - 2.9.7.5 INSIDE");

        page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
          if (page.injectJs('timeResolver.js')) {


                  waitFor(function() {
                        // Check if page loaded
                        return page.evaluate(function() {
                            return $("h3").html() == "Accepted Visits" || $("section").find(".fa-save").length > 0;
                        });
                    }, function() {


                       page.evaluate(function(start,end) {
                         const saveButton = $("section").find(".fa-save");
                         const isSaveButtonPage = (saveButton.length > 0);
                         var noRecords = $("h3").last().siblings("div").first().children("table").first().children("tbody").children("tr").last().children("td").children("div").hasClass("empty-set-message");


                         if (noRecords && !isSaveButtonPage) {

                           console.log("no records, reloading in 2 sec");
                           setTimeout(function(){
                            location.reload();
                          },2200);

                        } else {

                          if(!isSaveButtonPage) {

                            const startTimeTime = Date.parse("Jul 8, 2005, "+start);
                            const endTimeTime = Date.parse("Jul 8, 2005, "+end);


                            var results = [];


                            $("#myrequests-list table tbody tr").each(function(index, object){

                                const timeString = $(this).find("span[data-ng-bind$='vm.getSiteDateTime($row) | date : \\'shortTime\\''").html();
                                const studyName = $(this).find("span[data-ng-bind$='row.study'").html();
                                const visitType = $(this).find("span[data-ng-bind^='vm.getValue($row.studyId,\\'Visit\\''").html();
                                console.log(studyName);
                                console.log(visitType);
                                console.log(timeString);
                                console.log("------");


                                if(studyName) {
                                  const time = Date.parse("Jul 8, 2005, "+timeString);

                                  const insideTimeframe = (timeSolver.after(time, startTimeTime, "min") &&  timeSolver.before(time, endTimeTime, "min"))

                                  const blockedStuby = ( (studyName.includes("ESKET") && visitType.includes("Scrn 1")) || studyName.includes("CNTO") );
                                  if (!blockedStuby && insideTimeframe == true) {

                                    results.push( $(this));
                                  }

                                }




                            });

                            if (results.length > 0) {
                              const selectedStudy = results[0];
                              console.log("Selected Study: "+selectedStudy.html());
                              selectedStudy.find('a[ng-click^="vm.commands.startVisit"]')[0].click();
                            }




                          } else {
                            console.log("SAVE PAGE");
                            saveButton[0].click();


                          }





                          }


                        },startTimeString,endTimeString);


                      });
                    }



            });









    } else {
      console.log("in CRONOS CIRP - 2.9.7.5");
      page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
        page.evaluate(function() {

          $('a[href$="Rater/Setup"]')[1].click();
          return;
        });

      });
    }



  }  else {
    console.log("script fail");
    phantom.exit();
  }

}
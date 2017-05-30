var system = require('system');
var args = system.args;

var startTimeString;
var endTimeString;
var startDateString;
var endDateString;

if (args.length === 1) {
  console.log('Try to pass some arguments when invoking this script!');
} else {

  startTimeString = args[1];
  endTimeString = args[2];

  if (args[3]) {
    startDateString = args[3];
  }

  if (args[4]) {
    endDateString = args[4];
  }
}



function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 13000, //< Default Max Timout is 3s
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
    console.log("/********* Logging in *********************/");
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
    console.log("/********* Cronos Library *********************/");
    page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
      page.evaluate(function() {
        $("#img1").click();
        return;
      });

    });


  } else if (page.title == "CRONOS CIRP - 2.9.7.5") {

    console.log("/********* CRONOS CIRP *********************/");

    if (page.url == "https://cirp.cronosccs.com/Rater/Setup") {


        console.log("/********* Rater/Setup *********************/");
        page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {

            if (page.injectJs('timeResolver.js')) {

              waitFor(function() {
                    // Check if page loaded
                    return page.evaluate(function() {
                        return $("h3").html() == "Accepted Visits" || $("section").find(".fa-save").length > 0;
                    });
                }, function() {


                   page.evaluate(performMainLogic,startTimeString,endTimeString,startDateString,endDateString);


                  });

              // phantom.exit();
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

function performMainLogic(start,end) {
  const saveButton = $("section").find(".fa-save");
  const isSaveButtonPage = (saveButton.length > 0);
  var noRecords = $("h3").last().siblings("div").first().children("table").first().children("tbody").children("tr").last().children("td").children("div").hasClass("empty-set-message");


  if (noRecords && !isSaveButtonPage) {

    console.log(" -= No records, reloading in 2 sec =-");
    setTimeout(function(){
     location.reload();
   },2200);

 } else {



   if(!isSaveButtonPage) {
     console.log("/********* All Studies *********************/");
     const startTimeTime = Date.parse("Jul 8, 2005, "+start);
     const endTimeTime = Date.parse("Jul 8, 2005, "+end);

     const startDateTime = Date.parse(dateStart);
     const endDateTime = Date.parse(dateEnd);


     var results = [];


     $("#myrequests-list table tbody tr[ng-repeat$='vm.requests']").each(function(index, object){

         const dateString = $(object).find("span[data-ng-bind*='getSiteDateTime']").html();
         const timeString = $(object).find("span[data-ng-bind*='shortTime']").html();
         const studyName = $(object).find("span[data-ng-bind$='row.study']").html();
         const visitType = $(object).find("span[data-ng-bind*='Visit']").html();



         if(studyName) {
           console.log("/********* Study *********************/");
           console.log(studyName);
           console.log(visitType);
           console.log(timeString);
           console.log("/********* --------- *********************/");

           const time = Date.parse("Jul 8, 2005, "+timeString);
           const date = Date.parse(dateString);

           const insideTimeframe = (timeSolver.after(time, startTimeTime, "min") &&  timeSolver.before(time, endTimeTime, "min"))

           var insideDateframe = true;
          if (startDateTime && endDateTime) {
            insideDateframe = (timeSolver.after(date, startDateTime, "d") &&  timeSolver.before(date, endDateTime, "d"))
          } else if (startDateTime && !endDateTime) {
              insideDateframe = (timeSolver.after(date, startDateTime, "d"))
          } else if (!startDateTime && endDateTime) {
            insideDateframe = (timeSolver.before(date, endDateTime, "d"))
          } else {
            insideDateframe = true;
          }


           const blockedStuby = ( ((studyName.search("ESKET") !=-1 && visitType.search("Scrn 1")) != -1 ) || studyName.search("CNTO") !=-1 );
           if (!blockedStuby && insideTimeframe == true && insideDateframe == true) {

             results.push( $(this));
           }

         }




     });

     if (results.length > 0) {
       const selectedStudy = results[0];
       console.log("/********* Filtered Study *********************/");
       const timeString = $(selectedStudy).find("span[data-ng-bind*='shortTime']").html();
       const studyName = $(selectedStudy).find("span[data-ng-bind$='row.study']").html();
       const visitType = $(selectedStudy).find("span[data-ng-bind*='Visit']").html();
       console.log(studyName);
       console.log(visitType);
       console.log(timeString);
       console.log("/********* --------- *********************/");

       selectedStudy.find('a[ng-click^="vm.commands.startVisit"]')[0].click();
     } else {
       setTimeout(function(){
        location.reload();
      },2200);
     }




   } else {
     console.log("/********* Saving Item *********************/");
     saveButton[0].click();


   }





   }


 }

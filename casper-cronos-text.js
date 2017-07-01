
var casper = require('casper').create({
  clientScripts: ["includes/jquery.min.js","includes/timeResolver.js","includes/jquery.getSelector.js"],
  verbose: true,
  logLevel: 'debug',
    pageSettings: {
        // loadImages: false,//The script is much faster when this field is set to false
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36'
    }
});
var startTimeString = casper.cli.get('startTime');
var endTimeString = casper.cli.get('endTime');

var startDateString = casper.cli.get('startDate');
var endDateString = casper.cli.get('endDate');



// function check() {
//
//   casper.mainflow();
// }

casper.start();
casper.options.waitTimeout = 3000000;
casper.options.viewportSize = {width: 1200, height: 850};


casper.on('remote.message', function(msg) {
    this.log(msg, "debug");
});




casper.thenOpen('https://library.cronosccs.com/UserLogin/Login.aspx', function() {
  casper.echo("--- Login in progress ---");
  this.viewport(900, 800);


});

casper.waitForSelector('#MainContent_LoginUser_PasswordLabel', function() {

  this.sendKeys('input[name="ctl00$MainContent$LoginUser$UserName"]', 'APieluzek');
  this.sendKeys('input[name="ctl00$MainContent$LoginUser$Password"]', 'Welcome123!');
  this.click('input[name="ctl00$MainContent$LoginUser$LoginButton"]');

});


casper.waitForSelector('#MainContent_iTable').thenClick("input[name='ctl00$MainContent$ctl02']");
casper.waitForSelector("fwk-tile-lane[data-fwk-tile-lane-header='Rater']").thenClick("fwk-tile-lane[data-fwk-tile-lane-header='Rater'] a");




casper.then(function(){

casper.mainflow();

});


casper.mainflow = function() {

  this.reload();

  casper.waitForSelector('#myrequests-list', function() {

    const startTimeTime = Date.parse("Jul 8, 2005, "+startTimeString);
    const endTimeTime = Date.parse("Jul 8, 2005, "+endTimeString);

    const startDateTime = Date.parse(startDateString);
    const endDateTime = Date.parse(endDateString);

     var filteredVisitClickSelector = this.evaluate(function(start,end,dateStart,dateEnd) {


            $("#myvisits-list table tbody td.content-block .content-container table tbody tr a").removeAttr("name");
            $("#myrequests-list table tbody td.content-block .content-container table tbody tr a").removeAttr("name");

             console.log("/********* Looking for Studies *********************/");
            const startTimeTime = Date.parse("Jul 8, 2005, "+start);
            const endTimeTime = Date.parse("Jul 8, 2005, "+end);

            const startDateTime = Date.parse(dateStart);
            const endDateTime = Date.parse(dateEnd);

            console.log("/********* Entered start and end times *********************/");
            console.log(start);
            console.log(end);

            console.log("/********* Entered start and end dates *********************/");
            console.log(dateStart);
            console.log(dateEnd);

            var results = [];


            $("#myrequests-list table tbody td.content-block .content-container table tbody tr").each(function(index, object){

                const dateString = $(object).find("span[data-ng-bind*='getSiteDateTime']").html();
                const timeString = $(object).find("span[data-ng-bind*='shortTime']").html();
                const studyName = $(object).find("span[data-ng-bind$='row.study']").html();
                const visitType = $(object).find("span[data-ng-bind*='Visit']").html();


                if(studyName) {

                  console.log("/********* Study *********************/");
                  console.log(studyName);
                  console.log(visitType);
                  console.log(timeString);
                  console.log(dateString);
                  console.log("/********* --------- *********************/");

                  const time = Date.parse("Jul 8, 2005, "+timeString);
                  const date = Date.parse(dateString);


                  const insideTimeframe = (timeSolver.after(time, startTimeTime, "min") &&  timeSolver.before(time, endTimeTime, "min"))

                  var insideDateframe = true;
                 if (startDateTime && endDateTime) {
                   console.log("startDateTime && endDateTime");
                   insideDateframe = ( (timeSolver.after(date, startDateTime, "y") &&  timeSolver.before(date, endDateTime, "y")) && (timeSolver.after(date, startDateTime, "m") &&  timeSolver.before(date, endDateTime, "m")) && (timeSolver.after(date, startDateTime, "d") &&  timeSolver.before(date, endDateTime, "d")) )
                 } else if (startDateTime && !endDateTime) {
                   console.log("startDateTime && !endDateTime");
                     insideDateframe = ( timeSolver.after(date, startDateTime, "y") && timeSolver.after(date, startDateTime, "m") && timeSolver.after(date, startDateTime, "d"))
                 } else if (!startDateTime && endDateTime) {
                   console.log("!startDateTime && endDateTime");
                   insideDateframe = (timeSolver.before(date, endDateTime, "y") && timeSolver.before(date, endDateTime, "m") && timeSolver.before(date, endDateTime, "d"))
                 } else {
                   console.log("insideDateframe = true");
                   insideDateframe = true;
                 }


                 if (insideTimeframe == true) {
                   console.log("insideTimeframe = true");
                 } else {
                   console.log("insideTimeframe = false");
                 }


                 if (insideDateframe == true) {
                   console.log("insideDateframe = true");
                 } else {
                   console.log("insideDateframe = false");
                 }



                  const blockedStuby = ( ((studyName.search("ESKET") !=-1 && visitType.search("Scrn 1")) != -1 ) );



                  if (!blockedStuby && insideTimeframe == true && insideDateframe == true) {

                    console.log("params matched, calling results.push( $(this))");

                    results.push( $(this));
                  } else {
                    console.log("params not matched");
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
              console.log("a element -> ");
              console.log($(selectedStudy).children("td:last").children("a:last")[0].outerHTML);
              $(selectedStudy).children("td:last").children("a:last").attr("name","selected-for-save");
              const clickSelector = $(selectedStudy).children("td:last").children("a:last").getSelector();
              console.log(clickSelector);
              return clickSelector;

            }

            return null;



     },startTimeString,endTimeString,startDateString,endDateString);


     if (filteredVisitClickSelector) {
       casper.log(filteredVisitClickSelector, 'debug');




     } else {
       console.log("/********* No studies found, restarting *********************/");
       casper.mainflow();
     }


  });

  casper.waitForSelector('a[name="selected-for-save"]', function() {

    this.evaluate(function() {
            document.querySelector('a[name="selected-for-save"]').click();

    });
    // this.click('a[name="selected-for-save"]');
  });

  casper.waitForSelector('command-button[data-command-label="Save"]', function() {

      casper.log(casper.getHTML(), 'debug');
      casper.log("SAVING", 'debug');

      this.click('command-button[data-command-label="Save"]');


  });

  casper.waitForSelector('#myrequests-list', function() {

  casper.mainflow();

  });


}




casper.run();

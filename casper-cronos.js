
var links = [];
function getLinks() {
    var links = document.querySelectorAll('h3.r a');
    return Array.prototype.map.call(links, function(e) {
        return e.getAttribute('href');
    });
}


function reloadUntil(selector, delay, testFunc) {
  casper.then(function() {
    this.reload(function() {
      var result = this.fetchText(selector);
      if(!testFunc(result)) {
        this.wait(delay, function() {
          reloadUntil(selector, delay, testFunc);
        });
      }
    });
  });
};


var casper = require('casper').create({
    verbose: true,
  logLevel: 'debug',
    pageSettings: {
        // loadImages: false,//The script is much faster when this field is set to false
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36'
    }
});
casper.start();
casper.options.waitTimeout = 30000;
casper.options.viewportSize = {width: 1200, height: 850};

casper.thenOpen('https://library.cronosccs.com/UserLogin/Login.aspx', function() {
  this.viewport(900, 800);


});


casper.waitForSelector('#MainContent_LoginUser_PasswordLabel', function() {

  this.sendKeys('input[name="ctl00$MainContent$LoginUser$UserName"]', 'APieluzek');
  this.sendKeys('input[name="ctl00$MainContent$LoginUser$Password"]', 'Welcome123!');
  this.click('input[name="ctl00$MainContent$LoginUser$LoginButton"]');

});


casper.waitForSelector('#MainContent_iTable').thenClick("input[name='ctl00$MainContent$ctl02']");
casper.waitForSelector("fwk-tile-lane[data-fwk-tile-lane-header='Rater']").thenClick("fwk-tile-lane[data-fwk-tile-lane-header='Rater'] a");

casper.waitForSelector('div[id="myvisits-list"]', function() {

  casper.echo(casper.getCurrentUrl());
    casper.echo(casper.getCurrentUrl());
    casper.log(casper.getCurrentUrl(), 'debug');



});

casper.then(function(){
  reloadUntil('.empty-set-message', 12500, function(param){
    console.log(param);
    return (param.length > 0);
  });
});


casper.then(function(){
    casper.log("reloadUntil then called", 'debug');
});

casper.run(function() {
    // echo results in some pretty fashion
    this.echo(links.length + ' links found:');
    // this.echo(' - ' + links.join('\n - ')).exit();
});

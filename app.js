
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var app = express();

var dotenv = require('dotenv');
dotenv.load();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/save', routes.save);
app.get('/viewcard/:id', routes.viewcard);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



//set email function. will be called when the database check() function is ran which will check 
//the database to see if any cards need to be sent

function email(to, from, name, message, id) {
	//send to card receipient
	var sendgrid  = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
    sendgrid.send({
      to: to,
      from: 'ecards@imkev.in',
      subject: from + ' has sent you an eCard',
      text:  message  + ' \n \n \n View your card online at: ' + process.env.BASE_URL + '/viewcard/'+id 
    }, function(success, message) {
      if (!success) {
        console.log(message);
      }
    })
    
    //send to card creator to let them know it's been delivered
    sendgrid.send({
      to: from,
      from: 'ecards@imkev.in',
      subject: 'Your eCard has been delivered to ' + to,
      text: 'Here\'s what they received: \n \n' + message  + ' \n \n \n View your card online at: ' + process.env.BASE_URL + '/viewcard/'+id 
    }, function(success, message) {
      if (!success) {
        console.log(message);
      }
    })
}
    
    
//checks to see if there's any new cards to send. Main function of app.
function check() { 

var date = new Date;
var currentMonth = date.getMonth()+1;
var currentDay = date.getDate();
var currentYear = date.getYear();
var today = currentMonth+'/'+currentDay; //sets today to day/month

var uristring =
	process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
	process.env.MONGODB_NAME;
	
  var mongoose = require('mongoose');
  var db = mongoose.createConnection(uristring);
  console.log('Checking for entries that haven\'t been sent. \n || Time: ' + date.getHours() + ':' + date.getMinutes() + ' \n || date || ' + currentMonth +'/'+currentDay + ' \n || --------------------------');
	  db.once('open', function() {
	  	var greetingSchema = new mongoose.Schema({
	  		toName: String,
		    toEmail: String,
		    toSend: String,
		    fromName: String,
		    fromEmail: String, 
		    message: String,
		    cardType: String,
		    sent: Boolean
	  	});
	  var Greeting = db.model('Greeting', greetingSchema);
//loops through the database to see if any cards need to be sent today. If so, it will send them and change the sent flag in the to true
	  Greeting.find(function(err, greeting){	
	  	for(i = 0; i<greeting.length; i++) {
	  		if (String(greeting[i].toSend) == String(today) && greeting[i].sent == false) {
	  			//if a card has been found with today's date and hasn't been sent, it will send it and update the flag parameter to true, bypassing it in the future.
			  	email(greeting[i].toEmail, greeting[i].fromEmail, greeting[i].toName, greeting[i].message, greeting[i].id);
				Greeting.update(query, { sent: 'true' }, function(err, res) {
				})
	  		}
	  	}
	  });

  	}); //db connection	  	
	mongoose.connection.close()
};


//will run check() every so often // what the minutes variable is set to 
var minutes = 1.3, the_interval = minutes * 60 * 1000;
console.log('Checking for new messages every: ' + minutes + ' minutes');
setInterval(function() {
  check();
}, the_interval);

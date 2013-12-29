var dotenv = require('dotenv');
dotenv.load();

var mongoose = require ("mongoose"); 
  var uristring =
  process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  process.env.MONGODB_NAME;



var date = new Date;
var currentMonth = date.getMonth()+1;
var currentDay = date.getDate();
var currentYear = date.getYear();
var today = currentMonth+'/'+currentDay; //sets today to day/month

exports.index = function(req, res){
  
	res.render('index', { day: today, base_url: process.env.BASE_URL });

};

exports.save = function(req, res){


	//initiate mongoose connection
  	mongoose.connect(uristring, function (err, res) {
	  if (err) {
	  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
	  } else {
	  console.log ('Successfully connected to: ' + uristring);
	  }
	});


var Greeting = require('../public/js/schema.js');

  if (req.body.toName.length != 0) {
    var greeting = new Greeting({ 
      'toName' :  req.body.toName,
      'toEmail' :  req.body.toEmail,
      'toSend' : Number(req.body.toMonth) + 1 + '/' + req.body.toDay,
      'fromName' : req.body.fromName,
      'fromEmail' : req.body.fromEmail,
      'message' :  req.body.message,
      'cardType' : req.body.cardType,
      'sent' : false
    });
    greeting.save(function (err) {
      if (!err) // ...
      console.log(greeting + ' success.');
      mongoose.connection.close()
     res.render('index', { SuccessMessage: 'card successfully created! your card will be delivered on the specified date.', day: today });
    });
  } 
  else {
    console.log('contents cannot be empty')
    mongoose.connection.close()
    res.render('index', {ErrorMessage: 'the card was not saved. please try again. if this keeps happening, please let me know.', day: today});
    }
}

exports.viewcard = function(req, res){

  var cardId = req.params.id 
  , db = mongoose.createConnection(uristring);
    
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
  var Greeting = db.model('Greeting', greetingSchema)
  Greeting.findOne({'_id' : cardId}, function(err, reply){  
         //renders the template for viewing in jade if the card is found
        if (reply) {
          var cardContents = {
            toName : reply.toName,
            toEmail : reply.toEmail,
            fromName : reply.fromName,
            fromEmail : reply.fromEmail,
            message : reply.message,
            cardType : reply.cardType
        };

         if (cardContents.cardType == 'Christmas') {
            res.render('christmas', { 
            toName: cardContents.toName, 
            toEmail: cardContents.toEmail, 
            fromName: cardContents.fromName, 
            fromEmail: cardContents.fromEmail,
            message: cardContents.message, 
            cardType: cardContents.cardType, 
          });
        } 
      } else {
          res.render('index', { 
          ErrorMessage: 'oops! it looks like we couldn\'t the find card you were looking for :('
        });
      };
    });
  });
};

















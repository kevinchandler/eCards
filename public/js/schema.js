var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var greetingSchema = new Schema({
	toName: String,
    toEmail: String,
    toSend: String,
    fromName: String,
    fromEmail: String, 
    message: String,
    cardType: String,
    sent: Boolean
})


module.exports = mongoose.model('greetings', greetingSchema);          

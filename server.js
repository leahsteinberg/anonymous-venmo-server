var express = require('express');
var jade = require('jade');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var https = require('https');
var sys = require('sys');
var request = require('request');
var expressSession = require('express-session');
var app = express();
var secrets = require('./secrets.js');

var access_token = secrets.access_token;
var CLIENT_ID = 1800;
var CLIENT_SECRET = secrets.CLIENT_SECRET;
var AUTH_CODE = '';

// initialize app - includes allowing it to accept POST requests 
app.use(bodyParser());
app.use(bodyParser.json()); // parses req.body json from html POST
app.use(bodyParser.urlencoded({
    extended: true
}));                        // parses urlencoded req.body, including extended syntax
app.use(cookieParser());
app.use(expressSession({secret:'somesecrettokenhere'}));






app.get('/start', function(req, res){
	 res.render('signin', { title: 'Express' });
	 
});

app.get('/webhook_url', function(req, res){
	console.log("\nhitting initialize (GET) webhook url!!");
    var venmo_response = req.query['venmo_challenge'];	
    res.send(venmo_response);

});


var tag = -1;
app.post('/webhook_url', function(req, res){
	tag= tag+1;
	console.log("\nhitting the POST webhook url!!!, access token is: ", access_token, "tag is: ", tag);
	//console.log(req.body);
	//console.log(req.body);
		if(req.body['type'] === 'payment.created'){
			//console.log("target is, ", req.body['data']['target']['user'], "tag is: ", tag);
			//console.log("actor is: ", req.body['data']['actor']['username'], "tag is: ", tag);
			// && req.body['data']['target']['phone']===null
		if((req.body['data']) && req.body['data']['status'] === 'settled' && req.body['data']['target']['user']['username']=== "anonymous-user"){// if I cant find the user, send the money back..
			var message = req.body['data']['note'];
			var sender_id = req.body['data']['actor']['id'];
			var target_id_index = message.indexOf(' ');
			var target_id = message.substring(0, target_id_index);
			var amount = req.body['data']['amount'];
			var note_to_send = message.substring(target_id_index+1, message.length);
			console.log("IN webhook ENDPOINT target: ", target_id, "orig sender: ", sender_id, note_to_send, amount);
			get_user(target_id, sender_id, note_to_send, amount, tag);
		}
}
	console.log("sending back 200");
	res.statusCode = 200;
	res.send();
});

get_user = function(target_string, original_sender, message, amount, tag){
	console.log("in get user, tag is: ", tag);
	var path = 'https://api.venmo.com/v1/users/'+target_string+"?access_token="+access_token;
	request.get(
		path,
		function(error, response, body){
			if(error){
				console.log(error);
				return false;
			}else{
				body = JSON.parse(body);
				console.log("getting user!!!!");
				if(body['data'] && body['data']['id']){/// WHY should this line ever BREAK the program!??!?!
					console.log("\nuser id should be:::", body['data']['username'], body['data']['id']);
					target_id = body['data']['id'];
					console.log("sending money to target.");
					send_money(target_id, message, amount, 'public', tag);
				}
				else{
					console.log("sending back to original");
					send_money(original_sender, "Sorry, Anonymous doesn't know who you're trying to send that to.", amount, "private", tag);
				}
			}
		});

};

send_money = function(to, message, amount, privacy, tag){
		console.log("in send money, tag is: ", tag);

	var sendData = {
				access_token: access_token,
				user_id: to,
				note: message,
				amount: amount,
				audience: privacy
			};

	var postOptions = {
		host: 'https://api.venmo.com',
		path: '/v1/payments',
		method: 'POST'
	};
	request.post(
		'https://api.venmo.com/v1/payments',
		{form: sendData},
		function (error, response, body){
			if(error){
				res.json(500, error);
			} else {
				body = JSON.parse(body);
				console.log("should have made a payment here!!!!", body);
			}
		});
}


// app.get('/login', function(req, res){
//     var redirect_string = "https://api.venmo.com/v1/oauth/authorize?client_id="+ CLIENT_ID+"&scope=make_payments+access_balance+access_friends+access_email+access_feed%20access_profile&response_type=code";	
//     res.json(redirect_string);

// });



// app.get('/venmocallback', function(req, res){
// 	console.log("\nhitting venmo callback");
// 	AUTH_CODE = req.query['code'];

// 	var sendData = {
// 		client_id: CLIENT_ID,
// 		client_secret: CLIENT_SECRET,
// 		code: AUTH_CODE
// 	};
// 	var postOptions = {
// 		host: 'https://api.venmo.com',
// 		path: '/v1/oauth/access_token',
// 		method: 'POST'
// 	};

// 	request.post(
// 		'https://api.venmo.com/v1/oauth/access_token',
// 		{form: sendData},
// 		function (error, response, body){
// 			if(error){
// 				res.json(500, error);
// 			} else {
// 				body = JSON.parse(body);
// 				console.log(body);
// 				//req.session.access_token = body['access_token'];
// 				//console.log("access token in JSON is: ", body['access_token']);
// 				//console.log("access token is: ", req.session.access_token, "~*~*~*~* SIGNED IN!!!");
// 			}
// 		});
// });


var server = app.listen(4050, "0.0.0.0", function(){
	console.log('listening on port %d', server.address().port);
});


app.set('view engine', 'jade');
console.log("should be setting jade as engine");



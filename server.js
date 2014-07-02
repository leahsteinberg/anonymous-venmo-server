var express = require('express');
var jade = require('jade');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var https = require('https');
var sys = require('sys');
var request = require('request');
//var request = require('request');

var app = express();
//app.use( bodyParser.json() );       // to support JSON-encoded bodies
//app.use( bodyParser.urlencoded() ); // to support URL-encoded bodiesar app = express();
app.use(bodyParser());
//app.use(express.json());
//app.use(express.urlencoded());
app.use(bodyParser.json()); // parses req.body json from html POST
app.use(bodyParser.urlencoded({
    extended: true
}));                        // parses urlencoded req.body, including extended syntax

var CLIENT_ID = 1800;
var CLIENT_SECRET = 'jmWEcT2TYRmgWzLV67LFEybqCfjLdKDF';
var AUTH_CODE = '';
var access_token = '';

app.use(cookieParser());
app.use(bodyParser());

app.get('/start', function(req, res){
	 res.render('signin', { title: 'Express' });
	 
});
app.get('/webhook_url', function(req, res){
	console.log("hitting initialize (GET) webhook url!!");
    var venmo_response = req.query['venmo_challenge'];

    console.log("venmo_response is.. ", venmo_response);
	
    res.send(venmo_response);

});

app.post('/webhook_url', function(req, res){
	console.log("hitting the POST webhook url!!!");
	console.log(req.body);
	//var message = req.body['note'];
	message = "1348962221031424719 hiyatesttest";
	console.log(message);

	var target_id_index = message.indexOf(' ');
	console.log(target_id_index);
	var target_id = message.substring(0, target_id_index);
	var note_to_send = message.substring(target_id_index+1, message.length);
	console.log(note_to_send);
	console.log(target_id+"hi");
	var tess = '1348962221031424719';
	//var params = {host: 'api.venmo.com', path: 'v1/payments', access_token: AUTH_CODE, , method: 'POST'};
	//var req = request.post("https://api.venmo.com/v1/payments",{form: {access_token: AUTH_CODE, user_id: '1348962221031424719', note: note_to_send, amount: '1', audience: 'private'}}, function(http_res){
	var sendData = {
		access_token: access_token,
		user_id: tess,
		note: "hiyyyya",
		amount: '1',
		audience: 'private'
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
				console.log(body);
				access_token = body['access_token'];
			}
		});



});


app.get('/login', function(req, res){
    var redirect_string = "https://api.venmo.com/v1/oauth/authorize?client_id="+ CLIENT_ID+"&scope=make_payments+access_balance+access_friends+access_email+access_feed%20access_profile&response_type=code";	
    res.json(redirect_string);

});

app.get('/venmocallback', function(req, res){
	console.log("hitting venmo callback");
	console.log("code is:!     ", req.query['code']);
	AUTH_CODE = req.query['code'];

	var sendData = {
		client_id: CLIENT_ID,
		client_secret: CLIENT_SECRET,
		code: AUTH_CODE
	};
	var postOptions = {
		host: 'https://api.venmo.com',
		path: '/v1/oauth/access_token',
		method: 'POST'
	};

	request.post(
		'https://api.venmo.com/v1/oauth/access_token',
		{form: sendData},
		function (error, response, body){
			if(error){
				res.json(500, error);
			} else {
				body = JSON.parse(body);
				console.log(body);
				access_token = body['access_token'];
			}
		});
});


var server = app.listen(4050, "0.0.0.0", function(){
	console.log('listening on port %d', server.address().port);
});


app.set('view engine', 'jade');
console.log("should be setting jade as engine");



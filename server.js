var express = require('express');
var jade = require('jade');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var https = require('https');

var app = express();
var CLIENT_ID = 1800;
var CLIENT_SECRET = 'jmWEcT2TYRmgWzLV67LFEybqCfjLdKDF';
var AUTH_CODE = '';


app.use(cookieParser());
app.use(bodyParser());

app.get('/start', function(req, res){
	 res.render('signin', { title: 'Express' });
	 
});

app.get('/login', function(req, res){
    var redirect_string = "https://api.venmo.com/v1/oauth/authorize?client_id="+ CLIENT_ID+"&scope=make_payments+access_balance+access_friends+access_email+access_feed%20access_profile&response_type=code";	
    res.json(redirect_string);

});

app.get('/venmocallback', function(req, res){
	console.log("hitting venmo callback");
	console.log("code is:!     ", req.query['code']);
	AUTH_CODE = req.query['code'];

    "express-session": "^1.0`.3",
    ns = {host: 'api.venmo.com',
						path: '/v1/me?access_token='+req.session.access_token,
    					method: 'GET'}

	var req = https.get(options, function(http_res){
	    		//console.log('STATUS:', http_res.statusCode);
	http_res.on('data', function (chunk) {
	res.json(JSON.parse(chunk));
	console.log("data from venmo user, ", JSON.parse(chunk));
	});
	})   		
	req.on('error', function(e) {
  		    		console.error(e);
	});
);

var server = app.listen(4040, function(){
	console.log('listening on port %d', server.address().port);
});


app.set('view engine', 'jade');
console.log("should be setting jade as engine");



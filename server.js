var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var app = express();

app.set('view engine', 'html');

app.use(express.static(__dirname + '/public'));

app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var ipAddress = process.env.OPENSHIFT_NODEJS_IP;
var port      = process.env.OPENSHIFT_NODEJS_PORT || 3000;

app.listen(port, ipAddress);
// local link ::: http://localhost:3000/

// maps key =  AIzaSyAhIYpsO8Jdq1eBxaH6u7N7Tvej3UckyHE
// forecast key = 6c4102c02fa3594783c54aab81209a8d
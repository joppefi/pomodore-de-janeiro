var express = require('express');
var app = express();
var env = require('node-env-file');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var utf8 = require('utf8');
var dateFormat = require('dateformat');

if(process.env.NODE_ENV !== "production") {
  env(__dirname + '/.env');
}

console.log('Running now');

var redirect_uri = process.env.REDIRECT;
var spotify_secret = process.env.SECRET;
var client_id = pross.enc.CLIENTID;

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  console.log('Query code', req.query.code);

  if (req.query.code != undefined) {
    getAccessToken(req.query.code, function (auth) {
      console.log('cb', auth["access_token"]);
      res.render('pages/player', {token: auth.access_token});
    });
  } else {
    res.send('kukkuu');
  }

});

/// Handle the login
app.get('/login', function (req, res) {
  var scopes = 'user-read-private user-read-email streaming';
  res.redirect('https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' + client_id +
    (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
    '&redirect_uri=' + encodeURIComponent(redirect_uri));
});


app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});

app.post('/', function (request, response) {
  console.log('POST');
  var bodyStr = '';

  request.on("data", function (chunk) {
    bodyStr += chunk.toString();
  });

  request.on("end", function () {
    var update = JSON.parse(bodyStr);
    console.log(update);
  });
});

// Gets the access token for desired code
function getAccessToken(code, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://accounts.spotify.com/api/token', false);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Authorization', 'Basic ' + spotify_secret);
  xhr.onload = function () {
    console.log('ResponseText', this.responseText);
    callback(JSON.parse(this.responseText));
  };

  xhr.send('grant_type=authorization_code&code='+ code +'&redirect_uri=' + redirect_uri);
}
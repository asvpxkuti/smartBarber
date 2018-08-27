const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
const csurf =  require('csurf');
const cookieParser = require('cookie-parser');
const stripe = require("stripe");


// Connect To Database (OLD CODE)
mongoose.connect(config.database, { useMongoClient: true});
// On Connection
mongoose.connection.on('connected', () => {
  //mongoose.connection.db.dropDatabase();
  console.log('Connected to Database '+config.database);
});
// On Error
mongoose.connection.on('error', (err) => {
  console.log('Database error '+err);
});


var expiryDate = new Date(Date.now() + 30 * 1000);

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const users = require('./routes/users');

// Port Number
const port = process.env.PORT || 5000;

// CORS Middleware
const csrfMiddleware = csurf({
  cookie: true
});

/*  app.use(require("express-session")({
  secret: " Bangbanchiddybangbang",
  key: "sessionId",
  resave: false,
  saveUninitialized: false,
    cookie: { 
      expires: expiryDate,
      httpOnly: false,  //not allow client side script access to the cookie 
        secure: false //only send this cookie in requests going to HTTPS endpoints
}
  
})); */


// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser('superduperduper'));
//app.use(csrfMiddleware);
/* app.use(function(req, res, next) {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  return next();
}); */

app.use('/client', users);
// Index Routes
 app.get('/', (req, res) => {
  res.send('invaild endpoint');
}); 

app.get('*',(req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
}); 



// Start Server
app.listen(port, () => {
  console.log('Server started on port '+port);
});

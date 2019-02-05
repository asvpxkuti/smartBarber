const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/properties');
const session = require('express-session');
//const csurf =  require('csurf');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const stripe = require("stripe");
const shopHandler = require('./routes/shopRouter');
const clientHandler = require('./routes/clientRouter');
const MongoDBStore = require('connect-mongodb-session')(session);

// Connect To Database (OLD CODE)
mongoose.connect(config.database,{ useNewUrlParser: true });
// On Connection
mongoose.connection.on('connected', () => {
  //mongoose.connection.db.dropDatabase();
  console.log('Connected to Database '+config.database);
});
// On Error
mongoose.connection.on('error', (err) => {
  console.log('Database error '+err);
});

// Port Number
const port = process.env.PORT || 5000;

const app = express();

const appStore = new MongoDBStore({
  uri:config.database,
  collection:'appSession'
});

appStore.on('error', function(error) {
  console.log(error);
});


// CORS Middleware
const cookieOptions = {
  key: 'XSRF-TOKEN',
  secure: false,
  httpOnly: false,
  maxAge: 3600
}

const corsOptions = {
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token"],
  credentials: true,
  methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
  origin: 'http://localhost:4200',
  preflightContinue: false
};

app.use('/uploads',express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));


app.use(cookieParser());
app.use(session(
  {
    name:'APPSESSIONID',
    secret: config.sessionSecret,
    resave:false,
    saveUninitialized:true,
    store:appStore,
    cookie:{
      expires:new Date(Date.now() + config.sessionTime),
      maxAge:config.sessionTime
    },
    
    }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(cors(corsOptions));
app.use('/Shop', shopHandler);
app.use('/Client', clientHandler);

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


module.exports = app;
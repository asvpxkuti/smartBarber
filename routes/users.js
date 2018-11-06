const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');
const Client = require('../models/Clients');
const barberUser = require('../models/Users');
var nodemailer = require('nodemailer');
var stripe = require("stripe")("sk_test_8KEn27WVr2fRHz847DSzDjpf");


router.get('/token',(req, res) =>{
  res.json({'tokenCreated':true});
});
/* GET ALL CLIENT */
router.get('/', function(req, res) {
  Client.find().sort({date:'asc'}).exec(function (err, clients) {
    if (err){
      if (err) return next(err);
    }
    res.json(clients);
  });   
});

router.get('/getDates', function(req, res) {
  Client.find({},function (err, clients) {
    if (err){
      if (err) return next(err);
    }else{
      var currentTime = new Date().getTime();
      clients.forEach((obj)=>{
        console.log("current time is : "+currentTime);
        //console.log(obj);
        const clientTime = new Date(obj['date']).getTime();
        console.log(new Date(obj['date']).getTime());
        compareTime(currentTime, clientTime,obj.email,obj['job'].hairjob,obj.date);  
      }) 
    }
    
   })
});

/* PAY CLIENT */
router.post('/pay', function(req, res, next) {
  stripe.charges.create({
    amount: req.body.amount,
    currency: req.body.currency,
    source: req.body.source['id'], // obtained with Stripe.js
    description: "Charge for geecutz"
  }, function(err, charge) {
    // asynchronously called
    if(err) return next(err);
    res.json(charge);
  });
});

function compareTime(date1, date2,clientEmail,service,serviceDate){
  var diff = date1 - date2;
  if(diff > 30000 || diff == 30000){
    console.log("send email");
    
    nodemailer.createTestAccount((err, account) => {
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          service:'gmail',
          //port: 587,
         // true for 465, false for other ports
          auth: {
              user: 'geecuts1@gmail.com', // generated ethereal user
              pass: 'geecutz9087' // generated ethereal password
          },
           tls: {
            rejectUnauthorized: false
        }
      });
    
      // setup email data with unicode symbols
      let mailOptions = {
          from: '"Geecuts" <geecuts1@gmail.com>', // sender address
          to: clientEmail+','+'geecuts1@gmail.com', // list of receivers
          subject: 'Appointment Reminder', // Subject line
          text: 'Thank you for your business', // plain text body
          html: '<h2>This is a reminder of your Appointment:</h2>'+
          '<p>Please see below for details</p>'+
          '<p>Your Appointment is Booked For: <b>'+serviceDate+'</b></p>'+
          '<p>Price for service: <b>'+service+'</b></p>'
      };
    
      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return res.json({success:false,msg:'something went wrong'});
          }else{
            res.json({msg:'email sent',success:true});
          }
         
      });
    });
  }
}


/* GET SINGLE CLIENT BY ID */
router.get('/:id', function(req, res, next) {
  Client.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* SAVE CLIENT */
router.post('/save', function(req, res, next) {
  Client.create(req.body, function (err, post) {
    if (err) return next(err);
    console.log("saving" + JSON.stringify(req.body));
    res.json(post);
  });
});

/* UPDATE CLIENT */
router.put('/:id', function(req, res, next) {
  Client.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE BOOK */
router.delete('/:id', function(req, res, next) {
  Client.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json({success:true});;
  });
});


//Email Client
 router.post('/sendmail', function(req, res) {
  
  console.log('loading request body '+ JSON.stringify(req.body));
  console.log('request data '+ req.body.email);
  nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        service:'gmail',
        //port: 587,
       // true for 465, false for other ports
        auth: {
            user: 'geecuts1@gmail.com', // generated ethereal user
            pass: 'geecutz9087' // generated ethereal password
        },
         tls: {
          rejectUnauthorized: false
      }
    });
  
    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Geecuts" <geecuts1@gmail.com>', // sender address
        to: req.body.email+','+'geecuts1@gmail.com', // list of receivers
        subject: 'Your Appointment has been booked', // Subject line
        text: 'Thank you for your business', // plain text body
        html: '<h2>Congratulations Appointment Booked:</h2>'+
        '<p>Please see below for details</p>'+
        '<p>Your Appointment is Booked For: <b>'+req.body.date+'</b></p>'+
        '<p>Price for service: <b>'+req.body.job+'</b></p>'
    };
  
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.json({success:false,msg:'something went wrong'});
        }else{
          res.json({msg:'email sent',success:true});
        }
       
    });
  });
  
});


router.post('/authenticate', (req, res) => {
  barberUser.findOne({
    email: req.body.email
  }, function(err, username) {
    if (err) throw err;

    if (!username) {
      res.send({
        success: false,
        message: 'Authentication failed. User not found.'
      });
    } else {
      // Check if password matches
      barberUser.comparePassword(req.body.password,username.password, function(err, isMatch) {
        if (isMatch && !err) {
          // Create token if the password matched and no error was thrown
          var token = jwt.sign({auth: username.username},config.secret , {
            expiresIn: "1 days"
          });
          res.json({
            success: true,
            message: 'Authentication successfull',
            token
          });
        } else {
          res.send({
            success: false,
            message: 'Authentication failed. Passwords did not match.'
          });
        }
      });
    }
  });
});

router.post('/register',(req, res)=>{
    console.log(JSON.stringify(req.body));
  
    if (!req.body.email || !req.body.password) {
        res.json({
          success: false,
          message: 'Please enter email and password.'
        });
      } else {
        barberUser.addUser(req,res);
      }
});



module.exports = router;

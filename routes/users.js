const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');
const Client = require('../models/Clients');
const barberUser = require('../models/Users');
var nodemailer = require('nodemailer');


/* GET ALL CLIENT */
router.get('/', function(req, res) {
  Client.find(function (err, clients) {
    if (err){
      handleError(res,err.message,'data not found');
    }
    ;
    res.json(clients);
  });   
});


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
    res.json(post);
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
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'eroppong@gmail.com', // generated ethereal user
            pass: 'home1990' // generated ethereal password
        },
         tls: {
          rejectUnauthorized: false
      }
    });
  
    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Geecuts" <eroppong@gmail.com>', // sender address
        to: req.body.email, // list of receivers
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
            return console.log(error);
        }else{
          res.json({msg:'email sent',success:true})
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
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
      } else {barberUser.addUser(req,res);}
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



module.exports = router;

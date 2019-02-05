const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/properties');
const Client = require('../models/Clients');
const shopAccount = require('../models/ShopModel');
const imageAccount = require('../models/ImageModel');
const Appointments = require('../models/AppointmentModel');
const nodemailer = require('nodemailer');
const stripe = require("stripe")("sk_test_8KEn27WVr2fRHz847DSzDjpf");
const multer = require('multer');



const storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, req.body.username + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    }
  });

let upload = multer({ //multer settings
  storage: storage
})

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


router.get('/Token',(req, res) =>{
  res.json({'tokenCreated':true});
});

router.get('/GetClients', function(req, res) {
  Client.find().populate('appointment').sort({date:'asc'}).exec(function (err, data) {
    if (err){
      return next(err);
    }
    res.json(data);
  });  
}); 

router.get('/GetProfiles', function(req, res) {
  profileAccount.find().sort({date:'asc'}).exec(function (err, data) {
    if (err){
      if (err) return next(err);
    }
    res.json(data);
  });  
}); 

router.get('/LogoutUser',function(req,res){
  if(req.session.userID ){
    req.session.userID = null;
    res.json({
      success:true,
      error:null
    });
  }else{
    res.json({
      success:true,
      error:null
    })
  }  
});

router.post('/FindBarber',function(req,res){
  Client.findShopInCity(req,res);
})

router.get('/GetDates', function(req, res) {
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

router.put('/UpdateMyAppointment', function(req, res, next) {
  shopAccount.updateUserAppointment(req,res);
});

router.delete('/CancelMyAppointment/:id', function(req, res, next) {
  const id = req.params.id;
  Client.cancelMyAppointment(req,res,id)
});

router.put('/UpdateClient', function(req, res,next){
  Client.updateUserAccount(req,res);
});

router.put('/UpdateClientDetails', function(req, res, next) {

  const updateProfile = function updateProfile(err, profileData){
    if (err) return next(err);
    res.json(profileData);
  }

  Client.findOneAndUpdate({"_id": "5c2dbbfd04bb0223a84e8dfd"},{firstName:
    req.body.firstName}, {upsert:true}, updateProfile );
  
});

router.get('/GetProfileDetails', function(req, res, next) {

  const getProfile = function retrieveProfile(err, profileData){
    if (err) return next(err);
    res.json(profileData);
  }

  Client.findById(req.session.userID,getProfile).populate('appointment');
});

  /* PAY CLIENT */
router.post('/Pay', function(req, res, next) {
    stripe.charges.create({
      amount: req.body.amount,
      currency: req.body.currency,
      source: req.body.token['id'], 
      description: "Charge for geecutz"
    }, function(err, charge) {
      // asynchronously called
      if(err) return next(err);
      res.json(charge);
    });
});

router.post('/SaveAppointment', async (req,res,next) => {

  const clientId  = req.session.userID;
  const shopId = req.body.id;
  const shopAppointment = new Appointments(req.body);
  const user = await Client.findById(clientId);
  const shop = await shopAccount.findById(shopId);

  await shopAppointment.save(function(err,data){
    if(err) return next(err);
    console.log(data);
  });

  shop.appointments.push(shopAppointment);
  user.appointment = shopAppointment;
  await user.save({validateBeforeSave:false},function(err,data){
    if(err) return next(err);
    console.log(data);
  });


  await shop.save({validateBeforeSave:false},function(err,data){
    if(err) return next(err);
    res.json(data);
  });

});

  
  /* SAVE CLIENT */
router.post('/CreateClient', function(req, res, next) {
  if (!req.body.emailAddress || !req.body.password || !req.body.firstName ) {
    res.json({
      success: false,
      message: 'Please fill out all required fields'
    });
  } else {
    Client.createUserAccount(req,res);
  }
});
  


  //Email Client
router.post('/CreateEmail', function(req, res) {

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
  

router.post('/Login', (req, res) => {
    Client.findOne({
      email: req.body.email
    }, function(err, user) {
      if (err) throw err;
      if (!user) {
        res.send({
          success: false,
          message: 'Authentication failed. User not found.'
        });
      } else {
        // Check if password matches
        Client.comparePassword(req.body.password,user.password, function(err, isMatch) {
          if (isMatch && !err) {
            // Create token if the password matched and no error was thrown
            req.session.userID = user.id 
            req.session.save();
            const token = Client.generateJwt(user);
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
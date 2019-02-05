const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/properties');
const Client = require('../models/Clients');
const shopAccount = require('../models/ShopModel');
const imageAccount = require('../models/ImageModel');
//const profileAccount = require('../models/ProfileModel');
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

require('../config/passport')(passport);

/* router.get("/secretDebug",
  function(req, res, next){
    console.log(req.get('Authorization'));
    next();
  }, function(req, res){
    res.json("debugging");
});

router.get('/TestToken',passport.authenticate('jwt', {session:false}), (req,res) => { 
  res.json({message: "Success! You can not see this without a token"});
}); */
router.get('/GetAllShops', (req,res)=>{
  shopAccount.find({},function(err, users){
    if(err) throw err;
    res.json(users);
  }).populate('appointments');
});


router.get('/GetStores', (req,res)=>{
  shopAccount.find({},function(err, stores){
    if(err) throw err;
    res.json(stores);
  })
});

router.get('/GetProfileDetails', function(req, res, next) {
  
  const getProfile = function retrieveProfile(err, profileData){
    if (err) return next(err);
    res.json(profileData);
  }
  
  shopAccount.findById(req.session.userID,getProfile).populate('appointments');
});

router.put('/UpdateProfile', function(req, res, next) {
  shopAccount.updateBusinessAccount(req,res);
});

router.post('/FindShops', function(req, res, next) {
  shopAccount.findShopInCity(req,res);
});

router.put('/UpdateUserAppointment', function(req, res, next) {
  shopAccount.updateUserAppointment(req,res);
});

router.delete('/DeleteUserAppointment/:id', function(req, res, next) {
  const id = req.params.id
  shopAccount.deleteUserAppointment(req,res,id);
});

router.delete('/DeleteBusinessAccount/:id', function(req, res, next) {
  const id = req.params.id
  shopAccount.deleteBusinessAccount(req,res,id);
});

/* router.get('/GetProfileDetails/:id', function(req, res, next) {
  shopAccount.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
}); */

router.get('/GetImages', (req,res)=>{
  imageAccount.find({},function(err, users){
    if(err) throw err;
    res.json(users);
  })
});



router.post('/SaveImage',upload.single('photo') ,function(req, res) {
  //check for file and body
  if (req.file && req.body) {
    console.log(req.file);
    //save to database
    imageAccount.create({
      Photo:req.file.path,
      Username:req.body.username,
      ImageType:[req.file.mimetype,"hello world"]
    }, function(err){
      //send response
      if(err) throw err;
      res.json({'success':true});
    })
  } else {
    console.log('file received');
    return res.send({
      success: false
    })
  }

});


router.delete('/CancelAppointment/:id', function(req, res, next) {
  const id = req.params.id;
  shopAccount.deleteUserAppointment(req,res,id)
});

router.post('/SaveGallery',upload.array('photos') ,function(req, res) {
  if (!req.file && !req.files) {
    console.log("No file received");
    return res.send({
      success: false
    });

  } else {
    console.log('file received');
    return res.send({
      success: true
    })
  }

});



router.post('/CreateStore',(req, res)=>{
    console.log(JSON.stringify(req.body));
  
    if (!req.body.contactInfo ) {
        res.json({
          success: false,
          message: 'Please fill out all required fields'
        });
      } else {
        shopAccount.createShopUserAccount(req,res);
      }
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

router.post('/Login', (req, res) => {
  shopAccount.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.json({
        success: false,
        message: 'Authentication failed. User not found.'
      }); 
      //throw new Error("no user found");
    } else {
      // Check if password matches
      shopAccount.comparePassword(req.body.password,user.password, function(err, isMatchPassword) {
        if (isMatchPassword && !err) {
          // Create token if the password matched and no error was thrown
          req.session.userID = user.id 
          req.session.save();
          const token = shopAccount.generateJwt(user);
          res.json({
            success: true,
            message: 'Authentication successfull',
            token: token
          });
        } else {
          res.json({
            success: false,
            message: 'Incorrect email or password.'
          });
        }
      });
    }
  })
});


module.exports = router;

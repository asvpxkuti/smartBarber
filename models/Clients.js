const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/properties');
const shopAccount = require('../models/ShopModel');
const Appointments = require('../models/AppointmentModel');
const Schema = mongoose.Schema;

const ClientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName:{
    type: String,
    required: true
  },
  password:{
    type:String,
    required:true
  }, 
  email: {
    type: String, index: true, unique: true, required: true
  },
  phoneNumber:{
    type: String,
    required: true
  },
  appointment:[{
    type:Schema.Types.ObjectId,
    ref:'Appointments'
  }],
  submitted_date: {type: Date, default: Date.now()},
});

ClientSchema.plugin(uniqueValidator);

const Client = module.exports = mongoose.model('Client', ClientSchema);


function generateJwt(client) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  const token = "Bearer "+jwt.sign({
      _id: client.id,
      expiresIn: parseInt(expiry.getTime() / 1000),
  }, config.secret);

  return token // DO NOT KEEP YOUR SECRET IN THE CODE!
};


function createUserAccount(req,res){
  bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt,function (err, hash){
          if(err) throw err;
          const userData = {
              'firstName':req.body.firstName,
              'lastName':req.body.lastName,
              'email':req.body.email,
              'password':hash,
              'phoneNumber':req.body.phone,
          }
          Client.create(userData,(err,client)=>{
              if(err) throw err;
              res.json(
                {'success':true,
                  error:null
                }
              );
          })
      } );
  });
}

function updateUserAccount(req,res){
  bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt,function (err, hashedPassword){
          if(err) throw err;
          const userId = {'_id':req.body.id};
          const userData = {

              'firstName':req.body.firstName,
              'lastName':req.body.lastName,
              'email':req.body.email,
              'password':hashedPassword,
              'phoneNumber':req.body.phoneNumber,
          };
          function updateUserAccount(err, user){
            if(err) throw err;
            res.json({
              success:true,
              message:null
            })
          };
          Client.findOneAndUpdate(userId,userData,updateUserAccount)
      } );
  });
}

function findShopInCity(req,res){
  const city = 'Toronto';

  shopAccount.find({ 'contactInfo.address_.locality':new RegExp(city,'i') },
  function(err,doc){
    res.json(doc);
  }).populate('appointments');
}


function deleteClientAccount(req,res){
  const userid = req.body.id;
  Client.findByIdAndDelete(userid,
      function(err, result){
          res.json({
              success:true,
              error:null
          });
      }
  ) 
}


function cancelMyAppointment(req,res,id){
  Appointments.findByIdAndRemove(id,
      function(err, doc){
          res.json({
              success:true,
              error:null
          });
      }
  ) 
}

function updateMyAppointment(req,res){
  const userid = req.body.id;
      Appointments.findByIdAndUpdate(userid,
          {
              'shop':req.body.shop,
              'email':req.body.email,
              'firstName':req.body.firstName,
              'lastName':req.body.lastName,
              'apppointmentDay':req.body.apppointmentDay,
              'serviceType':req.body.serviceType,
              'priceOfService':req.body.priceOfService,
              'fullServicePaid':req.body.fullServicePaid,
              'balance':req.body.balance,

          }
          ,
          function(err, result){
              res.json({
                  success:true,
                  error:null
              });
          }
      ) 
}


function getUserFromDB(userName,callback){
  const query = {username: username}
  Client.findOne(query, callback);
} 

function comparePassword(candidatePassword, hashedPassword, callback){
  bcrypt.compare(candidatePassword, hashedPassword, (err, isMatch) => {
          if(err) throw err;
          callback(null, isMatch);
  });
}

module.exports.comparePassword = comparePassword
  
module.exports.createUserAccount = createUserAccount

module.exports.getUserByUsername = getUserFromDB

module.exports.updateUserAccount = updateUserAccount

module.exports.deleteClientAccount = deleteClientAccount

module.exports.findShopInCity = findShopInCity

module.exports.updateMyAppointment = updateMyAppointment

module.exports.cancelMyAppointment = cancelMyAppointment

module.exports.deleteClientAccount = deleteClientAccount

module.exports.generateJwt = generateJwt
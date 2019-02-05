const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/properties');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;
const Appointments = require('../models/AppointmentModel');

const storeSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    businessName:{
        type:String,
        required:true
    },
    contactInfo:{
        type:Object,
        required:true
    },
    serviceInfo:{
        type:Object,
        required:true
    },
    businessHours:{
        type:Object,
        required:true
    },
    createdAt:{
        type: Date, default: Date.now()
    },
    appointments:[{
        type:Schema.Types.ObjectId,
        ref:'Appointments'
    }]
});

//storeSchema.plugin(uniqueValidator);

const shopAccount = module.exports = mongoose.model('shopAccount', storeSchema);

function generateJwt(shopUser) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    const token = "Bearer "+jwt.sign({
        _id: shopUser.id,
        expiresIn: parseInt(expiry.getTime() / 1000),
    }, config.secret);
  
    return token // DO NOT KEEP YOUR SECRET IN THE CODE!
};

function createShopAccount(req,res){
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt,function (err, hashedPassword){
            if(err) throw err;

            const shopData = {
                'password':hashedPassword,
                'email':req.body.email,
                'businessName':req.body.businessName,
                'contactInfo':req.body.contactInfo,
                'serviceInfo':req.body.serviceInfo,
                'businessHours':req.body.businessHours,
            }
            shopAccount.create(shopData,(err,shopUser)=>{
                if(err) throw err;
                res.json(
                    { 
                     success:true,
                     message:null
                    }
                );
            })
        } );
    });
}

function updateBusinessAccount(req,res){
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt,function (err, hashedPassword){
            if(err) throw err;
            const profileId = {'_id':req.body.id};
            const shopData = {
                'password':hashedPassword,
                'email':req.body.email,
                'businessName':req.body.businessName,
                'contactInfo':req.body.contactInfo,
                'serviceInfo':req.body.serviceInfo,
                'businessHours':req.body.businessHours,
            }
            function updateBusinessAccount(err, user){
              if(err) throw err;
              res.json({
                success:true,
                message:null
              })
            };
            shopAccount.findOneAndUpdate(profileId,shopData,updateBusinessAccount)
        } );
    });
}

function updateUserAppointment(req,res){
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

function deleteUserAppointment(req,res,id){
        Appointments.findByIdAndDelete(id,
            function(err, result){
                res.json({
                    success:true,
                    error:null
                });
            }
        ) 
}

function findShopInCity(req,res){
    const city = req.body.city;
  
    shopAccount.find({ 'contactInfo.address_.locality':new RegExp(city,'i') },
    function(err,doc){
      res.json(doc);
    }).populate('appointments');
  }

function getShopAccountById(id,callback){
    shopAccount.findById(id, callback);
}

function deleteBusinessAccount(req,res,id){
    shopAccount.findByIdAndUpdate(id,
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
    shopAccount.findOne(query, callback);
} 

function comparePassword(candidatePassword, hashedPassword, callback){
    bcrypt.compare(candidatePassword, hashedPassword, (err, isMatch) => {
            if(err) throw err;
            callback(null, isMatch);
    });
}

module.exports.comparePassword = comparePassword
    
module.exports.createShopUserAccount = createShopAccount

module.exports.getUserByUsername = getUserFromDB

module.exports.getShopAccountById = getShopAccountById

module.exports.updateBusinessAccount = updateBusinessAccount;

module.exports.updateUserAppointment = updateUserAppointment;

module.exports.deleteUserAppointment = deleteUserAppointment;

module.exports.deleteBusinessAccount = deleteBusinessAccount;

module.exports.findShopInCity = findShopInCity;

module.exports.generateJwt = generateJwt




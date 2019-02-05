const mongoose = require('mongoose');
const Schema = mongoose.Schema;
appointmentSchema = new mongoose.Schema({
    firstName: {
        type:String,
        required:true
    },
    lastName: {
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    appointmentDay: {
        type:String,
        required:true
    },
    serviceType:{
        type:String,
        required:true
    },
    priceOfService:{
        type:String,
        required:true
    },
    fullServicePaid:{
        type:Boolean,
        required:true
    },
    balance:{
        type:Number,
        required:true
    },
    shop:{
        type:String,
        required:true
    }
});

const appointments = module.exports = mongoose.model('Appointments', appointmentSchema);

module.exports.addShopDetails = ShopDetails

module.exports.getUserByUsername = getUserFromDB

function ShopDetails(req, res){
    var shopDetails = {
        'shopAddress':req.body.shopAddress,
        'shopPhoneNumber':req.body.phoneNumber,
    }
    appointments.create(shopDetails,(err)=>{
        if(err) throw err;
        res.json({'success':true});
    })
}

function getUserFromDB(userName,callback){
    const query = {username: username}
    appointments.findOne(query, callback);
}


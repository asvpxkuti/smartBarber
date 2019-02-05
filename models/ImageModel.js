var mongoose = require('mongoose');
imageSchema = new mongoose.Schema({
    Photo: {
        type:Buffer,
        required:true
    },
    Username:{
        type:String,
        required:true
    },
    ImageType:{
        type:[String],
        required:true
    },   
    createdAt:{
        type: Date, default: Date.now()
    }
});

const ImageAccount = module.exports = mongoose.model('imageModel', imageSchema);
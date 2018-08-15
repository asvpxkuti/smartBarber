const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config/database');

// User Schema
/* const UserSchema = mongoose.Schema ({
  name: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback) {
  const query = {username: username}
  User.findOne(query, callback);
}

module.exports.addUser = function(newUser, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if(err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if(err) throw err;
    callback(null, isMatch);
  });
} */

//geecuts models

var BarberSchema = new mongoose.Schema({
  username: {
      type: String,
      required: true
    },
  password:  {
    type: String,
    required: true
  },
  email:{
        type: String,
        required: true
  }
});

const User = module.exports = mongoose.model('User',BarberSchema)

module.exports.getUserById = function(id, callback) {
    User.findById(id, callback);
  }
  
module.exports.getUserByUsername = function(username, callback) {
    const query = {username: username}
    User.findOne(query, callback);
}
  
module.exports.addUser = function(req, res) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
        if(err) throw err;
        var data = {
            'username':req.body.username,
            'email':req.body.email,
            'password':hash
        }
        User.create(data,(err)=>{
            if(err) throw err;
            res.json({'success':true});
        })
    });
});

}
  
module.exports.comparePassword = function(candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    });
}

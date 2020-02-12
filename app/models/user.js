const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = mongoose.Schema({
    first_name: {
        type: String,
        required: 'First name cannot be empty'
    },
    last_name: {
        type: String,
        required: 'Surname name can\'t be empty'
    },
    email: {
        type: String,
        required: 'Email can\'t be empty',
        unique: true
    },
    password: {
        type: String,
        required: 'Password can\'t be empty',
    },
    birthday: {
        type: Date,
        required: 'Birthday date can\'t be empty',
    },
    gender: {
        type: String,
        required: 'Gender can\'t be empty',
    },
}, {
    timestamps: true
});

UserSchema.pre('save', function(next) {
    bcrypt.genSalt(10, (err, salt) => {
        console.log('salt' + salt);
        bcrypt.hash(this.password, salt, (err, hash) => {
            console.log('password hashing');
            if (err)
                console.log('error occurred!:' + err.message);
            this.password = hash;
            next();
        });
    });
});

UserSchema.methods.checkhash = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

module.exports = mongoose.model('user', UserSchema);
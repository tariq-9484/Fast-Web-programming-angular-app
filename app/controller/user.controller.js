const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Create and Save new User
exports.create = (req, res, next) => {
    // Validate request

    if (!req.body.firstname || !req.body.lastname || !req.body.email || !req.body.password) {
        return res.sendFile('loginerror.html', { root: 'views' });
    }

    // Create a user
    const newUser = new User({
        first_name: req.body.firstname,
        last_name: req.body.lastname,
        email: req.body.email,
        password: req.body.password,
        birthday: req.body.birthday,
        gender: req.body.gender
    });

    // save the user to the db
    newUser.save((err, doc) => {
        if (!err)
            return res.sendFile('signupsuccessful.html', { root: 'views' });
        else {
            res.status(500).send({
                message: err.message || "Some error occurred while creating new user"
            });
        }
    });
};
//login
exports.login = (req, res) => {

    if (!req.body.email || !req.body.password) {
        return res.sendFile('loginerror.html', { root: 'views' });
    }

    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.sendFile('incorrectpass.html', { root: 'views' });
        }
        user.checkhash(req.body.password, (err, isMatch) => {
            if (err) return res.sendFile('login.html', { root: 'views' });
            if (isMatch) {
                jwt.sign({ User }, 'privatekey', { expiresIn: '20min' }, (err, token) => {
                    if (err) { console.log(err) }

                    // set a cookie
                    res.cookie('stored_jwt', token);
                    res.cookie('userid', user._id);

                    res.redirect('/profile');

                });
            } else {
                res.sendFile('incorrectpass.html', { root: 'views' });
            }
        });
    });
};

exports.changePass = (req, res) => {
    if (!req.body.old_password || !req.body.new_password || !req.body.confirm_password) {
        console.log('Password fields cannot be empyty');
        return res.sendFile('cannotupdatepass.html', { root: 'views' });
    }
    if (req.body.new_password != req.body.confirm_password) {
        console.log('New passwords did not matched!');
        return res.sendFile('cannotupdatepass.html', { root: 'views' });
    }
    if (req.cookies && req.cookies['userid'] != undefined) {
        User.findOne({ _id: req.cookies['userid'] }, (err, user) => {
            if (err) throw err;
            user.checkhash(req.body.old_password, (err, isMatch) => {
                if (err) return res.sendFile('cannotupdatepass.html', { root: 'views' });
                if (isMatch) {

                    bcrypt.genSalt(10, (err, salt) => {
                        console.log('salt' + salt);
                        bcrypt.hash(req.body.new_password, salt, (err, hash) => {
                            console.log('password hashing');
                            if (err)
                                console.log('error occurred!:' + err.message);

                            User.findByIdAndUpdate(req.cookies['userid'], {
                                    password: hash,
                                }, { new: true })
                                .then(user => {
                                    if (!user) {
                                        console.log("User not found");
                                        return res.sendFile('login.html', { root: 'views' });
                                    }
                                    res.redirect('http://localhost:8080/profile');
                                }).catch(err => {
                                    if (err.kind === 'ObjectId') {
                                        console.log("User not found");
                                        return;
                                    }
                                    console.log("Error updating password of this user.");
                                    return;
                                });
                        });
                    });

                } else {
                    return res.sendFile('cannotbeupdate.html', { root: 'views' });
                }
            });
        });
    }
}

exports.updateInfo = (req, res) => {
    if (!req.body.first_name || !req.body.lastname || !req.body.email) {
        return res.sendFile('fieldscannotbeempty.html', { root: 'views' });
    }
    if (req.cookies && req.cookies['userid'] != undefined) {
        User.findByIdAndUpdate(
                req.cookies['userid'], {
                    first_name: req.body.first_name,
                    last_name: req.body.lastname,
                    email: req.body.email
                }, { new: true })
            .then(user => {
                if (!user) {
                    return res.sendFile('cannotbeupdate.html', { root: 'views' });
                }

                res.redirect('http://localhost:8080/profile');
            }).catch(err => {
                if (err.kind === 'ObjectId') {
                    console.log("User not found with this id.");
                }
                console.log("Error updating this user.");
                return res.sendFile('cannotbeupdate.html', { root: 'views' });
            });
    }
};

exports.deleteuser = (req, res) => {
    if (req.cookies && req.cookies['userid'] != undefined) {
        User.findOne({ _id: req.cookies['userid'] }, (err, user) => {
            if (err) throw err;
            user.remove();
            res.clearCookie('stored_jwt');
            res.sendFile('login.html', { root: 'views' });
            console.log('account deleted');
        });
    }
}
const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
const promisify = require('es6-promisify');

exports.login = passport.authenticate('local', {
    failRedirect: '/login',
    failureFlash: 'Failed Login!',
    successRedirect: '/',
    successFlash: 'You are now logged in!'
});

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', "You have been logged out!");
    res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
        return;
    }
    req.flash('danger', 'You must be logged in');
    res.redirect('/login');

}

exports.forgotForm = (req, res) => {
    res.render('forgot', {title: 'Forgot Password'});
};

exports.forgot = async (req,res) => {
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        req.flash('danger', 'No account with that email exists');
        return res.redirect('/reset');
    }

    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();
    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;

    req.flash('success', `You have been emailed a password reset link. ${resetURL}`);
    res.redirect('/login');
}

exports.reset = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('danger', 'Password token invalid or has expired');
        return res.redirect('/login');
    }

    res.render('reset', {title: "Password Reset"});
}

exports.confirmedPasswords = (req, res, next) => {
    if(req.body.password === req.body['password-confirm']) {
        next();
        return;
    }
    req.flash('danger', 'Passwords do not match!');
    res.redirect('back');
}

exports.updatePassword = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('error', 'Password token invalid or has expired');
        return res.redirect('/login');
    }

    const setPassword = promisify(user.setPassword, user);
    await setPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();
    await req.login(updatedUser);
    req.flash('success', 'Nice, your password has been reset!');
    res.redirect('/');
}
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
    res.render('login', {title: 'Login'});
};

exports.registerLogin = async (req, res) => {
     //req.flash('danger', `Something happened`);
     //req.flash('primary', `Something happened`);
     //req.flash('info', `Something happened`);
     //req.flash('warning', `Something happened`); 
     res.render('register', {title: 'Register'});
}

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name');
    req.checkBody('name', 'You must supply a name').notEmpty();
    req.checkBody('email', 'That Email is not valid').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        removeExtension: false,
        gmail_remove_subadress: false
    });
    req.checkBody('password', 'Password cannot be blank').notEmpty();
    req.checkBody('password-confirm', 'Password confirm cannot be blank').notEmpty();
    req.checkBody('password-confirm', 'Oops your passwords do not match').equals(req.body.password);

    const errors = req.validationErrors();

    if(errors) {
        req.flash('danger', errors.map(err => err.msg));
        res.render('register', {
            title: 'Register',
            body: req.body,
            flashes: req.flash()
        });
        return;
    }
    next();
}

exports.register = async (req, res, next) => {
    const user = new User({ 
        email: req.body.email, 
        name: req.body.name
    });
    const register = promisify(User.register, User);
    await register(user, req.body.password);
    next();
}

exports.account = (req, res) => {
    res.render('account', {title: 'Edit your Account'});
}

exports.updateAccount = async (req, res) => {
    const updates = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findOneAndUpdate(
        { _id: req.user.id},
        { $set: updates},
        { new: true, runValidators: true, context: 'query' }
    );
    req.flash('success', 'Success, your account has been updated');
    res.redirect('back');
}
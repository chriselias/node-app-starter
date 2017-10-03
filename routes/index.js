const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pageController");
const userController = require("../controllers/userController");
const authController = require('../controllers/authController');

const { catchErrors } = require("../handlers/errorHandlers");

router.get("/", (req, res) => {
  res.render("index", { title: "Home Page" });
});

router.get("/page", authController.isLoggedIn, pageController.page);
router.get("/login", userController.loginForm);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get("/register", catchErrors(userController.registerLogin));
router.post('/register',
  userController.validateRegister,
  userController.register,
  authController.login
);

router.get('/forgot', authController.forgotForm);
router.get('/account', userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token',
  authController.confirmedPasswords,
  catchErrors(authController.updatePassword)
);


module.exports = router;

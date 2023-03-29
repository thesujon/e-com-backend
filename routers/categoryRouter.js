const router = require('express').Router();
const { createCategory, getCategories } = require('../controllers/category.Controllers');
const admin = require('../middlewares/admin');
const authorize = require('../middlewares/authorize');

router.route('/')
    .post([authorize, admin], createCategory)
    .get(getCategories);

module.exports = router;
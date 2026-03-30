const express = require('express');
const { loginUser, loginMentor, loginAdmin } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/user/login', loginUser);
router.post('/mentor/login', loginMentor);
router.post('/admin/login', loginAdmin);

module.exports = router;

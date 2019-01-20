const express = require('express'),
	router = express.Router();

const config = require('../config');

router.get('/getValidationRules', (req, res) => {
	console.log("getValidationRules");

	res.send(config.validationRules);
});

module.exports = router;

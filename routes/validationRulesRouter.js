const express = require('express'),
	router = express.Router();

const configuration = require('../config');

router.get('/getValidationRules', (req, res) => {
	console.log("getValidationRules");

	res.send(configuration.validationRules);
});

module.exports = router;

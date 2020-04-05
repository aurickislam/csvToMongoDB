const router = require('express').Router();

const config = require('../config');

module.exports = router;

router.get('/', (req, res) => {
	console.log("getValidationRules");

	res.send(config.validationRules);
});

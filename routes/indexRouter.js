const express = require('express'),
	router = express.Router();

const csvService = require('../service/csvUploadService');

/* GET home page. */
router.get('/', (req, res) => {
	res.send("Hello world");
});

module.exports = router;

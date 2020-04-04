const express = require('express'),
	path = require('path');

const router = express.Router();

module.exports = router;

/* GET home page. */
router.get('/', (req, res) => {
	// res.send("Hello world");

	const fileDirectory = path.resolve(__dirname, '..', 'public/');
	console.log(fileDirectory);

	res.sendFile('uploadCSV.html', {root: fileDirectory}, (err) => {
		res.end();

		if (err) throw(err);
	});
});
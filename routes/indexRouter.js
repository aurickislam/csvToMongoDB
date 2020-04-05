const router = require('express').Router(),
	path = require('path');

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

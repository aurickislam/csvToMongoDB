const express = require('express'),
	router = express.Router();

// const csvUploadService = require('../service/csvUploadService');
let csvUploadService;

function setCSVUploadService (_csvUploadService) {
	csvUploadService = _csvUploadService;
}

router.post('/upload', (req, res) => {
	console.log("upload");

	// console.log(req.body);

	csvUploadService.uploadCSV(req.body.fileName, req.body.fileBuffer, "abcd");

	console.log("Process done");

	res.status(200).send("Seccess");
});

module.exports = {
	router: router,
	setCSVUploadService: setCSVUploadService
};

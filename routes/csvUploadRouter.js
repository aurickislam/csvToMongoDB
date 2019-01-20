const express = require('express'),
	router = express.Router(),
	uuidv1 = require('uuid/v1');

// const csvUploadService = require('../service/csvUploadService');
let csvUploadService;

function setCSVUploadService (_csvUploadService) {
	csvUploadService = _csvUploadService;
}

router.post('/upload', (req, res) => {
	console.log("upload");

	// console.log(req.body);
	let batchId = uuidv1();
	csvUploadService.uploadCSV(req.body.fileName, req.body.fileBuffer, batchId);

	console.log("Process done");

	res.status(200).send({
		batchId: batchId
	});
});

module.exports = {
	router: router,
	setCSVUploadService: setCSVUploadService
};

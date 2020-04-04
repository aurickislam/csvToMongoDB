const express = require('express'),
	router = express.Router(),
	uuidv1 = require('uuid/v1');

let csvUploadService;

module.exports = ({_csvUploadService, _uploadHistoryService}) => {
	csvUploadService = _csvUploadService;
	return router;
};

router.post('/upload', (req, res) => {
	console.log("upload");

	let batchId = uuidv1();
	csvUploadService.uploadCSV(req.body.fileName, req.body.fileBuffer, batchId);

	res.status(200).send({
		batchId: batchId
	});
});
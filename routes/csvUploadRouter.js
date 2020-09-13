const router = require('express').Router(),
	{v4} = require('uuid');

let csvUploadService;

module.exports = ({_csvUploadService, _uploadHistoryService}) => {
	csvUploadService = _csvUploadService;
	return router;
};

router.post('/upload', (req, res) => {
	console.log("upload");

	let batchId = v4();
	csvUploadService.uploadCSV(req.body.fileName, req.body.fileBuffer, batchId);

	res.status(200).send({
		batchId: batchId
	});
});

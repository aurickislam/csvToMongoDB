const express = require('express'),
	router = express.Router();

// const uploadHistoryService = require('../service/uploadHistoryService');
let uploadHistoryService;

function setUploadHistoryService (_uploadHistoryService) {
	uploadHistoryService = _uploadHistoryService;
}

router.get('/uploadHistories', async (req, res) => {
	console.log("uploadHistories");

	res.send(await uploadHistoryService.getUploadHistories());
});

module.exports = {
	router: router,
	setUploadHistoryService: setUploadHistoryService
};

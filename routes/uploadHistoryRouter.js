const express = require('express'),
	router = express.Router();

let uploadHistoryService;

module.exports = ({_uploadHistoryService}) => {
	uploadHistoryService = _uploadHistoryService;
	return  router;
};

router.get('/uploadHistories', async (req, res) => {
	console.log("uploadHistories");

	res.send(await uploadHistoryService.getUploadHistories());
});
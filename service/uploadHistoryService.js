const config = require('../config');

let db;

exports.setDB = (database) => {
	db = database;
};

exports.getUploadHistories = async function () {
	const uploadHistory = db.collection(config.mongoDB.collections.uploadHistory);
	return await uploadHistory.find({}).toArray();
};
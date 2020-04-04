const config = require('../config'),

	_exports = {};

let database;

module.exports = (db) => {
	database = db;
	return _exports;
};

_exports.getUploadHistories = async _ => {
	const uploadHistory = database.collection(config.mongoDB.collections.uploadHistory);
	return await uploadHistory.find({}).toArray();
};
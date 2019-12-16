const _ = require('underscore'),
	csvtojson = require('csvtojson/v2'),
	ObjectID = require('mongodb').ObjectID;

const config = require('../config'),
	utils = require('../utils/utils');

let db;

exports.setDB = (database) => {
	db = database;
};

function getUniqueColumns(validationRules) {
	console.log('@getUniqueColumns');

	let uniqueColumns = [];
	validationRules.forEach(function(validationRule) {

		let saveAs = validationRule.saveAs;
		if (validationRule.unique) {
			if (!_.isUndefined(saveAs) && !_.isEmpty(saveAs) && saveAs != null)
				uniqueColumns.push((typeof saveAs == 'object') ? saveAs.newColumn : saveAs);
			else
				uniqueColumns.push(validationRule.column);
		}
	});

	return uniqueColumns;
}

exports.uploadCSV = async (fileName, fileBuffer, batchId) => {
	console.log('@uploadCSV');

	const mainCollection = db.collection(config.mongoDB.collections.mainCollection),
		uploadHistory = db.collection(config.mongoDB.collections.uploadHistory);

	let validationRules = config.validationRules,
		uniqueColumns = getUniqueColumns(validationRules),
		newDocumentList = [], invalidRowList = [],
		bulkOp = mainCollection.initializeUnorderedBulkOp(),
		bulkCounter = 0, insertedRows = 0, updatedRows = 0, failedRows = 0,
		failedRowsStr = '',
		uploadHistoryId,
		headerLength = 0;

	// console.log("@uniqueColumns", uniqueColumns);

	csvtojson()
		.fromString(fileBuffer)
		.on('header',(header)=> {
			headerLength = header.length;
			header.push('failedReason');
			// console.log("@header", header);
			failedRowsStr += header.join(',') + '\n';
		})
		.subscribe(async (row) => { //single json object will be emitted for each csv line

			console.log("@row", row);

			let rowValues = Object.values(row),
				rowCSVRow = rowValues.join(','),
				failedReason = [],
				isValid = true;

			if (rowValues.length == headerLength) {

				// for (let key in audience) {
				validationRules.forEach(function(validationRule) {
					// console.log("@validationRule", validationRule);
					let column = validationRule.column,
						cellValue = row[column];

					console.log("@column", column);

					if (!_.isUndefined(cellValue) && !_.isEmpty(cellValue)) {

						if (validationRule.type == 'NUMBER') {
							console.log("@NUMBER");

							if (!isNaN(cellValue)) {
								cellValue = parseInt(cellValue);
							} else {
								failedReason.push('(' + column + ': ' + cellValue + ') must be a NUMBER');
								isValid = false;
							}
						} else if (validationRule.type == 'EMAIL') {
							console.log("@EMAIL");

							if (!utils.isEmailValid(cellValue)) {
								failedReason.push('(' + column + ': ' + cellValue + ') is not a valid EMAIL');
								isValid = false;
							}
						} else if (_.isUndefined(validationRule.type) || _.isEmpty(validationRule.type) || validationRule.type == 'STRING') {
							console.log("@STRING");

							let size = validationRule.size;
							console.log("@size", size);

							if (!_.isUndefined(size) || !_.isEmpty(size)) {
								console.log("@string with length");

								if (!isNaN(size) && cellValue.length != +size) {
									console.log("data length is not equal");

									failedReason.push('(' + column + ': ' + cellValue + ') - length must be exact ' + size);
									isValid = false;
								} else if (typeof size == 'object') {
									console.log("length object");

									let min = +size.min,
										max = +size.max;

									if ((!isNaN(min) && !isNaN(max)) && !(min <= cellValue.length && cellValue.length <= max)) {
										console.log("data length is not in range");
										failedReason.push('(' + column + ': ' + cellValue + ') - length must be between ' + min + ' to ' + max);
										isValid = false;
									}
								}
							}
						}

						if (isValid) {

							let saveAs = validationRule.saveAs;

							console.log("@saveAs", saveAs);

							if (!_.isUndefined(saveAs) && !_.isEmpty(saveAs) && saveAs != null) {

								if (typeof saveAs == 'string') {
									console.log("@saveAs string", saveAs);

									row[saveAs] = cellValue;
									delete row[column];
								} else if (typeof saveAs == 'object') {
									console.log("@saveAs object", saveAs.newColumn);

									row[saveAs.newColumn] = (cellValue == saveAs.conditionValue) ? saveAs.ifTrue : saveAs.ifFalse;
									delete row[column];
								}
							} else {
								row[column] = cellValue;
							}
						}

					} else {
						if (validationRule.required) {
							// console.log("empty value found");

							failedReason.push('(' + column + ') can not be empty');
							isValid = false;
						} else {
							delete row[column];
						}
					}
				});
			} else {
				// console.log('@header and data mismatch');

				failedReason.push('Header Length: ' + headerLength + ' & Data Length: ' + rowValues.length + ' is not equal.');
				isValid = false;

				let lengthDiff = headerLength - rowValues.length;
				for (let i = 0; i < lengthDiff; i++)
					rowCSVRow += ',';
			}

			if (isValid) {
				console.log("@this audience is valid");

				let filterOneByUnique = {};
				if (!_.isUndefined(uniqueColumns)) {

					// filterOneByUnique.batchId = batchId;
					uniqueColumns.forEach(function (item) {
						filterOneByUnique[item] = row[item];
					});
				}

				console.log("@filterOneByUnique", filterOneByUnique);

				if (!_.findWhere(newDocumentList, filterOneByUnique)) {
					console.log('@@Not found on bulk array');

					newDocumentList.push(filterOneByUnique);

					let foundDocument = await mainCollection.findOne(filterOneByUnique);

					console.log("@foundDocument", foundDocument);

					if (foundDocument != null) {
						console.log('@@Found on database');

						row.batchId = batchId;
						bulkOp.find({_id: foundDocument._id}).update({$set: row});
						updatedRows++;
					} else {
						console.log('@@Not found on database');
						row.batchId = batchId;
						bulkOp.insert(row);
						insertedRows++;
					}

					bulkCounter++;
					if (bulkCounter == config.bulkSize) {
						console.log("Saving a batch");
						bulkOp.execute(function (e, result) {
							// do something with result
						});
						bulkOp = mainCollection.initializeUnorderedBulkOp();
						bulkCounter = 0;

						// Updating on audience upload
						let uploadHistoryObj = {
							fileName: fileName,
							batchId: batchId,
							insertedRows: insertedRows,
							updatedRows: updatedRows,
							failedRows: failedRows,
							status: "RUNNING"
						};

						if (failedRows != 0)
							uploadHistoryObj.failedCSV = failedRowsStr;

						if (uploadHistoryId == undefined) {
							// audienceUpload._id = new Mongo.Collection.ObjectID();
							uploadHistoryObj.createDate = new Date();

							let uploadHistoryRes = await uploadHistory.insertOne(uploadHistoryObj);
							uploadHistoryId = uploadHistoryRes.insertedId;

							console.log('@uploadHistoryId', uploadHistoryId);
						} else {
							uploadHistory.updateOne({_id: ObjectID(uploadHistoryId)}, { $set: uploadHistoryObj }, {upsert: true});
						}

						newDocumentList = [];
					}
				} else {
					console.log('@@Found on bulk array');
				}

				console.log("\n\n\n");
			} else {
				console.log("@this audience is not valid\n\n\n");
				invalidRowList.push(row);
				failedRows++;
				failedRowsStr += rowCSVRow + ',' + failedReason.join(' || ') + '\n';
			}
		})
		.on('done', async function (error) {
			if (!error) {
				console.log("@Processing finished");

				if (bulkCounter != 0) {
					bulkOp.execute(function (e, result) {
						// do something with result
					});
					bulkOp = mainCollection.initializeUnorderedBulkOp();
				}

				let uploadHistoryObj = {
					fileName: fileName,
					batchId: batchId,
					insertedRows: insertedRows,
					updatedRows: updatedRows,
					failedRows: failedRows,
					status: "COMPLETED"
				};

				if (failedRows != 0)
					uploadHistoryObj.failedCSV = failedRowsStr;

				if (uploadHistoryId == undefined) {
					uploadHistoryObj.createDate = new Date();

					let uploadHistoryRes = await uploadHistory.insertOne(uploadHistoryObj);
					uploadHistoryId = uploadHistoryRes.insertedId;
				} else {
					uploadHistory.updateOne({_id: ObjectID(uploadHistoryId)}, { $set: uploadHistoryObj }, {upsert: true});
				}
			} else {
				let uploadHistoryObj = {
					fileName: fileName,
					batchId: batchId,
					insertedRows: insertedRows,
					updatedRows: updatedRows,
					failedRows: failedRows,
					status: "FAILED"
				};
				if (uploadHistoryId == undefined) {
					let uploadHistoryRes = await uploadHistory.insertOne(uploadHistoryObj);
					uploadHistoryId = uploadHistoryRes.insertedId;
				} else {
					uploadHistory.updateOne({_id: ObjectID(uploadHistoryId)}, { $set: uploadHistoryObj }, {upsert: true});
				}
			}
		});

	// return future.wait();
};

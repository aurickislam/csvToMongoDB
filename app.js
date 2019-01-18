const express = require('express');

const app = express(),
	config = require('./config');

let indexRouter = require('./routes/indexRouter'),
	csvUploadRouter = require('./routes/csvUploadRouter'),
	validationRulesRouter = require('./routes/validationRulesRouter'),
	uploadHistoryRouter = require('./routes/uploadHistoryRouter');

// app.use(bodyParser.json());
app.use(express.json());

app.use(express.static('public'));

app.use('/', indexRouter);
app.use('/csvUpload', csvUploadRouter.router);
app.use('/validationRules', validationRulesRouter);
app.use('/uploadHistory', uploadHistoryRouter.router);


const MongoClient = require('mongodb').MongoClient,
	assert = require('assert');

// Database Name
const databaseName = config.mongoDB.databaseName;

// Connection URL
const url = 'mongodb://' + config.mongoDB.host + ':' + config.mongoDB.port + '/' + databaseName;
// const url = 'mongodb://aurick:aurick@' + config.mongoDB.host + ':' + config.mongoDB.port + '/' + databaseName;
// const url = 'mongodb://aurick:aurick@localhost:27017/?authMechanism=DEFAULT&authSource=db';

// Create a new MongoClient
const client = new MongoClient(url, {useNewUrlParser: true});

// Use connect method to connect to the Server
client.connect((err) => {
	if (!err) {
		console.log("Connected successfully with MongoDB");

		// app.locals.db = client.db(databaseName);
		let db = client.db(databaseName);

		initServises(db);

		app.listen(config.serverPort, () => {
			console.log('Server is running at : ' + config.server);
		});
	} else {
		console.log("Failed to connect with MongoDB", err);
	}
	assert.equal(null, err);
});


function initServises(db) {
	let csvUploadService = require('./service/csvUploadService');
	csvUploadService.setDB(db);
	csvUploadRouter.setCSVUploadService(csvUploadService);


	let uploadHistoryService = require('./service/csvUploadService');
	uploadHistoryService.setDB(db);
	uploadHistoryRouter.setUploadHistoryService(uploadHistoryService);
}
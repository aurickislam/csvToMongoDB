const express = require('express'),
	MongoClient = require('mongodb').MongoClient;

const app = express(),
	config = require('./config');

const indexRouter = require('./routes/indexRouter'),
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


// Database Name
const databaseName = config.mongoDB.databaseName;

// Connection URL
const url = 'mongodb://' + config.mongoDB.host + ':' + config.mongoDB.port + '/' + databaseName;
// const url = 'mongodb://aurick:aurick@' + config.mongoDB.host + ':' + config.mongoDB.port + '/' + databaseName;

// const url = 'mongodb://192.168.88.16:27017,127.0.0.1:27017/csvToMongoDB?replicaSet=csvToMongoDB';

// Create a new MongoClient
const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});

// Use connect method to connect to the Server
client.connect((err) => {
	if (!err) {
		console.log("Connected successfully with MongoDB");

		// app.locals.db = client.db(databaseName);
		let db = client.db(databaseName);

		initServises(db);

		app.listen(config.serverPort, () => {
			console.log('==============================');
			console.log('Server is running at : ' + config.serverPort + " port");
			console.log('==============================');
		});
	} else {
		console.log("Failed to connect with MongoDB", err);
	}
});


function initServises(db) {
	let csvUploadService = require('./service/csvUploadService');
	csvUploadService.setDB(db);
	csvUploadRouter.setCSVUploadService(csvUploadService);


	let uploadHistoryService = require('./service/csvUploadService');
	uploadHistoryService.setDB(db);
	uploadHistoryRouter.setUploadHistoryService(uploadHistoryService);
}
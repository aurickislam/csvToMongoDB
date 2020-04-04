const express = require('express'),
	app = express(),
	MongoClient = require('mongodb').MongoClient,
	colors = require('colors');	// Can be used in any scripts without import
	// colors = require('colors/safe');	// console.log(colors.rainbow('color'));
// colors.disable();

const config = require('./config');

app.use(express.json());
app.use(express.static('public'));

/** Create a new MongoClient */
const client = new MongoClient(config.mongoDB.url, {useNewUrlParser: true, useUnifiedTopology: true});

/** Use connect method to connect to the Server */
client.connect((err) => {
	if (!err) {
		console.log('\n==================================='.rainbow);
		console.log('Connected successfully with MongoDB'.cyan);
		console.log('===================================\n'.rainbow);

		// app.locals.db = client.db(databaseName);
		const db = client.db(config.mongoDB.databaseName);

		init(db);

		app.listen(config.serverPort, () => {
			console.log('\n============================='.rainbow);
			console.log(`Server is running at :${config.serverPort} port`.cyan);
			console.log('=============================\n'.rainbow);
		});
	} else {
		console.log("Failed to connect with MongoDB".red, err);
	}
});

function init(db) {
	const services = {
		_csvUploadService: require('./service/csvUploadService')(db),
		_uploadHistoryService: require('./service/uploadHistoryService')(db)
	};

	app.use('/', require('./routes/indexRouter'));
	app.use('/csvUpload', require('./routes/csvUploadRouter')(services));
	app.use('/validationRules', require('./routes/validationRulesRouter'));
	app.use('/uploadHistory', require('./routes/uploadHistoryRouter')(services));
}
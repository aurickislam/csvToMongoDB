module.exports = {
	validationRules: [
		{
			column: "name",
			type: "STRING",
			required: true,
			unique: false,
			saveAs: ""
		},
		{
			column: "emailAddr",
			type: "EMAIL",
			required: true,
			unique: true,
			saveAs: "email"
		},
		{
			column: "age",
			type: "NUMBER",
			required: true
		},
		{
			column: "accountNumber",
			type: "STRING",
			required: true,
			size: 7
		},
		{
			column: "cifNumber",
			type: "NUMBER",
			required: true,
			unique: true
		},
		{
			column: "optedIn",
			type: "STRING",
			required: true,
			saveAs: {
				newColumn: "subscription",
				conditionValue: "TRUE",
				ifTrue: true,
				ifFalse: false
			}
		},
		{
			column: "zip",
			type: "NUMBER",
			required: false,
			saveAs: ""
		},
		{
			column: "city",
			type: "STRING",
			required: true,
			size: {
				min: 4,
				max: 12
			}
		}
	],
	bulkSize: 2,
	mongoDB: {
		databaseName: "csvToMongoDB",
		url: "mongodb://192.168.88.18:27017",
		// url: "mongodb://192.168.88.17:27017,192.168.88.18:27017/csvToMongoDB?replicaSet=my_replica",
		collections: {
			mainCollection: "mainCollection",
			uploadHistory: "uploadHistory"
		}
	},
	serverPort: 80
};
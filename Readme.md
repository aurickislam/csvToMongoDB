# CSVTOMONGODB

`csvToMongoDB` is a simple node.js based web application which uploads CSV file, converts CSV rows into JSON object and store those in MongoDB. It maintains a configuration file for validate the CSV file's header and rows.

First, before uploading the selected CSV file from clients browser it validates the header. On server side each row is been converted into JSON, validated each cell's data according to configuration and finally those row JSON's are inserted or updated in MongoDB.

### Validation rules (config.js)

```json
[
	{
		"column": "name",
		"type": "STRING",
		"required": true,
		"unique": false,
		"saveAs": ""
	},
	{
		"column": "emailAddr",
		"type": "EMAIL",
		"required": true,
		"unique": true,
		"saveAs": "email"
	},
	{
		"column": "age",
		"type": "NUMBER",
		"required": true
	},
	{
		"column": "accountNumber",
		"type": "STRING",
		"required": true,
		"size": 7
	},
	{
		"column": "cifNumber",
		"type": "NUMBER",
		"required": true,
		"unique": true
	},
	{
		"column": "optedIn",
		"type": "STRING",
		"required": true,
		"saveAs": {
			"newColumn": "subscription",
			"conditionValue": "TRUE",
			"ifTrue": "SUBSCRIBED",
			"ifFalse": "UNSUBSCRIBED"
		}
	},
	{
		"column": "zip",
		"type": "NUMBER",
		"required": false,
		"saveAs": ""
	},
	{
		"column": "city",
		"type": "STRING",
		"required": true,
		"size": {
			"min": 4,
			"max": 12
		}
	}
]
```

Following parameters are supported:

* **column (Required)**: Property `column` will contain a column name of CSV file. It should exist and match with CSV header.
* **type**: This Property is used to validate the data type under this particular column. Currently supports `type: <STRING | NUMBER | EMAIL>`. If not provided or empty will considered as `STRING`.
* **required**: Default value is `false`. If this property is set to `true` and cell value is empty under this column then this whole row will considered as invalid. And will not inserted or updated in MongoDB.
* **unique**: Default value is `false`. If `true` then this cell value is considered as unique. Before store application will check if any document exist or not with this value. If exist the whole existed document will be updated with new values. Otherwise it will be inserted as new document. (If multiple column is `unique` then it will run `AND` operation to find the document)
* **saveAs**: This property is used to save `"column"` as `"newColumn"` i.e. `"emailAddr"` as `"email"`. In another word rename the column name before inserted in MongoDB. Format is `"saveAs": "email"`. It is also possible to set user defined value based on condition. **Example:** if `optedIn` cell value is equal to `"TRUE"` then save the value as `{"subscription": "SUBSCRIBED"}`, if not then `"subscription": "UNSUBSCRIBED"` For this `"saveAs"` parameter expect an object.
    * **newColumn**: Current column name will be replaced by this parameters value.
    * **conditionValue**: This is a user defined condition.
    * **ifTrue**: If `"conditionValue"` matched then this properties value will be used.
    * **ifFalse**: If `"conditionValue"` does not match then this properties value will be used.
* **size**: This parameter defines the size of the value. Value length can be fixed or a range. If fix size then the format is `"size": 7`. If range then `"size"` is an object with two property `"min" | "max"`.
    * **min**: Lower length
    * **max**: Upper length

### Example CSV

name | emailAddr | age | accountNumber | cifNumber | optedIn | zip | city
--- | --- | --- | --- |--- |--- |--- |---
Demo name1 | demo.name1@csvtomongodb.com | 23 | 1234561 | 1234561 | TRUE | 1204 | New York
Demo name2 | demo.name2@csvtomongodb.com | 23 | 1234562 | 1234562 | TRUE | 1204 | New York
Demo name3 | demo.name3@csvtomongodb.com | 23 | 1234563 | 1234563 | TRUE | 1204 | New York
Demo name4 | demo.name4@csvtomongodb.com | 23 | 1234564 | 1234564 | TRUE | 1204 | This column will be ignored
Demo name5 | demo.name5@csvtomongodb.com | 23 | 1234565 | 1234565 | TRUE | 1204 | California

### Raw CSV data

```
name,emailAddr,age,accountNumber,cifNumber,optedIn,zip,city
Demo name1,demo.name1@csvtomongodb.com,23,1234561,1234561,TRUE,1204,New York
Demo name2,demo.name2@csvtomongodb.com,25,1234562,1234562,TRUE,1204,New York
Demo name3,demo.name3@csvtomongodb.com,24,1234563,1234563,TRUE,1204,New York
Demo name4,demo.name4@csvtomongodb.com,20,1234564,1234564,TRUE,1204,This column will be ignored
Demo name5,demo.name5@csvtomongodb.com,26,1234565,1234565,TRUE,1204,California
```

### After inserted into MongoDB

```json
{
    _id: ObjectId('5e88a03773d13e3b4c68170a'),
    name: 'Demo name1',
    age: 23,
    accountNumber: '1234561',
    cifNumber: 1234561,
    zip: 1204,
    city: 'New York',
    email: 'demo.name1@csvtomongodb.com',
    subscription: true,
    batchId: '86a54480-7684-11ea-bf68-391e5e8263b4'
}

{
    _id: ObjectId('5e88a03773d13e3b4c68170b'),
    name: 'Demo name2',
    age: 25,
    accountNumber: '1234562',
    cifNumber: 1234562,
    zip: 1204,
    city: 'New York',
    email: 'demo.name2@csvtomongodb.com',
    subscription: true,
    batchId: '86a54480-7684-11ea-bf68-391e5e8263b4'
}

{
    _id: ObjectId('5e88a03773d13e3b4c68170d'),
    name: 'Demo name3',
    age: 24,
    accountNumber: '1234563',
    cifNumber: 1234563,
    zip: 1204,
    city: 'New York',
    email: 'demo.name3@csvtomongodb.com',
    subscription: true,
    batchId: '86a54480-7684-11ea-bf68-391e5e8263b4'
}

{
    _id: ObjectId('5e88a03773d13e3b4c68170e'),
    name: 'Demo name5',
    age: 26,
    accountNumber: '1234565',
    cifNumber: 1234565,
    zip: 1204,
    city: 'California1',
    email: 'demo.name5@csvtomongodb.com',
    subscription: true,
    batchId: '86a54480-7684-11ea-bf68-391e5e8263b4'
}
```
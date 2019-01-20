# CSVTOMONGODB

`csvtoMongoDB` is a simple node.js based web application which upload and convert CSV file into JSON and store those in MongoDB. It maintains a configuration file for validate the file's header and data. First, before uploading the file from clients browser it validates the header. On server side each row is been converted into JSON, validated each cell's data according to confiluration and finally those row JSON is saved or updated to MongoDB.

# Validation rules (config.json)

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
			"conditionValue": "true",
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
			"max": 20
		}
	}
]
```

Following parameters are supported:

* **output (Required)**: This parameter a perticuler column of CSV. It should exist on CSV header.
* **type**: This parameter is used to validate the data type under this perticuler column. Currently supports `type: <STRING | NUMBER | EMAIL>`. If not provided or emppty will considered as `STRING`.
* **required**: Default value is `false`. If `true` and cell value is empty under this column then this whole row will considered as invalid. And will not inserted on MongoDB.
* **unique**: Default value is `false`. If `true` this cell value is considerd as unique. Before store it will check if any document is exist or not with this value. If exist the whole existed document will be updated with new values. Otherwist will be inserted as new.
* **saveAs**: This property is used to save `"column"` as `"newColumn"` i.e. `"emailAddr"` as `"email"`. In another word rename the column name. Formate is `"saveAs": "email"`. It is also possible to set user defined value based on condision. **Example:** if `optedIn` cell value is equal to `"true"` then save the value as `"subscription": "SUBSCRIBED"`, if not then `"subscription": "UNSUBSCRIBED"` For this `"saveAs"` paraameter expect an object.
    * **newColumn**: Current column name will be replaced by this parameters value.
    * **conditionValue**: This is a user defined condision.
    * **ifTrue**: If `"conditionValue"` mached then this properties value will be used.
    * **ifFalse**: If `"conditionValue"` doesn't mache then this properties value will be used.
* **size**: This parameter defines the size of the value. Value langth can be fixed or a range. If fix size then the formate is `"size": 7`. If range then `"size"` is an object with two property `"min" | "max"`.
    * **min**: Lower length
    * **max**: Upper length
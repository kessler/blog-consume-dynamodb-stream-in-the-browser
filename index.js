var DDBValue = require('dynamodb-value')
var DynamoDBStream = require('dynamodb-stream')
var aws = require('aws-sdk')
var domReady = require('domready')
var config = require('./config')

aws.config.region = config.region
aws.config.credentials = new aws.CognitoIdentityCredentials({
	IdentityPoolId: config.poolId
})

domReady(function () {
	
	// <-- this is all tha is needed, the rest of the code is just to make the demo complete
	aws.config.credentials.get(function() {
		
		var ddbStream = new DynamoDBStream( new aws.DynamoDBStreams(), config.streamArn)

		setInterval(function () {
			ddbStream.fetchStreamState(function (e) {
				if (e) {
					return console.error('error fetching stream state', e)
				}

				console.log('stream state fetched successfully')
			})
		}, 1000)
		
		ddbStream.on('insert record', insertRecord)
		ddbStream.on('remove record', removeRecord)
	})
	// -->

	var output = document.getElementById('output')
	
	function insertRecord(newRecord) {
		var row = document.createElement('p')
		row.innerHTML = JSON.stringify(newRecord)
		row.setAttribute('data-id', newRecord.id)
		output.appendChild(row)
	}

	function removeRecord(record) {
		var element = document.querySelector('p[data-id="' + record.id + '"]')
		output.removeChild(element)
	}

	// code below pertains to inserting and remove records from dynamodb, 
	// but is not an integral part of the demonstration
	var rows = []
	var dynamodb = new aws.DynamoDB()
	var insertButton = document.getElementById('insertRow')
	var deleteButton = document.getElementById('deleteRow')

	insertButton.addEventListener('click', function () {
		console.log('inserting a record into dynamodb')

		var data = { id: Date.now().toString() }

		rows.push(data)

		dynamodb.putItem({
			TableName: config.ddbTable,
			Item: DDBValue.toDDB(data)
		}, function (err) {
			if (err) {
				alert('error inserting into dynamodb, see console for further details')
				return console.error(err)
			}

			console.log('row inserted')
		})
	})

	deleteButton.addEventListener('click', function () {
		if (rows.length === 0) {
			return alert('please insert some rows first')
		}

		var row = rows.pop()

		dynamodb.deleteItem({
			TableName: config.ddbTable,
			Key: DDBValue.toDDB(row)
		}, function (err) {
			if (err) {
				// return this back if there was an error
				rows.push(row)
				alert('error deleting row, see console for further details')
				return console.error(err)
			}

			console.log('record deleted successfully')
		})
	})
})
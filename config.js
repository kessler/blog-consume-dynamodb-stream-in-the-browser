module.exports = {
	streamArn: 'ddb table stream arn here, stream was tested in Old and New Images',
	poolId: 'cognito pool id - unauthorized role in the pool should have read/write access to the dynamodb table listed below, as well as DescribeStream, GetShardIterator and GetRecords policies',
	ddbTable: 'dynamodb table here, table should be hash only, where the hash field name is "id"',
	region: 'us-east-1'
}
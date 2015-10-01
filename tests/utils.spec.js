import * as utils from '../src/utils';

describe('utils', function() {
    const mockHashKey = {
        name: 'hashKey',
        type: 'S'
    };

    describe('formatSchemaParams', function() {
        const mockSchema = {
            AttributeDefinitions: [
                {
                    AttributeName: 'hashKey',
                    AttributeType: 'S'
                }
            ],
            KeySchema: [
                {
                    AttributeName: 'hashKey',
                    KeyType: 'HASH'
                }
            ]
        };

        it('should return formatted schema', function() {
            const schema = utils.formatSchemaParams([mockHashKey]);

            expect(schema).to.eql(mockSchema);
        });
    });

    describe('createTable', function() {
        const mockParams = {
            TableName: 'testTable',
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            },
            AttributeDefinitions: [
                {
                    AttributeName: 'hashKey',
                    AttributeType: 'S'
                }
            ],
            KeySchema: [
                {
                    AttributeName: 'hashKey',
                    KeyType: 'HASH'
                }
            ]
        };

        const params = utils.createTable('testTable', mockHashKey);

        expect(params).to.eql(mockParams);
    });

    describe('formatToDynamoItems', function() {
        it('should covert a key value pair to DynamoDB item', function() {
            const mockItem = {
                hashkey: 'value',
                rangekey: 123,
                newkey: [123, 456],
                otherkey: ['a', 'b']
            };

            const item = utils.formatToDynamoItems(mockItem);

            expect(item).to.eql({
                hashkey: {
                    'S': 'value'
                }, rangekey: {
                    'N': '123'
                }, newkey: {
                    'NS': ['123', '456']
                }, otherkey: {
                    'SS': ['a', 'b']
                }
            });
        });
    });

    describe('formatToDynamoItem', function() {
        it('should return the dynamo item object when passed a string', function() {
            const mockItem = {
                'S': 'test'
            };

            const item = utils.formatToDynamoItem('test');

            expect(item).to.eql(mockItem);
        });

        it('should return the dynamo item object when passed a number', function() {
            const mockItem = {
                'N': '123'
            };

            const item = utils.formatToDynamoItem(123);

            expect(item).to.eql(mockItem);
        });

        it('should return the dynamo item object when passed an array of numbers', function() {
            const mockItem = {
                'NS': ['123', '456']
            };

            const item = utils.formatToDynamoItem([123, 456]);

            expect(item).to.eql(mockItem);
        });

        it('should return the dynamo item object when passed an array of strings', function() {
            const mockItem = {
                'SS': ['abc', 'def']
            };

            const item = utils.formatToDynamoItem(['abc', 'def']);

            expect(item).to.eql(mockItem);
        });

        it('should throw an error is item is an object', function() {
            function fn() {
                return utils.formatToDynamoItem({
                    test: 'value'
                });
            }

            expect(fn).to.throw(Error);
        });

        it('should throw an error is item is an object', function() {
            function fn() {
                return utils.formatToDynamoItem();
            }

            expect(fn).to.throw(Error);
        });
    });

    describe('conditionBuilder', function() {
        it('should return the condition expression when passed correct params', function() {
            const mockExpression = {
                ConditionExpression: 'attribute_not_exists(hashkey) AND attribute_not_exists(rangekey)'
            };

            const expression = utils.conditionBuilder({
                unique: ['hashkey', 'rangekey']
            });

            expect(expression).to.eql(mockExpression);
        });
    });

    describe('updateItem', function() {
        const mockExpression = {
            ExpressionAttributeNames: {
                '#keyAttribute': 'key'
            },
            ExpressionAttributeValues: {
                ':keyValue': {
                    'S': 'value'
                }
            },
            UpdateExpression: 'SET #keyAttribute = :keyValue'
        };

        const updateExpression = utils.updateItem({
            key: 'value'
        });

        expect(updateExpression).to.eql(mockExpression);
    });

    describe('getItem', function() {
        it('should return correct params', function() {
            const mockParams = {
                KeyConditions: {
                    'hash': {
                        ComparisonOperator: 'EQ',
                        AttributeValueList: [{
                            'S': 'value'
                        }]
                    },
                    'range': {
                        ComparisonOperator: 'EQ',
                        AttributeValueList: [{
                            'S': 'value1'
                        }]
                    }
                }
            };

            params = utils.getItem({
                hash: 'value',
                range: 'value1'
            });

            expect(params).to.eql(mockParams);
        });
    });
});

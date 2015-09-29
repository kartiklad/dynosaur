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
});

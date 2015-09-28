import * as utils from '../src/utils';

describe('formateSchemaParams', function() {
    let mockHashKey = [
        {
            name: 'hashKey',
            type: 'S'
        }
    ];
    let mockSchema = {
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
        let schema = utils.formatSchemaParams(mockHashKey);

        expect(schema).to.eql(mockSchema);
    });
});

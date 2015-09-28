// import _ from 'lodash';
/**
 * @param  {array} keys - Hash and Range keys
 * @returns {object} object - formatted keys object
 */
function formatSchemaParams(keys) {
    let params = {
        AttributeDefinitions: [],
        KeySchema: []
    };

    keys.forEach((key, i) => {
        params.AttributeDefinitions.push({
            AttributeName: key.name,
            AttributeType: key.type
        });
        params.KeySchema.push({
            AttributeName: key.name,
            KeyType: i ? 'RANGE' : 'HASH'
        });
    });

    return params;
}

/**
 * @param  {string} tableName - Table Name
 * @param  {object} hashKey - { name: 'string', type: 'string S | N | B' }
 * @param  {object} rangeKey - Optional { name: 'string', type: 'string S | N | B' }
 * @param  {object} awsParams - (optional) Refer to AWS docs for these configurations
 * @returns {object} Formatted params
 */
function createTable(tableName, hashKey, rangeKey, params = {}) {
    params.TableName = tableName;

    let keys = formatSchemaParams([hashKey, rangeKey]);
    let attributes = params.AttributeDefinitions || [];

    params.AttributeDefinitions = attributes.concat(keys.AttributeDefinitions);
    params.KeySchema = keys.KeySchema;

    params.ProvisionedThroughput = {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
    };

    return params;
}

export default {
    createTable,
    formatSchemaParams
};

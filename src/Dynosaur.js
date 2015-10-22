import Promise from 'bluebird';
import AWS from 'aws-sdk';
import _ from 'lodash';
import utils from './utils';

class Dynosaur {
    /**
     * Initializes AWS DynamoDB sdk
     * @param  {object} credentials - Region must be specified
     * @constructor
     */
    constructor(credentials) {
        if (!credentials) {
            throw new Error('Dynosaur: database connection credentials required');
        }else if (!credentials.region) {
            throw new Error('Dynosaur: region key not set in credentials');
        }

        // Fix API version
        credentials.apiVersion = '2012-08-10';

        this.db = new AWS.DynamoDB(credentials);

        Promise.promisifyAll(this.db);

        // utils
        this.utils = utils;
    }

    /**
     * Returns information about the table, including the current status of the table, when it was created, the primary key schema, and any indexes on the table.
     * @param {string} tableName - DynamoDB table name
     * @returns {promise} Promise
     */
    describe(tableName) {
        if (!tableName) {
            throw new Error('DynoQ: Table name is required');
        }

        const params = {
            TableName: tableName
        };

        return this.db.describeTableAsync(params);
    }

    /**
     * Adds a new Table to DynamoDB
     * @param  {string} tableName - DynamoDB table name
     * @param  {object} hashKey - { name: 'string', type: 'string S | N | B' }
     * @param  {object} rangeKey - Optional { name: 'string', type: 'string S | N | B' }
     * @param  {object} awsParams - (optional) Refer to AWS docs for these configurations
     * @returns {promise} Promise
     */
    createTable(tableName, hashKey, rangeKey, awsParams) {
        if (!tableName) {
            throw new Error('Dynosaur: Table name is required');
        }else if (!hashKey) {
            throw new Error('Dynosaur: Hash key is required');
        }

        const params = this.utils.createTable(tableName, hashKey, rangeKey, awsParams);

        return this.db.createTableAsync(params);
    }

    /**
     * Waits for a given DynamoDB table to Activate.
     * @param  {string} tableName - DynamoDB table name
     * @returns {promise} Promise
     */
    isTableActive(tableName) {
        if (!tableName) {
            throw new Error('Dynosaur: Table name is required');
        }

        const params = {
            TableName: tableName
        };

        return this.db.waitForAsync('tableExists', params)
        .then((data) => {
            let status;

            if (data.Table.TableStatus === 'ACTIVE') {
                status = true;
            } else {
                status = false;
            }

            return status;
        });
    }

    /**
     * Deletes a table and all of its items.
     * @param  {string} tableName - DynamoDB table name
     * @return {promise} Promise
     */
    deleteTable(tableName) {
        if (!tableName) {
            throw new Error('Dynosaur: Table name is required');
        }

        const params = {
            TableName: tableName
        };

        return this.db.deleteTableAsync(params);
    }

    /**
     * Creates a new item, or replaces an old item with a new item. Does not replace old item if condition is passed
     * @param  {string} tableName - DynamoDB table name
     * @param  {object} keys - all columns including hash and range keys
     * @param  {object} condition - (optional) { unique: ['hashkey', 'rangeKey'] }
     * @param  {object} awsParams - (optional) Refer to AWS docs for these configurations
     * @returns {promise} Promise
     */
    insert(tableName, keys, condition, awsParams) {
        if (!tableName) {
            throw new Error('Dynosaur: Table name is required');
        }

        let params = {
            TableName: tableName,
            Item: this.utils.formatToDynamoItems(keys)
        };

        const conditionExpression = this.utils.conditionBuilder(condition);
        if (conditionExpression) {
            params = _.assign(params, conditionExpression);
        }

        if (awsParams) {
            params = _.assign(params, awsParams);
        }

        return this.db.putItemAsync(params);
    }

    /**
     * Edits an existing item's attributes, or adds a new item to the table if it does not already exist.
     * @param  {string} tableName - DynamoDB table name
     * @param  {object} hashRangeKeys - Hash key and optionally range key{ hashKey: value, rangeKey: value}
     * @param  {object} updateKeys - Key value pairs to add/update {key:value,...}
     * @param  {object} awsParams - (optional) Refer to AWS docs for these configurations
     * @returns {promise} Promise
     */
    update(tableName, hashRangeKeys, updateKeys, awsParams) {
        if (!tableName) {
            throw new Error('Dynosaur: Table name is required');
        }
        if (!hashRangeKeys) {
            throw new Error('Dynosaur: Primary keys are required');
        }

        let params = {
            TableName: tableName,
            Key: this.utils.formatToDynamoItems(hashRangeKeys)
        };

        if (updateKeys) {
            params = _.assign(params, this.utils.updateItem(updateKeys));
        }

        if (awsParams) {
            params = _.assign(params, awsParams);
        }

        return this.db.updateItemAsync(params);
    }

    /**
     * Deletes a single item in a table by primary key.
     * @param  {string} tableName - DynamoDB table name
     * @param  {object} hashRangeKeys - Hash key and optionally range key{ hashKey: value, rangeKey: value}
     * @param  {object} awsParams - (optional) Refer to AWS docs for these configurations
     * @return {promise} Promise
     */
    delete(tableName, hashRangeKeys, awsParams) {
        if (!tableName) {
            throw new Error('Dynosaur: Table name is required');
        }
        if (!hashRangeKeys) {
            throw new Error('Dynosaur: Primary keys are required');
        }

        let params = {
            TableName: tableName,
            Key: this.utils.formatToDynamoItems(hashRangeKeys)
        };

        if (awsParams) {
            params = _.assign(params, awsParams);
        }

        return this.db.deleteItemAsync(params);
    }

    /**
     * Returns a set of attributes for the item with the given primary key.
     * @param  {string} tableName - DynamoDB table name
     * @param  {object} hashRangeKeys - Hash key and optionally range key{ hashKey: value, rangeKey: value}
     * @param  {object} awsParams - (optional) { IndexName: 'index_name',... } Refer to AWS docs for these configurations
     * @return {promise} Promise
     */
    get(tableName, hashRangeKeys, awsParams) {
        if (!tableName) {
            throw new Error('Dynosaur: Table name is required');
        }
        if (!hashRangeKeys) {
            throw new Error('Dynosaur: Primary keys are required');
        }

        let params = {
            TableName: tableName
        };

        params = _.assign(params, this.utils.getItem(hashRangeKeys));

        if (awsParams) {
            params = _.assign(params, awsParams);
        }

        return this.db.queryAsync(params).then((data) => {
            let records = null;

            if (data.Items) {
                records = this.utils.formatFromDynamoItems(data.Items);
            }

            return records[0];
        });
    }

    /**
     * Returns one or more items and item attributes by accessing every item in a table or a secondary index.
     * @param  {string} tableName - DynamoDB table name
     * @param  {object} awsParams - Refer to AWS docs for these configurations
     * @return {promise} Promise
     */
    scan(tableName, awsParams) {
        if (!tableName) {
            throw new Error('Dynosaur: Table name is required');
        }

        let params = {
            TableName: tableName
        };

        if (awsParams) {
            params = _.assign(params, awsParams);
        }

        return this.db.scanAsync(params).then((data) => {
            let records = null;

            if (data.Items) {
                records = this.utils.formatFromDynamoItems(data.Items);
            }

            return records;
        });
    }
}

export default Dynosaur;

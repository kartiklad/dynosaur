import Promise from 'bluebird';
import AWS from 'aws-sdk';
import utils from './utils';

class Dynosaur {
    /**
     * @param  {object} credentials - Region must be specified
     * @constructor
     */
    constructor(credentials) {
        if(!credentials) {
            throw new Error('Dynosaur: database connection credentials required');
        }else if(!credentials.region) {
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
     * @param {string} tableName - DynamoDB table name
     * @returns {promise} Promise
     */
    describe(tableName) {
        if(!tableName) {
            throw new Error('DynoQ: Table name is required');
        }

        let params = {
            TableName: tableName
        };

        return this.db.describeTableAsync(params);
    }

    /**
     * @param  {string} tableName - DynamoDB table name
     * @param  {object} hashKey - { name: 'string', type: 'string S | N | B' }
     * @param  {object} rangeKey - Optional { name: 'string', type: 'string S | N | B' }
     * @param  {object} awsParams - (optional) Refer to AWS docs for these configurations
     * @returns {promise} Promise
     */
    createTable(tableName, hashKey, rangeKey, awsParams) {
        if(!tableName) {
            throw new Error('Dynosaur: Table name is required');
        }else if(!hashKey) {
            throw new Error('Dynosaur: Hash key is required');
        }

        let params = this.utils.createTable(tableName, hashKey, rangeKey, awsParams);

        return this.db.createTableAsync(params);
    }
}

export default Dynosaur;

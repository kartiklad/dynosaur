import {Dynosaur} from '../src';

describe('Dynosaur', function() {
    let mockCreds = {
        region: 'ap-southeast-2'
    };

    describe('constructor', () => {
        it('should create an instance of the class with required params', function() {
            let dyno = new Dynosaur(mockCreds);

            expect(dyno).to.be.ok;
        });

        it('should throw an error if credentials are not passed', function() {
            function fn() {
                return new Dynosaur();
            }

            expect(fn).to.throw(Error);
        });

        it('should throw an error if region is not passed', function() {
            function fn() {
                return new Dynosaur({
                    endpoint: 'http://localhost:8000'
                });
            }

            expect(fn).to.throw(Error);
        });
    });

    describe('describe', function() {
        let dyno = null;
        let mockDescribe = sinon.spy();

        before(function() {
            dyno = new Dynosaur(mockCreds);
        });

        it('should throw an error if table name is not passed', function() {
            function fn() {
                return dyno.describe();
            }

            expect(fn).to.throw(Error);
        });

        it('should call describeAsync with the correct params', function() {
            dyno.db.describeTableAsync = mockDescribe;

            dyno.describe('mockTable');

            expect(mockDescribe).to.be.calledWith({
                TableName: 'mockTable'
            });
        });
    });

    describe('create', function() {
        let mockParams = {
            TableName: 'test',
            AttributeDefinitions: [
                {
                    AttributeName: 'hash',
                    AttributeType: 'S'
                },
                {
                    AttributeName: 'range',
                    AttributeType: 'N'
                }
            ],
            KeySchema: [
                {
                    AttributeName: 'hash',
                    KeyType: 'HASH'
                },
                {
                    AttributeName: 'range',
                    KeyType: 'RANGE'
                }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            }
        };

        it('should call createTableAsync with correct params', function() {
            let dyno = new Dynosaur(mockCreds);
            dyno.db.createTableAsync = sinon.spy();

            dyno.createTable(
                'test',
                {
                    name: 'hash',
                    type: 'S'
                },
                {
                    name: 'range',
                    type: 'N'
                }
            );

            expect(dyno.db.createTableAsync).to.be.calledWith(mockParams);
        });
    });
});

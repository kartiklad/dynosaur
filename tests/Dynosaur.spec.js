import {Dynosaur} from '../src';

describe('Dynosaur', function() {
    const mockCreds = {
        region: 'ap-southeast-2'
    };

    describe('constructor', () => {
        it('should create an instance of the class with required params', function() {
            const dyno = new Dynosaur(mockCreds);

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
        const mockDescribe = sinon.spy();

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
        const mockParams = {
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
            const dyno = new Dynosaur(mockCreds);
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

        it('should throw an error if table name is not passed', function() {
            function fn() {
                return dyno.createTable();
            }

            expect(fn).to.throw(Error);
        });

        it('should throw an error if hashkey is not passed', function() {
            function fn() {
                return dyno.createTable('test');
            }

            expect(fn).to.throw(Error);
        });
    });

    describe('deleteTable', function() {
        const dyno = new Dynosaur(mockCreds);
        const mockDelte = sinon.spy();

        it('should throw an error if table name is not passed', function() {
            function fn() {
                return dyno.deleteTable();
            }

            expect(fn).to.throw(Error);
        });

        it('should call deleteTableAsync with the correct params', function() {
            dyno.db.deleteTableAsync = mockDelte;

            dyno.deleteTable('mockTable');

            expect(mockDelte).to.be.calledWith({
                TableName: 'mockTable'
            });
        });
    });

    describe('insert', function() {
        const dyno = new Dynosaur(mockCreds);

        it('should throw and error if table name is not passed', function() {
            function fn() {
                return dyno.insert();
            }

            expect(fn).to.throw(Error);
        });

        it('should call putItemAsync with the correct params', function() {
            const mockPut = sinon.spy();
            const mockParams = {
                TableName: 'test',
                Item: {
                    hash: {
                        'S': 'value'
                    },
                    range: {
                        'S': 'value'
                    }
                },
                ConditionExpression: 'attribute_not_exists(hash) AND attribute_not_exists(range)'
            };

            dyno.db.putItemAsync = mockPut;

            dyno.insert('test', {
                hash: 'value',
                range: 'value'
            }, {
                unique: ['hash', 'range']
            });

            expect(mockPut).to.be.calledWith(mockParams);
        });
    });

    describe('update', function() {
        const dyno = new Dynosaur(mockCreds);

        it('should throw and error if table name is not passed', function() {
            function fn() {
                return dyno.update();
            }

            expect(fn).to.throw(Error);
        });

        it('should throw and error if primary keys are not passed', function() {
            function fn() {
                return dyno.update('test');
            }

            expect(fn).to.throw(Error);
        });

        it('should call updateItemAsync with the correct params', function() {
            const mockUpdate = sinon.spy();
            const mockParams = {
                TableName: 'test',
                Key: {
                    hash: {
                        'S': 'value'
                    },
                    range: {
                        'S': 'value'
                    }
                },
                ExpressionAttributeNames: {
                    '#newKeyAttribute': 'newKey'
                },
                ExpressionAttributeValues: {
                    ':newKeyValue': {
                        'S': 'somevalue'
                    }
                },
                UpdateExpression: 'SET #newKeyAttribute = :newKeyValue'
            };

            dyno.db.updateItemAsync = mockUpdate;

            dyno.update('test', {
                hash: 'value',
                range: 'value'
            }, {
                newKey: 'somevalue'
            });

            expect(mockUpdate).to.be.calledWith(mockParams);
        });
    });

    describe('delete', function() {
        const dyno = new Dynosaur(mockCreds);

        it('should throw and error if table name is not passed', function() {
            function fn() {
                return dyno.delete();
            }

            expect(fn).to.throw(Error);
        });

        it('should throw and error if primary keys are not passed', function() {
            function fn() {
                return dyno.delete('test');
            }

            expect(fn).to.throw(Error);
        });

        it('should call deleteItemAsync with the correct params', function() {
            const mockDelete = sinon.spy();
            const mockParams = {
                TableName: 'test',
                Key: {
                    hash: {
                        'S': 'value'
                    },
                    range: {
                        'S': 'value'
                    }
                }
            };

            dyno.db.deleteItemAsync = mockDelete;

            dyno.delete('test', {
                hash: 'value',
                range: 'value'
            });

            expect(mockDelete).to.be.calledWith(mockParams);
        });
    });
});

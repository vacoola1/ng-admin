'use strict';

const doc = require('dynamodb-doc');
const Q = require('q');
const dynamo = new doc.DynamoDB();

const configClass = require('config');

class member {
    constructor(event) {
        this.config = new configClass(event).getConfig();
        this.table = 'member' + this.config.db.tableEnv;
    }

    get(id) {
        const deferred = Q.defer();

        let params = {
            Key: {
                "id": {
                    N: id
                }
            },
            TableName: this.table
        };

        dynamo.getItem(params, (err, data) => {
            if ( err ) {
                return deferred.reject( err );
            }
            deferred.resolve( data );
        });
    }

    getAll() {
        const deferred = Q.defer();
        dynamo.scan({ TableName: this.table }, (err, data) => {
            if ( err ) {
                return deferred.reject( err );
            }
            deferred.resolve( data );
        });
        return deferred
    }

    create(entity) {
        const deferred = Q.defer();

        entity.id = "";
        let params = {
            Item: entity,
            TableName: this.table,
            ReturnValues: "UPDATED_NEW"
        };

        dynamo.putItem(params, (err, data) => {
            if ( err ) {
                return deferred.reject( err );
            }
            deferred.resolve( data );
        });

        return deferred
    }

    update(entity) {
        const deferred = Q.defer();

        entity.id = "";
        let params = {
            Item: entity,
            TableName: this.table,
            ReturnValues: "UPDATED_NEW"
        };

        dynamo.updateItem(params, (err, data) => {
            if ( err ) {
                return deferred.reject( err );
            }
            deferred.resolve( data );
        });

        return deferred
    }

    remove(id) {
        const deferred = Q.defer();

        let params = {
            Key: {
                "id": {
                    N: id
                }
            },
            TableName: this.table
        };

        dynamo.deleteItem(params, (err, data) => {
            if ( err ) {
                return deferred.reject( err );
            }
            deferred.resolve( data );
        });

        return deferred
    }
}

module.exports = member;



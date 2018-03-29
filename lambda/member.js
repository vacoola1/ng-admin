'use strict';

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB();

const configClass = require('config');

class member {
    constructor(event) {
        this.config = new configClass(event).getConfig();
        this.table = 'member' + this.config.db.tableEnv;
    }

    get(id) {
        let params = {
            Key: {
                "id": {
                    S: id
                }
            },
            TableName: this.table
        };
        return dynamo.getItem(params).promise()
            .then( data => {
                return data.Items
            });
    }

    getAll() {
        return dynamo.scan({ TableName: this.table } ).promise()
            .then( data => {
                return data.Items
            });
    }

    create(entity) {
        entity.id = "";
        let params = {
            Item: entity,
            TableName: this.table,
            ReturnValues: "UPDATED_NEW"
        };
        return dynamo.putItem(params).promise()
            .then( data => {
                return data.Items
            });
    }

    update(entity) {
        let params = {
            Item: entity,
            TableName: this.table,
            ReturnValues: "UPDATED_NEW"
        };
        return dynamo.updateItem(params).promise()
            .then( data => {
                return data.Items
            });
    }

    remove(id) {
        let params = {
            Key: {
                "id": {
                    S: id
                }
            },
            TableName: this.table
        };
        return dynamo.deleteItem(params).promise()
            .then( data => {
                return data.Items
            });
    }
}

module.exports = member;



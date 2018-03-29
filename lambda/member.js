'use strict';

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

const uuidv1 = require('uuid/v1');

const configClass = require('config');

class member {

    constructor(event) {
        this.config = new configClass(event).getConfig();
        this.table = 'member' + this.config.db.tableEnv;
    }

    get(id) {
        let params = {
            Key: {
                "id": id
            },
            TableName: this.table
        };
        return dynamo.get(params).promise()
            .then( data => {
                if (data.Item) {
                    return data.Item
                } else {
                    throw new Error(`There is no member with id = "${id}"`)
                }
            });
    }

    getAll() {
        return dynamo.scan({ TableName: this.table } ).promise()
            .then( data => {
                return data.Items
            });
    }

    create(entity) {
        let newId = uuidv1();
        entity.id = newId;
        let params = {
            Item: entity,
            TableName: this.table
        };
        return dynamo.put(params).promise()
            .then( () => this.get(newId) );
    }

    update(entity) {
        let params = {
            Item: entity,
            TableName: this.table
        };
        return this.get(entity.id).then( () => {
            return dynamo.put(params).promise()
                .then( () => this.get(entity.id) )
        });
    }

    remove(id) {
        let params = {
            Key: {
                "id": id
            },
            TableName: this.table
        };
        return this.get(id)
            .then( dynamo.delete(params).promise() )
            .then( dynamo.get(params).promise() )
            .then( data => {
                if (data.Item) {
                    throw new Error(`Мember with id = "${id} was not deleted"`)
                } else {
                    return {}
                }
            })
    }
}

module.exports = member;



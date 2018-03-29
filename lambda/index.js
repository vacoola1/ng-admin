'use strict';

console.log('Loading function');

const memberClass = require('member');


/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
exports.handler = (event, context, callback) => {

    console.log('Received event:', JSON.stringify(event, null, 2));

    const getEntityService = event => {
        if ( event.resource.includes('/member') ) {
            return new memberClass(event);
        }
    };

    const getHandler = event => {

        const entityService = getEntityService(event);

        if (! entityService) {
            return undefined
        }

        if ( event.httpMethod === 'GET' && event.pathParameters && event.pathParameters.id) {
            return () => {
                return entityService.get(event.pathParameters.id);
            };
        } else if ( event.httpMethod === 'GET') {
            return () => {
                return entityService.getAll();
            };
        } else if ( event.httpMethod === 'POST' && event.body) {
            return () => {
                return entityService.create(JSON.parse(event.body));
            };
        } else if ( event.httpMethod === 'PUT' && event.body) {
            return () => {
                return entityService.update(JSON.parse(event.body));
            };
        } else if ( event.httpMethod === 'DELETE' && event.pathParameters && event.pathParameters.id) {
            return () => {
                return entityService.remove(event.pathParameters.id);
            };
        } else {
            return undefined
        }
    };

    const sendData = data => callback(null, {
        statusCode: '200',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        }
    });

    const sendError = err => callback(null, {
        statusCode: '400',
        body: err.message,
        headers: {
            'Content-Type': 'application/json',
        }
    });

    const entityHandler = getHandler(event);

    if (entityHandler) {
        entityHandler()
            .then( data => sendData(data))
            .catch( err => {
                console.error(err);
                sendError(err)
            });
    } else {
        const err = new Error(`Unsupported request "${JSON.stringify(event)}"`);
        console.error(err);
        sendError(err)
    }

};

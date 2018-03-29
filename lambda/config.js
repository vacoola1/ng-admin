'use strict';

class config {
    constructor(event) {
        this.stage = event.requestContext.stage;
    }

    getConfig() {
        if (this.stage === 'prod') {
            return {
                environment: 'prod',
                db: {
                    tableEnv: '-prod',
                }
            };
        }
        // event.requestContext.stage
        if (this.stage === 'test-invoke-stage') {
            return {
                env: 'test',
                db: {
                    tableEnv: '-test',
                }
            };
        }
    };
}

module.exports = config;
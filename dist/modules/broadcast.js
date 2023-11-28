"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcast = void 0;
const heat_server_common_1 = require("heat-server-common");
const lodash_1 = require("lodash");
async function broadcast(context, param) {
    try {
        const { req, protocol, host, logger } = context;
        const { transactionHex } = param;
        const url = `${protocol}://${host}/api/v1/tx/broadcast`;
        const json = await req.post(url, { form: { transactionBytes: transactionHex } }, [200]);
        const data = (0, heat_server_common_1.tryParse)(json, logger);
        if ((0, lodash_1.isObjectLike)(data) && (0, lodash_1.isString)(data.transaction)) {
            return {
                value: {
                    transactionId: data.transaction,
                },
            };
        }
        else {
            let errorMessage;
            if ((0, lodash_1.isObjectLike)(data) &&
                (0, lodash_1.isObjectLike)(data.error) &&
                (0, lodash_1.isString)(data.error.message)) {
                errorMessage = data.error.message;
            }
            else if ((0, lodash_1.isString)(data.errorDescription)) {
                errorMessage = data.errorDescription;
            }
            else if ((0, lodash_1.isNumber)(data.errorCode)) {
                errorMessage = `Error code ${data.errorCode}`;
            }
            else {
                errorMessage = `Unregognized response: ${JSON.stringify(data)}`;
            }
            return {
                value: {
                    errorMessage,
                },
            };
        }
    }
    catch (e) {
        return {
            error: e.message,
        };
    }
}
exports.broadcast = broadcast;
//# sourceMappingURL=broadcast.js.map
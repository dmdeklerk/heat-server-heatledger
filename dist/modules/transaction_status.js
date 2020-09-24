"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionStatus = void 0;
const heat_server_common_1 = require("heat-server-common");
const lodash_1 = require("lodash");
async function transactionStatus(context, param) {
    try {
        const { req, protocol, host, logger } = context;
        const { addrXpub, transactionId } = param;
        const url = `${protocol}://${host}/api/v1/blockchain/transaction/${transactionId}`;
        const json = await req.get(url);
        const transaction = heat_server_common_1.tryParse(json, logger);
        if (lodash_1.isNumber(transaction.confirmations)) {
            return {
                value: {
                    isAccepted: true,
                    confirmations: transaction.confirmations,
                },
            };
        }
        const url2 = `${protocol}://${host}/api/v1/blockchain/unconfirmed/${addrXpub}/0`;
        const json2 = await req.get(url2);
        const unconfirmedTransactions = heat_server_common_1.tryParse(json2, logger);
        if (!Array.isArray(unconfirmedTransactions)) {
            return {
                value: {
                    isAccepted: false,
                    confirmations: 0,
                },
            };
        }
        const isAccepted = !!unconfirmedTransactions.find(txn => txn.transaction == transactionId);
        return {
            value: {
                isAccepted,
                confirmations: 0,
            },
        };
    }
    catch (e) {
        return {
            error: e.message,
        };
    }
}
exports.transactionStatus = transactionStatus;
//# sourceMappingURL=transaction_status.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressExistsLookup = void 0;
const heat_server_common_1 = require("heat-server-common");
const lodash_1 = require("lodash");
async function addressExistsLookup(context, param) {
    try {
        const { req, protocol, host, logger } = context;
        const { blockchain, addrXpub } = param;
        const url = `${protocol}://${host}/api/v1/blockchain/transactions/account/count/${addrXpub}`;
        const json = await req.get(url);
        const data = (0, heat_server_common_1.tryParse)(json, logger);
        if ((0, lodash_1.isNumber)(data.count)) {
            return {
                value: {
                    exists: data.count > 0
                },
            };
        }
        else {
            return {
                error: `Unregognized response: ${JSON.stringify(data)}`
            };
        }
    }
    catch (e) {
        return {
            error: e.message,
        };
    }
}
exports.addressExistsLookup = addressExistsLookup;
//# sourceMappingURL=address_exists_lookup.js.map
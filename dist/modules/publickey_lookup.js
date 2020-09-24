"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicKeyLookup = void 0;
const heat_server_common_1 = require("heat-server-common");
const lodash_1 = require("lodash");
async function publicKeyLookup(context, param) {
    try {
        const { req, protocol, host, logger } = context;
        const { addrXpub } = param;
        const url = `${protocol}://${host}/api/v1/account/publickey/${addrXpub}`;
        const json = await req.get(url);
        const data = heat_server_common_1.tryParse(json, logger);
        if (lodash_1.isString(data.value)) {
            return {
                value: {
                    publicKey: data.value,
                },
            };
        }
        else {
            logger.warn(`No public key for ${addrXpub} ${heat_server_common_1.prettyPrint(data)}`);
            return {
                value: {
                    publicKey: null,
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
exports.publicKeyLookup = publicKeyLookup;
//# sourceMappingURL=publickey_lookup.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseResolveAlias = void 0;
const heat_server_common_1 = require("heat-server-common");
const lodash_1 = require("lodash");
async function reverseResolveAlias(context, param) {
    try {
        const { req, protocol, host, logger } = context;
        const { addrXpub } = param;
        const url = `${protocol}://${host}/api/v1/account/find/${addrXpub}`;
        const json = await req.get(url);
        const data = (0, heat_server_common_1.tryParse)(json, logger);
        if (data && (0, lodash_1.isString)(data.publicName) && !(0, lodash_1.isEmpty)(data.publicName)) {
            return {
                value: {
                    alias: data.publicName,
                    isPermanent: true,
                },
            };
        }
        return {
            value: {
                alias: null,
                isPermanent: false,
            },
        };
    }
    catch (e) {
        return {
            error: e.message,
        };
    }
}
exports.reverseResolveAlias = reverseResolveAlias;
//# sourceMappingURL=reverse_resolve_alias.js.map
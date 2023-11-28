"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAlias = void 0;
const heat_server_common_1 = require("heat-server-common");
const lodash_1 = require("lodash");
async function resolveAlias(context, param) {
    try {
        const { req, protocol, host, logger } = context;
        const { alias } = param;
        const alias_ = encodeURIComponent(alias);
        const url = `${protocol}://${host}/api/v1/account/find/name/${alias_}`;
        const json = await req.get(url);
        const data = (0, heat_server_common_1.tryParse)(json, logger);
        if (data && (0, lodash_1.isString)(data.id) && !(0, lodash_1.isEmpty)(data.id)) {
            return {
                value: {
                    addrXpub: data.id,
                    isPermanent: true,
                },
            };
        }
        return {
            value: {
                addrXpub: null,
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
exports.resolveAlias = resolveAlias;
//# sourceMappingURL=resolve_alias.js.map
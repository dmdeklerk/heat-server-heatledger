"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenDiscovery = void 0;
const heat_server_common_1 = require("heat-server-common");
const lodash_1 = require("lodash");
async function tokenDiscovery(context, param) {
    try {
        const { req, protocol, host, logger } = context;
        const { addrXpub, assetType } = param;
        const url = `${protocol}://${host}/api/v1/account/balances/${addrXpub}/0/1/0/100`;
        const json = await req.get(url);
        const data = heat_server_common_1.tryParse(json, logger);
        const value = [];
        if (lodash_1.isArray(data)) {
            data.forEach(d => {
                if (d.id == '0') {
                    value.push({
                        assetId: '0',
                        assetType: heat_server_common_1.AssetTypes.NATIVE,
                        value: d.unconfirmedBalance || '0',
                        exists: true,
                    });
                }
                else {
                    value.push({
                        assetId: d.id,
                        assetType: heat_server_common_1.AssetTypes.TOKEN_TYPE_1,
                        value: d.unconfirmedBalance || '0',
                        exists: true,
                    });
                }
            });
        }
        else {
            value.push({
                assetId: '0',
                assetType: heat_server_common_1.AssetTypes.NATIVE,
                value: '0',
                exists: false,
            });
        }
        return {
            value,
        };
    }
    catch (e) {
        return {
            error: e.message,
        };
    }
}
exports.tokenDiscovery = tokenDiscovery;
//# sourceMappingURL=token_discovery.js.map
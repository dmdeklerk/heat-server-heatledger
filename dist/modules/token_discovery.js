"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenDiscovery = void 0;
const heat_server_common_1 = require("heat-server-common");
const lodash_1 = require("lodash");
class TokenDiscoveryResultEx {
    constructor(parentResult) {
        this.assetId = parentResult.assetId;
        this.assetType = parentResult.assetType;
        this.value = parentResult.value;
        this.exists = parentResult.exists;
    }
}
function nativeHeatDetails() {
    return {
        contract: '0',
        decimals: 8,
        name: 'Heat',
        symbol: 'HEAT',
    };
}
function assetHeatDetails(resp) {
    const [symbol, name] = (0, heat_server_common_1.tryParse)(resp.properties) || ['*', '*'];
    return {
        contract: resp.id,
        decimals: resp.decimals,
        name,
        symbol,
    };
}
async function tokenDiscovery(context, param) {
    try {
        const { req, protocol, host, logger } = context;
        const { addrXpub, assetType } = param;
        const url = `${protocol}://${host}/api/v1/account/balances/${addrXpub}/0/1/0/100`;
        const json = await req.get(url);
        const data = (0, heat_server_common_1.tryParse)(json, logger);
        const value = [];
        if ((0, lodash_1.isArray)(data)) {
            data.forEach(d => {
                if (d.id == '0') {
                    value.push({
                        assetId: '0',
                        assetType: heat_server_common_1.AssetTypes.NATIVE,
                        value: d.unconfirmedBalance || '0',
                        exists: true,
                        details: nativeHeatDetails()
                    });
                }
                else {
                    value.push({
                        assetId: d.id,
                        assetType: heat_server_common_1.AssetTypes.TOKEN_TYPE_1,
                        value: d.unconfirmedBalance || '0',
                        exists: true,
                        details: assetHeatDetails(d)
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
                details: nativeHeatDetails()
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
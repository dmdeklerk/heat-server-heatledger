"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Explorer = void 0;
const heat_server_common_1 = require("heat-server-common");
const balance_lookup_1 = require("./modules/balance_lookup");
const event_lookup_1 = require("./modules/event_lookup");
const network_status_1 = require("./modules/network_status");
const publickey_lookup_1 = require("./modules/publickey_lookup");
const resolve_alias_1 = require("./modules/resolve_alias");
const reverse_resolve_alias_1 = require("./modules/reverse_resolve_alias");
const token_discovery_1 = require("./modules/token_discovery");
const transaction_status_1 = require("./modules/transaction_status");
const broadcast_1 = require("./modules/broadcast");
const custom_heat_account_1 = require("./modules/custom_heat_account");
const address_exists_lookup_1 = require("./modules/address_exists_lookup");
const ID = "heat";
const modules = {
    balanceLookup: balance_lookup_1.balanceLookup,
    eventLookup: event_lookup_1.eventLookup,
    broadcast: broadcast_1.broadcast,
    networkStatus: network_status_1.networkStatus,
    publicKeyLookup: publickey_lookup_1.publicKeyLookup,
    resolveAlias: resolve_alias_1.resolveAlias,
    reverseResolveAlias: reverse_resolve_alias_1.reverseResolveAlias,
    tokenDiscovery: token_discovery_1.tokenDiscovery,
    transactionStatus: transaction_status_1.transactionStatus,
    customHeatAccount: custom_heat_account_1.customHeatAccount,
    addressExistsLookup: address_exists_lookup_1.addressExistsLookup,
};
class Explorer extends heat_server_common_1.ExplorerBase {
    constructor(protocol, host, rateLimiter, apiKey, middleWare) {
        super(ID, protocol, host, modules, middleWare);
        this.host = host;
        this.rateLimiter = rateLimiter;
    }
}
exports.Explorer = Explorer;
//# sourceMappingURL=explorer.js.map
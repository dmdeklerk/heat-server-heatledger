"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.networkStatus = void 0;
const heat_server_common_1 = require("heat-server-common");
async function networkStatus(context, param) {
    try {
        const { req, protocol, host, logger } = context;
        const url = `${protocol}://${host}/api/v1/blockchain/status`;
        const json = await req.get(url);
        const data = (0, heat_server_common_1.tryParse)(json, logger);
        const lastBlockTime = new Date(Date.UTC(2013, 10, 24, 12, 0, 0, 0) + data.lastBlockTimestamp * 1000);
        const lastBlockHeight = data.numberOfBlocks;
        const lastBlockId = data.lastBlock;
        return {
            value: {
                lastBlockTime,
                lastBlockHeight,
                lastBlockId,
            },
        };
    }
    catch (e) {
        return {
            error: e.message,
        };
    }
}
exports.networkStatus = networkStatus;
//# sourceMappingURL=network_status.js.map
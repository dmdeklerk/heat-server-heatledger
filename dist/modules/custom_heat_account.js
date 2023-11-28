"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customHeatAccount = void 0;
const heat_server_common_1 = require("heat-server-common");
const lodash_1 = require("lodash");
async function customHeatAccount(context, param) {
    try {
        const { req, protocol, host, logger } = context;
        const { addrXpub } = param;
        const url = `${protocol}://${host}/api/v1/account/find/${addrXpub}`;
        const json = await req.get(url);
        const data = (0, heat_server_common_1.tryParse)(json, logger);
        if (data && (0, lodash_1.isString)(data.id)) {
            return {
                value: {
                    id: data.id,
                    publicKey: data.publicKey,
                    unconfirmedBalance: data.unconfirmedBalance,
                    effectiveBalance: data.effectiveBalance,
                    currentLessee: data.currentLessee,
                    currentLesseeName: data.currentLesseeName,
                    currentLeasingHeightFrom: data.currentLeasingHeightFrom,
                    currentLeasingHeightTo: data.currentLeasingHeightTo,
                    nextLessee: data.nextLessee,
                    nextLesseeName: data.nextLesseeName,
                    nextLeasingHeightFrom: data.nextLeasingHeightFrom,
                    nextLeasingHeightTo: data.nextLeasingHeightTo,
                },
            };
        }
        else {
            this.logger.warn(`No custom heat account data for ${addrXpub} ${(0, heat_server_common_1.prettyPrint)(data)}`);
            return {
                value: {
                    id: null,
                    publicKey: null,
                    unconfirmedBalance: null,
                    effectiveBalance: null,
                    currentLessee: null,
                    currentLesseeName: null,
                    currentLeasingHeightFrom: null,
                    currentLeasingHeightTo: null,
                    nextLessee: null,
                    nextLesseeName: null,
                    nextLeasingHeightFrom: null,
                    nextLeasingHeightTo: null,
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
exports.customHeatAccount = customHeatAccount;
//# sourceMappingURL=custom_heat_account.js.map
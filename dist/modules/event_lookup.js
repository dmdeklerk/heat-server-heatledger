"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventLookup = void 0;
const heat_server_common_1 = require("heat-server-common");
const TYPE_PAYMENT = 0;
const TYPE_MESSAGING = 1;
const TYPE_COLORED_COINS = 2;
const TYPE_ACCOUNT_CONTROL = 4;
const SUBTYPE_PAYMENT_ORDINARY_PAYMENT = 0;
const SUBTYPE_MESSAGING_ARBITRARY_MESSAGE = 0;
const SUBTYPE_COLORED_COINS_ASSET_ISSUANCE = 0;
const SUBTYPE_COLORED_COINS_ASSET_ISSUE_MORE = 1;
const SUBTYPE_COLORED_COINS_ASSET_TRANSFER = 2;
const SUBTYPE_COLORED_COINS_ASK_ORDER_PLACEMENT = 3;
const SUBTYPE_COLORED_COINS_BID_ORDER_PLACEMENT = 4;
const SUBTYPE_COLORED_COINS_ASK_ORDER_CANCELLATION = 5;
const SUBTYPE_COLORED_COINS_BID_ORDER_CANCELLATION = 6;
const SUBTYPE_COLORED_COINS_WHITELIST_ACCOUNT_ADDITION = 7;
const SUBTYPE_COLORED_COINS_WHITELIST_ACCOUNT_REMOVAL = 8;
const SUBTYPE_COLORED_COINS_WHITELIST_MARKET = 9;
const SUBTYPE_COLORED_COINS_ATOMIC_MULTI_TRANSFER = 10;
const SUBTYPE_ACCOUNT_CONTROL_EFFECTIVE_BALANCE_LEASING = 0;
const SUBTYPE_ACCOUNT_CONTROL_INTERNET_ADDRESS = 1;
async function eventLookup(context, param) {
    try {
        const { req, protocol, host, logger } = context;
        const { blockchain, assetType, assetId, addrXpub, from, to, minimal } = param;
        const url = `${protocol}://${host}/api/v1/blockchain/transactions/account/${addrXpub}/${from}/${to}`;
        const json = await req.get(url);
        const data = (0, heat_server_common_1.tryParse)(json, logger);
        let value;
        if (minimal) {
            value = data.map((x) => x.transaction);
        }
        else {
            value = [];
            for (let i = 0; i < data.length; i++) {
                let txData = data[i];
                let events = getEventsFromTransaction(txData, addrXpub);
                events.forEach((event) => {
                    event.data = (0, heat_server_common_1.createEventData)(event);
                });
                let date = new Date(Date.UTC(2013, 10, 24, 12, 0, 0, 0) + txData.timestamp * 1000);
                value.push({
                    timestamp: date.getTime(),
                    sourceId: txData.transaction,
                    sourceType: heat_server_common_1.SourceTypes.TRANSACTION,
                    confirmations: txData.confirmations,
                    events,
                });
            }
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
exports.eventLookup = eventLookup;
function getEventsFromTransaction(txData, _addrXpub) {
    try {
        const isIncoming = txData.recipient == _addrXpub;
        const addrXpub = isIncoming ? txData.sender : txData.recipient;
        const publicKey = isIncoming
            ? txData.senderPublicKey
            : txData.recipientPublicKey;
        const alias = isIncoming
            ? txData.senderPublicName
            : txData.recipientPublicName;
        const events = [];
        switch (txData.type) {
            case TYPE_PAYMENT:
                if (txData.subtype == SUBTYPE_PAYMENT_ORDINARY_PAYMENT) {
                    events.push(isIncoming
                        ? (0, heat_server_common_1.buildEventReceive)({ addrXpub, publicKey, alias }, heat_server_common_1.AssetTypes.NATIVE, "0", txData.amount, 0)
                        : (0, heat_server_common_1.buildEventSend)({ addrXpub, publicKey, alias }, heat_server_common_1.AssetTypes.NATIVE, "0", txData.amount, 0));
                }
                break;
            case TYPE_COLORED_COINS:
                switch (txData.subtype) {
                    case SUBTYPE_COLORED_COINS_ASSET_ISSUANCE:
                    case SUBTYPE_COLORED_COINS_ASSET_ISSUE_MORE:
                        break;
                    case SUBTYPE_COLORED_COINS_ASSET_TRANSFER: {
                        let { asset, quantity } = txData.attachment;
                        events.push(isIncoming
                            ? (0, heat_server_common_1.buildEventReceive)({ addrXpub, publicKey, alias }, heat_server_common_1.AssetTypes.TOKEN_TYPE_1, asset, quantity, 0)
                            : (0, heat_server_common_1.buildEventSend)({ addrXpub, publicKey, alias }, heat_server_common_1.AssetTypes.TOKEN_TYPE_1, asset, quantity, 0));
                        break;
                    }
                    case SUBTYPE_COLORED_COINS_ASK_ORDER_PLACEMENT:
                    case SUBTYPE_COLORED_COINS_BID_ORDER_PLACEMENT: {
                        const isAsk = txData.subtype == SUBTYPE_COLORED_COINS_ASK_ORDER_PLACEMENT;
                        let { asset, quantity, price, currency } = txData.attachment;
                        const assetType = asset == "0" ? heat_server_common_1.AssetTypes.NATIVE : heat_server_common_1.AssetTypes.TOKEN_TYPE_1;
                        const currencyType = currency == "0" ? heat_server_common_1.AssetTypes.NATIVE : heat_server_common_1.AssetTypes.TOKEN_TYPE_1;
                        events.push(isAsk
                            ? (0, heat_server_common_1.buildEventSellOrder)(assetType, asset, currencyType, currency, quantity, price)
                            : (0, heat_server_common_1.buildEventBuyOrder)(assetType, asset, currencyType, currency, quantity, price));
                        break;
                    }
                    case SUBTYPE_COLORED_COINS_ASK_ORDER_CANCELLATION:
                    case SUBTYPE_COLORED_COINS_BID_ORDER_CANCELLATION:
                        const isAsk = txData.subtype == SUBTYPE_COLORED_COINS_ASK_ORDER_CANCELLATION;
                        const { cancelledOrderAsset, cancelledOrderQuantity, cancelledOrderPrice, cancelledOrderCurrency, } = txData.attachment;
                        const assetType = cancelledOrderAsset == "0"
                            ? heat_server_common_1.AssetTypes.NATIVE
                            : heat_server_common_1.AssetTypes.TOKEN_TYPE_1;
                        const currencyType = cancelledOrderCurrency == "0"
                            ? heat_server_common_1.AssetTypes.NATIVE
                            : heat_server_common_1.AssetTypes.TOKEN_TYPE_1;
                        events.push(isAsk
                            ? (0, heat_server_common_1.buildEventCancelSell)(assetType, cancelledOrderAsset, currencyType, cancelledOrderCurrency, cancelledOrderQuantity, cancelledOrderPrice)
                            : (0, heat_server_common_1.buildEventCancelBuy)(assetType, cancelledOrderAsset, currencyType, cancelledOrderCurrency, cancelledOrderQuantity, cancelledOrderPrice));
                        break;
                    case SUBTYPE_COLORED_COINS_ATOMIC_MULTI_TRANSFER: {
                        break;
                    }
                    case SUBTYPE_COLORED_COINS_WHITELIST_ACCOUNT_ADDITION:
                    case SUBTYPE_COLORED_COINS_WHITELIST_ACCOUNT_REMOVAL:
                    case SUBTYPE_COLORED_COINS_WHITELIST_MARKET:
                        break;
                }
                break;
            case TYPE_ACCOUNT_CONTROL:
                switch (txData.subtype) {
                    case SUBTYPE_ACCOUNT_CONTROL_EFFECTIVE_BALANCE_LEASING:
                        const { period } = txData.attachment;
                        events.push((0, heat_server_common_1.buildEventLeaseBalance)({ addrXpub, publicKey, alias }, period));
                        break;
                    case SUBTYPE_ACCOUNT_CONTROL_INTERNET_ADDRESS:
                        break;
                }
                break;
        }
        if (!isIncoming) {
            events.push((0, heat_server_common_1.buildEventFee)(txData.fee));
        }
        return events;
    }
    catch (e) {
        this.logger.error(e);
        throw e;
    }
}
//# sourceMappingURL=event_lookup.js.map
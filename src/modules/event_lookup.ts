import {
  EventLookupParam,
  EventLookupResult,
  EventLookupEvent,
  tryParse,
  SourceTypes,
  CallContext,
  ModuleResponse,
  createEventData,
  buildEventReceive,
  AssetTypes,
  buildEventSend,
  buildEventSellOrder,
  buildEventBuyOrder,
  buildEventCancelSell,
  buildEventCancelBuy,
  buildEventLeaseBalance,
  buildEventFee,
} from "heat-server-common";

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

export async function eventLookup(
  context: CallContext,
  param: EventLookupParam
): Promise<ModuleResponse<Array<EventLookupResult>>> {
  try {
    const { req, protocol, host, logger } = context;
    const { blockchain, assetType, assetId, addrXpub, from, to, minimal } =
      param;
    const url = `${protocol}://${host}/api/v1/blockchain/transactions/account/${addrXpub}/${from}/${to}`;
    const json = await req.get(url);
    const data = tryParse(json, logger);
    let value;
    // Go after minimal result
    if (minimal) {
      value = data.map((x) => x.transaction);
    }
    // Go after FULL result
    else {
      value = [];
      for (let i = 0; i < data.length; i++) {
        let txData = data[i];
        let events = getEventsFromTransaction(txData, addrXpub);
        events.forEach((event) => {
          event.data = createEventData(event);
        });
        let date = new Date(
          Date.UTC(2013, 10, 24, 12, 0, 0, 0) + txData.timestamp * 1000
        );
        value.push({
          timestamp: date.getTime(),
          sourceId: txData.transaction,
          sourceType: SourceTypes.TRANSACTION,
          confirmations: txData.confirmations,
          events,
        });
      }
    }
    return {
      value,
    };
  } catch (e) {
    return {
      error: e.message,
    };
  }
}

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
          events.push(
            isIncoming
              ? buildEventReceive(
                  { addrXpub, publicKey, alias },
                  AssetTypes.NATIVE,
                  "0",
                  txData.amount,
                  0
                )
              : buildEventSend(
                  { addrXpub, publicKey, alias },
                  AssetTypes.NATIVE,
                  "0",
                  txData.amount,
                  0
                )
          );
        }
        break;
      case TYPE_COLORED_COINS:
        switch (txData.subtype) {
          case SUBTYPE_COLORED_COINS_ASSET_ISSUANCE:
          case SUBTYPE_COLORED_COINS_ASSET_ISSUE_MORE:
            break;
          case SUBTYPE_COLORED_COINS_ASSET_TRANSFER: {
            let { asset, quantity } = txData.attachment;
            events.push(
              isIncoming
                ? buildEventReceive(
                    { addrXpub, publicKey, alias },
                    AssetTypes.TOKEN_TYPE_1,
                    asset,
                    quantity,
                    0
                  )
                : buildEventSend(
                    { addrXpub, publicKey, alias },
                    AssetTypes.TOKEN_TYPE_1,
                    asset,
                    quantity,
                    0
                  )
            );
            break;
          }
          case SUBTYPE_COLORED_COINS_ASK_ORDER_PLACEMENT:
          case SUBTYPE_COLORED_COINS_BID_ORDER_PLACEMENT: {
            const isAsk =
              txData.subtype == SUBTYPE_COLORED_COINS_ASK_ORDER_PLACEMENT;
            let { asset, quantity, price, currency } = txData.attachment;
            const assetType =
              asset == "0" ? AssetTypes.NATIVE : AssetTypes.TOKEN_TYPE_1;
            const currencyType =
              currency == "0" ? AssetTypes.NATIVE : AssetTypes.TOKEN_TYPE_1;
            events.push(
              isAsk
                ? buildEventSellOrder(
                    assetType,
                    asset,
                    currencyType,
                    currency,
                    quantity,
                    price
                  )
                : buildEventBuyOrder(
                    assetType,
                    asset,
                    currencyType,
                    currency,
                    quantity,
                    price
                  )
            );
            break;
          }
          case SUBTYPE_COLORED_COINS_ASK_ORDER_CANCELLATION:
          case SUBTYPE_COLORED_COINS_BID_ORDER_CANCELLATION:
            const isAsk =
              txData.subtype == SUBTYPE_COLORED_COINS_ASK_ORDER_CANCELLATION;
            const {
              cancelledOrderAsset,
              cancelledOrderQuantity,
              cancelledOrderPrice,
              cancelledOrderCurrency,
            } = txData.attachment;
            const assetType =
              cancelledOrderAsset == "0"
                ? AssetTypes.NATIVE
                : AssetTypes.TOKEN_TYPE_1;
            const currencyType =
              cancelledOrderCurrency == "0"
                ? AssetTypes.NATIVE
                : AssetTypes.TOKEN_TYPE_1;
            events.push(
              isAsk
                ? buildEventCancelSell(
                    assetType,
                    cancelledOrderAsset,
                    currencyType,
                    cancelledOrderCurrency,
                    cancelledOrderQuantity,
                    cancelledOrderPrice
                  )
                : buildEventCancelBuy(
                    assetType,
                    cancelledOrderAsset,
                    currencyType,
                    cancelledOrderCurrency,
                    cancelledOrderQuantity,
                    cancelledOrderPrice
                  )
            );
            break;
          case SUBTYPE_COLORED_COINS_ATOMIC_MULTI_TRANSFER: {

            /// We are awaiting Alexey to include MultiTransfers in API responses

            /*const transfers: Array<{
              recipient: string;
              asset: string;
              quantity: string;
            }> = txData.attachment;
            transfers.forEach(transfer => {
              const isIncoming = transfer.recipient == _addrXpub;
              const {asset, quantity } = transfer
              events.push(
                isIncoming
                  ? buildEventReceive(
                      { addrXpub, publicKey, alias },
                      AssetTypes.TOKEN_TYPE_1,
                      asset,
                      quantity,
                      0
                    )
                  : buildEventSend(
                      { addrXpub, publicKey, alias },
                      AssetTypes.TOKEN_TYPE_1,
                      asset,
                      quantity,
                      0
                    )
              );

            })*/
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
            events.push(
              buildEventLeaseBalance({ addrXpub, publicKey, alias }, period)
            );
            break;
          case SUBTYPE_ACCOUNT_CONTROL_INTERNET_ADDRESS:
            break;
        }
        break;
    }
    if (!isIncoming) {
      events.push(buildEventFee(txData.fee));
    }
    return events;
  } catch (e) {
    this.logger.error(e);
    throw e;
  }
}

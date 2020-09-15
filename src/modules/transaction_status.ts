import { TransactionStatusParam, TransactionStatusResult, tryParse, CallContext, ModuleResponse } from 'heat-server-common'
import { isNumber } from 'lodash';

export async function transactionStatus(context: CallContext, param: TransactionStatusParam): Promise<ModuleResponse<TransactionStatusResult>> {
  try {
    const { req, protocol, host, logger } = context
    const { addrXpub, transactionId } = param
    const url = `${protocol}://${host}/api/v1/blockchain/transaction/${transactionId}`;
    const json = await req.get(url);
    const transaction = tryParse(json, logger);

    if (isNumber(transaction.confirmations)) {
      return {
        value: {
          isAccepted: true,
          confirmations: transaction.confirmations,
        },
      };
    }

    const url2 = `${protocol}://${host}/api/v1/blockchain/unconfirmed/${addrXpub}/0`;
    const json2 = await req.get(url2);
    const unconfirmedTransactions = tryParse(json2, logger);
    if (!Array.isArray(unconfirmedTransactions)) {
      return {
        value: {
          isAccepted: false,
          confirmations: 0,
        },
      };
    }
    const isAccepted = !!unconfirmedTransactions.find(
      txn => txn.transaction == transactionId,
    );
    return {
      value: {
        isAccepted,
        confirmations: 0,
      },
    };
  } catch (e) {
    return {
      error: e.message,
    };
  }
}
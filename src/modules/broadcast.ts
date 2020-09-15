import { BroadcastParam, BroadcastResult, tryParse, CallContext, ModuleResponse } from 'heat-server-common'
import { isObjectLike, isString, isNumber } from 'lodash';

export async function broadcast(context: CallContext, param: BroadcastParam): Promise<ModuleResponse<BroadcastResult>> {
  try {
    const { req, protocol, host, logger } = context
    const { transactionHex } = param
    const url = `${protocol}://${host}/api/v1/tx/broadcast`;
    const json = await req.post(url, { form: { transactionBytes: transactionHex } }, [200]);
    const data = tryParse(json, logger);
    if (isObjectLike(data) && isString(data.transaction)) {
      return {
        value: {
          transactionId: data.transaction,
        },
      };
    } else {
      let errorMessage;
      if (
        isObjectLike(data) &&
        isObjectLike(data.error) &&
        isString(data.error.message)
      ) {
        errorMessage = data.error.message;
      } else if (isString(data.errorDescription)) {
        errorMessage = data.errorDescription;
      } else if (isNumber(data.errorCode)) {
        errorMessage = `Error code ${data.errorCode}`;
      } else {
        errorMessage = `Unregognized response: ${JSON.stringify(data)}`;
      }
      return {
        value: {
          errorMessage,
        },
      };
    }
  } catch (e) {
    return {
      error: e.message,
    };
  }
}
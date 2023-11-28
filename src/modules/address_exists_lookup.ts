import { tryParse, CallContext, ModuleResponse, AddressExistsLookupParam, AddressExistsLookupResult } from 'heat-server-common'
import { isNumber } from 'lodash'

export async function addressExistsLookup(context: CallContext, param: AddressExistsLookupParam): Promise<ModuleResponse<AddressExistsLookupResult>> {
  try {
    const { req, protocol, host, logger } = context
    const { blockchain, addrXpub } = param
    const url = `${protocol}://${host}/api/v1/blockchain/transactions/account/count/${addrXpub}`;
    const json = await req.get(url);
    const data = tryParse(json, logger);
    if (isNumber(data.count)) {
      return {
        value: {
          exists: data.count > 0
        },
      };
    }
    else {
      return {
        error: `Unregognized response: ${JSON.stringify(data)}`
      }
    }
  } catch (e) {
    return {
      error: e.message,
    };
  }
}
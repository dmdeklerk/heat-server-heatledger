import { PublicKeyLookupParam, PublicKeyLookupResult, tryParse, CallContext, ModuleResponse, prettyPrint } from 'heat-server-common'
import { isString } from 'lodash';

export async function publicKeyLookup(context: CallContext, param: PublicKeyLookupParam): Promise<ModuleResponse<PublicKeyLookupResult>> {
  try {
    const { req, protocol, host, logger } = context
    const { addrXpub } = param
    const url = `${protocol}://${host}/api/v1/account/publickey/${addrXpub}`;
    const json = await req.get(url);
    const data = tryParse(json, logger);
    if (isString(data.value)) {
      return {
        value: {
          publicKey: data.value,
        },
      };
    } else {
      logger.warn(`No public key for ${addrXpub} ${prettyPrint(data)}`);
      return {
        value: {
          publicKey: null,
        },
      };
    }
  } catch (e) {
    return {
      error: e.message,
    };
  }
}
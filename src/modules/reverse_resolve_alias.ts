import { ReverseResolveAliasParam, ReverseResolveAliasResult, tryParse, CallContext, ModuleResponse } from 'heat-server-common'
import { isString, isEmpty } from 'lodash';

export async function reverseResolveAlias(context: CallContext, param: ReverseResolveAliasParam): Promise<ModuleResponse<ReverseResolveAliasResult>> {
  try {
    const { req, protocol, host, logger } = context
    const { addrXpub } = param
    const url = `${protocol}://${host}/api/v1/account/find/${addrXpub}`;
    const json = await req.get(url);
    const data = tryParse(json, logger);
    if (data && isString(data.publicName) && !isEmpty(data.publicName)) {
      return {
        value: {
          alias: data.publicName,
          isPermanent: true,
        },
      };
    }
    return {
      value: {
        alias: null,
        isPermanent: false,
      },
    };    
  } catch (e) {
    return {
      error: e.message,
    };
  }
}
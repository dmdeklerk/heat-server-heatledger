import { ResolveAliasParam, ResolveAliasResult, tryParse, CallContext, ModuleResponse } from 'heat-server-common'
import { isString, isEmpty } from 'lodash';

export async function resolveAlias(context: CallContext, param: ResolveAliasParam): Promise<ModuleResponse<ResolveAliasResult>> {
  try {
    const { req, protocol, host, logger } = context
    const { alias } = param
    const alias_ = encodeURIComponent(alias);
    const url = `${protocol}://${host}/api/v1/account/find/name/${alias_}`;
    const json = await req.get(url);
    const data = tryParse(json, logger);
    if (data && isString(data.id) && !isEmpty(data.id)) {
      return {
        value: {
          addrXpub: data.id,
          isPermanent: true,
        },
      };
    }
    return {
      value: {
        addrXpub: null,
        isPermanent: false,
      },
    };
  } catch (e) {
    return {
      error: e.message,
    };
  }
}
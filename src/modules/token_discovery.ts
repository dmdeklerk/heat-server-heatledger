import { TokenDiscoveryParam, TokenDiscoveryResult, tryParse, CallContext, ModuleResponse, AssetTypes } from 'heat-server-common'
import { isArray } from 'lodash';

export async function tokenDiscovery(context: CallContext, param: TokenDiscoveryParam): Promise<ModuleResponse<Array<TokenDiscoveryResult>>> {
  try {
    const { req, protocol, host, logger } = context
    const { addrXpub, assetType } = param
    const url = `${protocol}://${host}/api/v1/account/balances/${addrXpub}/0/1/0/100`;
    const json = await req.get(url);
    const data = tryParse(json, logger);

    const value = [];
    if (isArray(data)) {
      data.forEach(d => {
        if (d.id == '0') {
          value.push({
            assetId: '0',
            assetType: AssetTypes.NATIVE,
            value: d.unconfirmedBalance || '0',
            exists: true,
          });
        } else {
          value.push({
            assetId: d.id,
            assetType: AssetTypes.TOKEN_TYPE_1,
            value: d.unconfirmedBalance || '0',
            exists: true,
          });
        }
      });
    } else {
      value.push({
        assetId: '0',
        assetType: AssetTypes.NATIVE,
        value: '0',
        exists: false,
      });
    }
    return {
      value,
    };  } catch (e) {
    return {
      error: e.message,
    };
  }
}
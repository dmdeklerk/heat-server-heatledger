import { TokenDiscoveryParam, TokenDiscoveryResult, tryParse, CallContext, ModuleResponse, AssetTypes } from 'heat-server-common'
import { isArray } from 'lodash';

type TokenClassHeat = {
  contract: string,
  decimals: number,
  name: string,
  symbol: string,
}

class TokenDiscoveryResultEx implements TokenDiscoveryResult {
  assetId: string;
  assetType: number;
  value: string;
  exists: boolean;
  constructor(parentResult: TokenDiscoveryResult ) {
    this.assetId = parentResult.assetId
    this.assetType = parentResult.assetType
    this.value = parentResult.value
    this.exists = parentResult.exists
  }
  /**
   * Details
   */
  details?: TokenClassHeat
}

function nativeHeatDetails() {
  return {
    contract: '0',
    decimals: 8,
    name: 'Heat',
    symbol: 'HEAT',
  }
}

type HeatAssetApiResponse = {
  unconfirmedBalance: string
  virtualBalance:string
  balance: string
  decimals: number
  id: string 
  properties: string // [\"IGNS\",\"Heat Ledger IGNIS token\"]
}

function assetHeatDetails(resp: HeatAssetApiResponse) {
  const [symbol,name] = tryParse(resp.properties) || ['*','*']
  return {
    contract: resp.id,
    decimals: resp.decimals,
    name,
    symbol,
  }
}

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
            details: nativeHeatDetails()
          });
        } else {
          value.push({
            assetId: d.id,
            assetType: AssetTypes.TOKEN_TYPE_1,
            value: d.unconfirmedBalance || '0',
            exists: true,
            details: assetHeatDetails(d)
          });
        }
      });
    } else {
      value.push({
        assetId: '0',
        assetType: AssetTypes.NATIVE,
        value: '0',
        exists: false,
        details: nativeHeatDetails()
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
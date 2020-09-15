import { CustomHeatAccountParam, CustomHeatAccountResult, tryParse, CallContext, ModuleResponse, prettyPrint } from 'heat-server-common'
import { isString } from 'lodash';

export async function customHeatAccount(context: CallContext, param: CustomHeatAccountParam): Promise<ModuleResponse<CustomHeatAccountResult>> {
  try {
    const { req, protocol, host, logger } = context
    const { addrXpub } = param
    const url = `${protocol}://${host}/api/v1/account/find/${addrXpub}`;
    const json = await req.get(url);
    const data = tryParse(json, logger);
    if (data && isString(data.id)) {
      return {
        value: {
          id: data.id,
          publicKey: data.publicKey,
          unconfirmedBalance: data.unconfirmedBalance,
          effectiveBalance: data.effectiveBalance,
          currentLessee: data.currentLessee,
          currentLesseeName: data.currentLesseeName,
          currentLeasingHeightFrom: data.currentLeasingHeightFrom,
          currentLeasingHeightTo: data.currentLeasingHeightTo,
          nextLessee: data.nextLessee,
          nextLesseeName: data.nextLesseeName,
          nextLeasingHeightFrom: data.nextLeasingHeightFrom,
          nextLeasingHeightTo: data.nextLeasingHeightTo,
        },
      };
    } else {
      this.logger.warn(`No custom heat account data for ${addrXpub} ${prettyPrint(data)}`);
      return {
        value: {
          id: null,
          publicKey: null,
          unconfirmedBalance: null,
          effectiveBalance: null,
          currentLessee: null,
          currentLesseeName: null,
          currentLeasingHeightFrom: null,
          currentLeasingHeightTo: null,
          nextLessee: null,
          nextLesseeName: null,
          nextLeasingHeightFrom: null,
          nextLeasingHeightTo: null,
        },
      };
    }
  } catch (e) {
    return {
      error: e.message,
    };
  }
}
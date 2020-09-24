import { CustomHeatAccountParam, CustomHeatAccountResult, CallContext, ModuleResponse } from 'heat-server-common';
export declare function customHeatAccount(context: CallContext, param: CustomHeatAccountParam): Promise<ModuleResponse<CustomHeatAccountResult>>;

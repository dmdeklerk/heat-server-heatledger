import { ReverseResolveAliasParam, ReverseResolveAliasResult, CallContext, ModuleResponse } from 'heat-server-common';
export declare function reverseResolveAlias(context: CallContext, param: ReverseResolveAliasParam): Promise<ModuleResponse<ReverseResolveAliasResult>>;

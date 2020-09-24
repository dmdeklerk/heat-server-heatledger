import { ResolveAliasParam, ResolveAliasResult, CallContext, ModuleResponse } from 'heat-server-common';
export declare function resolveAlias(context: CallContext, param: ResolveAliasParam): Promise<ModuleResponse<ResolveAliasResult>>;

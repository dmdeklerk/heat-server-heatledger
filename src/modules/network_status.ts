import { NetworkStatusParam, NetworkStatusResult, tryParse, CallContext, ModuleResponse } from 'heat-server-common'

export async function networkStatus(context: CallContext, param: NetworkStatusParam): Promise<ModuleResponse<NetworkStatusResult>> {
  try {
    const { req, protocol, host, logger } = context
    const url = `${protocol}://${host}/api/v1/blockchain/status`;
    const json = await req.get(url);
    const data = tryParse(json, logger);

    // "195310367"
    const lastBlockTime = new Date(
      Date.UTC(2013, 10, 24, 12, 0, 0, 0) + data.lastBlockTimestamp * 1000,
    );
    const lastBlockHeight = data.numberOfBlocks;
    const lastBlockId = data.lastBlock;
    return {
      value: {
        lastBlockTime,
        lastBlockHeight,
        lastBlockId,
      },
    };
  } catch (e) {
    return {
      error: e.message,
    };
  }
}
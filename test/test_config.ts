import { MonitoredRequest, CallContext, createLogger } from 'heat-server-common';

/// Heat
export const testConfig = {
  protocol: 'https',
  host: 'heatwallet.com:7734'
}

export function createContext(label?: string) {
  let { host, protocol } = testConfig;
  let logger = createLogger()
  let context: CallContext = {
    host,
    protocol,
    logger,
    req: new MonitoredRequest(logger, label ? label : '')
  }
  return context
}


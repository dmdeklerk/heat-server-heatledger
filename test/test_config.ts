import { Logger } from '@nestjs/common';
import { MonitoredRequest, CallContext } from 'heat-server-common';

/// Heat
export const testConfig = {
  protocol: 'https',
  host: 'heatwallet.com:7734'
}

export function createContext(label?: string) {
  let { host, protocol } = testConfig;
  let logger = new Logger()
  let context: CallContext = {
    host,
    protocol,
    logger,
    req: new MonitoredRequest(logger, label ? label : '')
  }
  return context
}


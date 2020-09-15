import * as chai from 'chai';
const { isObject, isNumber, isBoolean } = chai.assert
import 'mocha';
import { createContext } from './test_config'
import { transactionStatus } from '../src/modules/transaction_status';
import { Blockchains, AssetTypes } from 'heat-server-common';

describe('Transaction Status', () => {
  it('should work', async () => {
    const blockchain: Blockchains = Blockchains.HEAT
    const assetType: AssetTypes = AssetTypes.NATIVE
    const addrXpub: string = '0'
    const transactionId: string = '688946077918135707'
    let resp = await transactionStatus(createContext('Transaction'), {
      blockchain, assetType, addrXpub, transactionId
    })
    isObject(resp)
    let result = resp.value
    isObject(result)
    isNumber(result.confirmations)
    isBoolean(result.isAccepted)
  });
});
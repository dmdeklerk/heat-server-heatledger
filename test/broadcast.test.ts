import * as chai from 'chai';
const { isObject, isTrue, isNumber, isString } = chai.assert
import 'mocha';
import { createContext } from './test_config'
import { broadcast } from '../src/modules/broadcast';
import { Blockchains, AssetTypes } from 'heat-server-common';

describe('Broadcast', () => {
  it('should work', async () => {
    const blockchain = Blockchains.ETHEREUM
    const transactionHex = '3134372e3337383036323539207265776172647320666f7220612031322e303225207368617265206f662074686520706f6f6c'
    const assetType = AssetTypes.NATIVE
    let resp = await broadcast(createContext('Status'), {
      blockchain, transactionHex, assetType
    })
    //console.log('response', resp)
    isObject(resp)
    let result = resp.value
    isObject(result)
    if (result.transactionId) isString(result.transactionId)
    if (result.errorMessage) isString(result.errorMessage)
  });
});
import * as chai from 'chai';
const { isObject, isBoolean, isString } = chai.assert
import 'mocha';
import { createContext } from './test_config'
import { reverseResolveAlias } from '../src/modules/reverse_resolve_alias';
import { Blockchains, AssetTypes } from 'heat-server-common';

describe('Reverse Resolve Alias', () => {
  it('should work', async () => {
    const blockchain: Blockchains = Blockchains.HEAT
    const assetType: AssetTypes = AssetTypes.NATIVE
    const addrXpub: string = '12289004105163558344'
    let resp = await reverseResolveAlias(createContext('Reverse'), {
      blockchain, assetType, addrXpub
    })
    //console.log('response', resp)
    isObject(resp)
    let result = resp.value
    isObject(result)
    isString(result.alias)
    isBoolean(result.isPermanent)
    chai.assert.equal(result.alias, 'pool@heatwallet.com')
  });
});
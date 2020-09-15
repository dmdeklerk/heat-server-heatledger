import * as chai from 'chai';
const { isObject, isBoolean, isString } = chai.assert
import 'mocha';
import { createContext } from './test_config'
import { publicKeyLookup } from '../src/modules/publickey_lookup';
import { Blockchains } from 'heat-server-common';

describe('Publickey Lookup', () => {
  it('should work', async () => {
    const blockchain: Blockchains = Blockchains.HEAT
    const addrXpub: string = '12289004105163558344'
    let resp = await publicKeyLookup(createContext('Publickey'), {
      blockchain, addrXpub
    })
    //console.log('response', resp)
    isObject(resp)
    let result = resp.value
    isObject(result)
    isString(result.publicKey)
    chai.assert.equal(result.publicKey, 'fffab158d3a3e15d1453680fb48e5ba1126696146abfa87c631b5fdb4cb5ff2f')
  });
});
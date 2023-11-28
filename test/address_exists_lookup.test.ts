import * as chai from 'chai';
const { isObject, isTrue } = chai.assert
import 'mocha';
import { createContext } from './test_config'
import { addressExistsLookup } from '../src/modules/address_exists_lookup';
import { Blockchains } from 'heat-server-common';

describe('Address Exists', () => {
  it('should work', async () => {
    let resp = await addressExistsLookup(createContext('Address Exists'), {
      blockchain: Blockchains.HEAT,
      addrXpub: '1'
    })
    //console.log('response', resp)
    isObject(resp)
    let result = resp.value
    isObject(result)
    isTrue(result?.exists)
  });
});
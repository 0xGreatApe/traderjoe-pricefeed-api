import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as FactoryContract from 'abi/v2/LBFactory.json';
import * as PairABI from 'abi/v2/LBPair.json';
import * as TokenList from 'tokenlist/avalanche.tokenlist.json';
import { getPriceFromId } from './utils/priceUtils';

@Injectable()
export class AppService {

  private provider: ethers.Provider;
  private factorycontract: ethers.Contract;
  
  constructor() {
    // Get the V2 LBFactory contract information
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL ?? "",);
    const factoryAddress = FactoryContract.address;
    const factoryABI = FactoryContract.abi;
    this.factorycontract = new ethers.Contract(factoryAddress, factoryABI, this.provider);
  }
}
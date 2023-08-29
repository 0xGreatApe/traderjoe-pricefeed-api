import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as FactoryContract from 'abi/factory.json';
import * as PairABI from 'abi/pair.json';
import * as TokenList from 'tokenlist/avalanche.tokenlist.json';

@Injectable()
export class AppService {

  private factorycontract: ethers.Contract;
  private provider: ethers.Provider;
  

  constructor() {
    // Get the TraderJoe V1 Factory contract. This contract will be used to find the Pair address of the two tokens
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL ?? "",);
    const factoryAddress = FactoryContract.address;
    const factoryABI = FactoryContract.abi;
    this.factorycontract = new ethers.Contract(factoryAddress, factoryABI, this.provider);
  }

  //@notice: Won't need this.  Just here to test a simple function call
  getTotalPairs() {
    return this.factorycontract.allPairsLength();
  }

  //@notice: parameters are token symbols. 
  async getBasePrice(baseSymbol: string, quoteSymbol: string) {

    // Convert params to capital letters
    const baseSymbolUpper = baseSymbol.toUpperCase();
    const quoteSymbolUpper = quoteSymbol.toUpperCase();

    // Find the tokens from the token list
    const baseToken = TokenList.tokens.find(token => token.symbol.toUpperCase() === baseSymbolUpper) || {};
    const quoteToken = TokenList.tokens.find(token => token.symbol.toUpperCase() === quoteSymbolUpper) || {};

    // Get pair address from factory contract and initiate the pair contract
    const pairAddress = await this.factorycontract.getPair(baseToken['address'], quoteToken['address']);
    const pairContract = new ethers.Contract(pairAddress, PairABI, this.provider);

    // Get token reserves from pair contract
    const { _reserve0, _reserve1 } = await pairContract.getReserves();
    
    // Compare token addresses to assign correct reserve.  
    const isBaseToken0 = await pairContract.token0() === baseToken['address'];
    const baseReserve = isBaseToken0 ? Number(_reserve0) : Number(_reserve1);
    const quoteReserve = isBaseToken0 ? Number(_reserve1) : Number(_reserve0);

    // Get Decimals of each token. If decimal scalings are different, calc will need to adjust for this
    const baseDecimal = 10**baseToken['decimals'];
    const quoteDecimal = 10**quoteToken['decimals'];
    
    // Calculate price based on reserves and decimals
    const price = (quoteReserve/quoteDecimal) / (baseReserve/baseDecimal);

    return price;    
  }
}
 
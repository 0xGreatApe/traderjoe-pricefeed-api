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

  // @notice: parameters are token symbols. 
  async getBasePrice(baseSymbol: string, quoteSymbol: string, binStep: number) {

    // Find the tokens from the token list
    const baseToken = TokenList.tokens.find(token => token.symbol.toUpperCase() === baseSymbol.toUpperCase()) || {};
    const quoteToken = TokenList.tokens.find(token => token.symbol.toUpperCase() === quoteSymbol.toUpperCase()) || {};


    // Get pair address from factory contract and initiate the pair contract
    const pairData = await this.factorycontract.getLBPairInformation(baseToken['address'], quoteToken['address'], binStep);
    const pairAddress = pairData[1];
    const pairContract = new ethers.Contract(pairAddress, PairABI, this.provider);

    // Compare token addresses and assign the correct token to the it's X and Y counterpart
    // @notice: This is important bc LBPair contract is the exact same for every token pair no matter which is the base or the quote. 


    // Get active Bin ID to calculate price
    const reservesAndID = await pairContract.getReservesAndId();
    const binId = Number(reservesAndID[2]);

    // Calculate price based on bin ID
    const price = getPriceFromId(binId, binStep);
    
    // @notice: Compare base token address to the tokenX address in the pair contract.  If they're not equal, invert the price and switch the decimal scaling
    // @notice: This is import bc LBPair contract is the exact same and therefore the price for every token pair, no matter which is the base or the quote.
    const tokenXAddress = await pairContract.tokenX();
    const isTokenXBase = tokenXAddress === baseToken['address'];

    // Account for different decimal scaling.  Switch if base token is not tokenX
    const exponent = isTokenXBase ? baseToken['decimals'] - quoteToken['decimals'] : quoteToken['decimals'] - baseToken['decimals'];
    
    // Invert price if base token is not tokenX
    const priceAdjusted = isTokenXBase ? price * 10 ** exponent : 1 / (price * 10 ** exponent);
    
    return priceAdjusted; 
  }
}
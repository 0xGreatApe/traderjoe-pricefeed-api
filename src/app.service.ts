import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as FactoryContract from 'abi/factory.json';
import * as PairABI from 'abi/pair.json';
import * as TokenList from 'tokenlist/avalanche.tokenlist.json';

@Injectable()
export class AppService {}
 
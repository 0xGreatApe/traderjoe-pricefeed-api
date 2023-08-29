import { ChainId, WNATIVE, Token, TokenAmount, Percent, } from "@traderjoe-xyz/sdk-core";
import { PairV2, RouteV2, TradeV2, TradeOptions, LB_ROUTER_ADDRESS, jsonAbis, LB_ROUTER_V21_ADDRESS } from "@traderjoe-xyz/sdk-v2";
import { createPublicClient, createWalletClient, http, parseUnits, BaseError, ContractFunctionRevertedError } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalanche } from "viem/chains";
import { config } from "dotenv";
config();

async function MakeATrade() {

    // Declard required constants
    const privateKey = process.env.PRIVATE_KEY;
    const { LBRouterV21ABI } = jsonAbis;
    const CHAIN_ID = ChainId.AVALANCHE;
    const router = LB_ROUTER_V21_ADDRESS[CHAIN_ID];
    const account = privateKeyToAccount(`0x${privateKey}`);

    // Initialize tokens
    const WAVAX  = WNATIVE[CHAIN_ID]; // Token instance of WAVAX
    const USDC = new Token(
        CHAIN_ID,
        "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        6, 
        "USDC",
        "USD Coin"
    );
    const USDT = new Token(
        CHAIN_ID,
        "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
        6,
        "USDT",
        "Tether USD"
    );

    // Declare bases used to generate trade routes
    const BASES = [WAVAX, USDC, USDT];

    // Create Viem Clients
    const publicClient = createPublicClient({
        chain: avalanche,
        transport: http(),
    });
    const walletClient = createWalletClient({
        account,
        chain: avalanche,
        transport: http(),
    });

    /* Declare user inputs and intialize TokenAmount */
    const inputToken = USDC; // the input token in the trade
    const outputToken = WAVAX; // the output token in the trade
    const isExactIn = true; // specify whether user gave an exact inputToken or outputToken value for the trade
    const typedValueIn = "20"; // user string input; in this case representing 20 USDC
    const typedValueInParsed = parseUnits(typedValueIn, inputToken.decimals); // parse user input into inputToken's decimal precision, which is 6 for USDC
    const amountIn = new TokenAmount(inputToken, typedValueInParsed); // wrap into TokenAmount

    /* Use PairV2 and RouteV2 functions to generate all possible routes */
    // get all [Token, Token] combinations
    const allTokenPairs = PairV2.createAllTokenPairs(inputToken, outputToken, BASES);
    // init PairV2 instance for the [Token, Token] pairs
    const allPairs = PairV2.initPairs(allTokenPairs);
    // generates all possible routes to consider
    const allRoutes = RouteV2.createAllRoutes(allPairs, inputToken, outputToken);

    /* Generate TradeV2 instances and get the best trade */
    const isNativeIn = false; // set to 'true' if swapping from Native
    const isNativeOut = true; // set to 'true' if swapping to Native
    // generate all possible TradeV2 instances
    const trades = await TradeV2.getTradesExactIn(
        allRoutes,
        amountIn,
        outputToken,
        isNativeIn,
        isNativeOut,
        publicClient,
        CHAIN_ID
    );
    // choose the best trade
    const bestTrade: TradeV2 = TradeV2.chooseBestTrade(trades, isExactIn);

    /* Check trade information */
    // print useful information about the trade, such as the quote, executionPrice, fees, etc
    console.log(bestTrade.toLog());
    // get trade fee information
    const { totalFeePct, feeAmountIn } = await bestTrade.getTradeFee();
    console.log("Total fees percentage", totalFeePct.toSignificant(6), "%");
    console.log(`Fee: ${feeAmountIn.toSignificant(6)} ${feeAmountIn.token.symbol}`);

    /* Declare slippage tolerance and swap method/parameters */
    // set slippage tolerance
    const userSlippageTolerance = new Percent("50", "10000"); // 0.5%
    // set swap options
    const swapOptions: TradeOptions = {
    allowedSlippage: userSlippageTolerance,
    ttl: 3600,
    recipient: account.address,
    feeOnTransfer: false, // or true
    };
    // generate swap method and parameters for contract call
    const {
    methodName, // e.g. swapExactTokensForNATIVE,
    args, // e.g.[amountIn, amountOut, (pairBinSteps, versions, tokenPath) to, deadline]
    value, // e.g. 0x0
    } = bestTrade.swapCallParameters(swapOptions);

    /* Execute trade using Viem */
    const { request } = await publicClient.simulateContract({
        address: router,
        abi: LBRouterV21ABI,
        functionName: methodName,
        args: args,
        account,
        value: BigInt(value),
    });
    // const hash = await walletClient.writeContract(request);
    // console.log(`Transaction sent with hash ${hash}`);
}

MakeATrade();
export function getPriceFromId(binId: number, binStep: number): number {
    /**
     * Convert a binId to the underlying price.
     *
     * @param binId - Bin Id.
     * @param binStep - binStep of the pair.
     * @return Price of the bin.
     */
  
    return (1 + binStep / 10_000) ** (binId - 8388608);
  }
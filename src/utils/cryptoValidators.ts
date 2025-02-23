
export type CryptoType = {
  name: string;
  symbol: string;
  regex: RegExp;
  networks?: string[];
  explorerUrl?: string;
  description: string;
  logoUrl?: string;
};

export const cryptoValidators: CryptoType[] = [
  {
    name: "Solana",
    symbol: "SOL",
    regex: /^[1-9A-HJ-NP-Za-km-z]{44}$/,
    explorerUrl: "https://solscan.io/account/",
    description: "44 characters using Base58 encoding (excludes 0, O, I, l)",
    logoUrl: "https://cryptologos.cc/logos/solana-sol-logo.png"
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    regex: /^(1[a-zA-Z0-9]{25,34}|3[a-zA-Z0-9]{25,34}|bc1[a-zA-Z0-9]{25,87})$/,
    explorerUrl: "https://blockchair.com/bitcoin/address/",
    description: "Legacy (1), SegWit (3), or Native SegWit (bc1/bc1p)",
    logoUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png"
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    regex: /^0x[a-fA-F0-9]{40}$/,
    networks: ["Ethereum", "Polygon", "BSC", "Avalanche", "Arbitrum", "Optimism", "Fantom", "Base"],
    explorerUrl: "https://etherscan.io/address/",
    description: "Starts with '0x' followed by 40 hexadecimal characters (total 42 characters)",
    logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png"
  },
  {
    name: "Litecoin",
    symbol: "LTC",
    regex: /^[LM][a-km-zA-HJ-NP-Z1-9]{33}$/,
    explorerUrl: "https://blockchair.com/litecoin/address/",
    description: "Starts with 'L' or 'M' and is exactly 34 characters long",
    logoUrl: "https://cryptologos.cc/logos/litecoin-ltc-logo.png"
  },
  {
    name: "Bitcoin Cash",
    symbol: "BCH",
    regex: /^(bitcoincash:q|q)[a-z0-9]{41}$/,
    explorerUrl: "https://blockchair.com/bitcoin-cash/address/",
    description: "Starts with 'q' or 'bitcoincash:' and is 42 characters long",
    logoUrl: "https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png"
  },
  {
    name: "Cardano",
    symbol: "ADA",
    regex: /^addr[a-zA-Z0-9]{45,200}$/,
    explorerUrl: "https://cardanoscan.io/address/",
    description: "Starts with 'addr' and can be very long",
    logoUrl: "https://cryptologos.cc/logos/cardano-ada-logo.png"
  },
  {
    name: "Ripple",
    symbol: "XRP",
    regex: /^r[0-9a-zA-Z]{33}$/,
    explorerUrl: "https://xrpscan.com/account/",
    description: "Starts with 'r' and is exactly 34 characters long",
    logoUrl: "https://cryptologos.cc/logos/xrp-xrp-logo.png"
  },
  {
    name: "TRON",
    symbol: "TRX",
    regex: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
    explorerUrl: "https://tronscan.org/#/address/",
    description: "Starts with 'T' and is exactly 34 characters long",
    logoUrl: "https://cryptologos.cc/logos/tron-trx-logo.png"
  },
  {
    name: "Dogecoin",
    symbol: "DOGE",
    regex: /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/,
    explorerUrl: "https://dogechain.info/address/",
    description: "Starts with 'D' and is exactly 34 characters long",
    logoUrl: "https://cryptologos.cc/logos/dogecoin-doge-logo.png"
  },
  {
    name: "Binance Coin",
    symbol: "BNB",
    regex: /^bnb[a-zA-Z0-9]{39}$/,
    explorerUrl: "https://explorer.binance.org/address/",
    description: "Starts with 'bnb' and is exactly 42 characters long",
    logoUrl: "https://cryptologos.cc/logos/bnb-bnb-logo.png"
  }
];

export const validateCryptoAddress = (address: string): CryptoType | null => {
  // Handle empty or invalid input
  if (!address || typeof address !== 'string') {
    return null;
  }

  // Clean the address (remove whitespace, etc)
  const cleanAddress = address.trim();

  // Check if it matches Solana's pattern first (44 chars, Base58)
  const solanaValidator = cryptoValidators[0]; // Solana is first in the array
  if (cleanAddress.length === 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(cleanAddress)) {
    return solanaValidator;
  }

  // If not Solana, check other crypto validators
  for (const crypto of cryptoValidators) {
    if (crypto.regex.test(cleanAddress)) {
      return crypto;
    }
  }

  return null;
};

// Helper function to get detailed information about address patterns
export const getCryptoAddressPatterns = (): Array<{name: string, pattern: string}> => {
  return cryptoValidators.map(crypto => ({
    name: crypto.name,
    pattern: crypto.description
  }));
};

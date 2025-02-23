export const truncateAddress = (address: string, startChars = 6, endChars = 4): string => {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy text: ", err);
    return false;
  }
};

interface BalanceResult {
  balance: string;
  usdValue: string;
  usdtBalance?: string;
  explorerUrl?: string;
  error?: boolean;
  txCount?: string;
  firstTx?: string;
  lastTx?: string;
  received?: string;
  spent?: string;
  receivedUsd?: string;
  spentUsd?: string;
  outputCount?: string;
  unspentOutputCount?: string;
  firstSpending?: string;
  lastSpending?: string;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let lastBtcRequestTime = 0;
const BTC_REQUEST_DELAY = 1000; // 1 second delay between BTC requests

const getBlockchairEndpoint = (cryptoType: string, address: string): string => {
  const cleanAddress = address.trim();
  
  switch (cryptoType.toLowerCase()) {
    case 'btc':
      return `https://blockstream.info/api/address/${cleanAddress}`;
    case 'eth':
      return `https://api.blockchair.com/ethereum/raw/address/${cleanAddress}`;
    case 'ltc':
      return `https://api.blockchair.com/litecoin/raw/address/${cleanAddress}`;
    case 'doge':
      return `https://api.blockchair.com/dogecoin/raw/address/${cleanAddress}`;
    case 'bch':
      return `https://api.blockchair.com/bitcoin-cash/raw/address/${cleanAddress}`;
    default:
      return '';
  }
};

const getBlockchairBalance = async (cryptoType: string, address: string): Promise<any> => {
  const endpoint = getBlockchairEndpoint(cryptoType, address);
  if (!endpoint) return { balance: 'Not supported' };

  // Add delay for rate limiting
  if (cryptoType.toLowerCase() === 'btc' || cryptoType.toLowerCase() === 'eth') {
    const now = Date.now();
    const timeSinceLastRequest = now - lastBtcRequestTime;
    if (timeSinceLastRequest < BTC_REQUEST_DELAY) {
      await delay(BTC_REQUEST_DELAY - timeSinceLastRequest);
    }
    lastBtcRequestTime = Date.now();
  }

  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (cryptoType.toLowerCase() === 'btc') {
      // עיבוד נתונים מ-Blockstream API
      const txsResponse = await fetch(`${endpoint}/txs`);
      const txs = await txsResponse.json();
      const firstTx = txs[txs.length - 1];
      const lastTx = txs[0];

      return {
        balance: (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 100000000,
        txCount: data.chain_stats.tx_count.toString(),
        firstTx: firstTx ? new Date(firstTx.status.block_time * 1000).toLocaleString() : 'Unknown',
        lastTx: lastTx ? new Date(lastTx.status.block_time * 1000).toLocaleString() : 'Unknown',
        balanceUsd: null // נקבל את זה מ-Binance בהמשך
      };
    }
    
    // עיבוד נתונים מ-Blockchair API לשאר המטבעות
    if (data.data) {
      let addressData;
      const lowerCaseAddress = address.trim().toLowerCase();

      switch (cryptoType.toLowerCase()) {
        case 'eth':
          addressData = data.data[lowerCaseAddress]?.address;
          break;
        case 'ltc':
        case 'bch':
        case 'doge':
          const cleanAddress = address.trim();
          addressData = data.data[cleanAddress] || data.data[lowerCaseAddress];
          break;
        default:
          addressData = null;
      }
      
      if (addressData) {
        const balance = addressData.balance || 0;
        const txCount = addressData.transaction_count || addressData.call_count || 0;
        const firstTxTime = addressData.first_seen_receiving || null;
        const lastTxTime = addressData.last_seen_receiving || null;
        const balanceUsd = addressData.balance_usd || null;
        
        let convertedBalance;
        switch (cryptoType.toLowerCase()) {
          case 'ltc':
          case 'bch':
            convertedBalance = (balance / 100000000).toFixed(8);
            break;
          case 'eth':
            convertedBalance = (balance / 1000000000000000000).toFixed(6);
            break;
          case 'doge':
            convertedBalance = (balance / 100000000).toFixed(2);
            break;
          default:
            convertedBalance = balance.toString();
        }

        console.log(`${cryptoType.toUpperCase()} data:`, {
          balance: convertedBalance,
          txCount,
          firstTx: firstTxTime,
          lastTx: lastTxTime,
          balanceUsd
        });

        return {
          balance: convertedBalance,
          txCount: txCount.toString(),
          firstTx: firstTxTime ? new Date(firstTxTime).toLocaleString() : 'Unknown',
          lastTx: lastTxTime ? new Date(lastTxTime).toLocaleString() : 'Unknown',
          balanceUsd: balanceUsd ? balanceUsd.toFixed(2) : null
        };
      }
    }

    return { balance: '0', txCount: '0', firstTx: 'Unknown', lastTx: 'Unknown', balanceUsd: '0' };
  } catch (error) {
    console.error(`Error fetching ${cryptoType} balance:`, error);
    return { balance: 'Error', txCount: 'Error', firstTx: 'Error', lastTx: 'Error', balanceUsd: 'Error' };
  }
};

export const fetchBalance = async (address: string, cryptoType: string): Promise<BalanceResult> => {
  try {
    let balance = '0';
    let price = 0;
    let usdtBalance: string | undefined;
    let txCount = '0';
    let firstTx = 'Unknown';
    let lastTx = 'Unknown';

    // Try Binance first, then CoinGecko as backup for price
    try {
      const binanceResponse = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${getBinanceSymbol(cryptoType)}`);
      const binanceData = await binanceResponse.json();
      price = parseFloat(binanceData.price);
    } catch (binanceError) {
      console.error('Error fetching price from Binance:', binanceError);
      try {
        const priceResponse = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${getCoinGeckoId(cryptoType)}&vs_currencies=usd`);
        const priceData = await priceResponse.json();
        price = priceData[getCoinGeckoId(cryptoType)]?.usd || 0;
      } catch (coingeckoError) {
        console.error('Error fetching price from CoinGecko:', coingeckoError);
        price = 0;
      }
    }

    switch (cryptoType.toLowerCase()) {
      case 'btc':
      case 'ltc':
      case 'doge':
      case 'bch':
        const blockchairData = await getBlockchairBalance(cryptoType, address);
        console.log('Blockchair data:', blockchairData);
        if (blockchairData.balance === 'Error' || blockchairData.balance === 'Not supported') {
          return { 
            balance: 'Check Explorer',
            usdValue: 'Check Explorer',
            txCount: '0',
            firstTx: new Date().toLocaleString(),
            lastTx: new Date().toLocaleString()
          };
        } else {
          balance = blockchairData.balance;
          txCount = blockchairData.txCount || '0';
          firstTx = blockchairData.firstTx || new Date().toLocaleString();
          lastTx = blockchairData.lastTx || new Date().toLocaleString();
        }
        break;

      case 'xrp':
        try {
          const xrpResponse = await fetch(`https://api.xrpscan.com/api/v1/account/${address}`);
          const xrpData = await xrpResponse.json();
          balance = (parseFloat(xrpData.xrpBalance) || 0).toFixed(6);
          txCount = '1';  // Default value since we can't get this from the API
          firstTx = new Date().toLocaleString();
          lastTx = new Date().toLocaleString();
        } catch (error) {
          console.error('XRP fetch error:', error);
          return { 
            balance: 'Check Explorer',
            usdValue: 'Check Explorer',
            txCount: '0',
            firstTx: new Date().toLocaleString(),
            lastTx: new Date().toLocaleString()
          };
        }
        break;

      case 'eth':
        // First try Blockchair for ETH
        try {
          const blockchairData = await getBlockchairBalance('eth', address);
          if (blockchairData.balance !== 'Error' && blockchairData.balance !== 'Not supported') {
            balance = blockchairData.balance;
            txCount = blockchairData.txCount;
            firstTx = blockchairData.firstTx;
            lastTx = blockchairData.lastTx;
            break;
          }
        } catch (blockchairError) {
          console.error('Error fetching from Blockchair:', blockchairError);
        }

        // If Blockchair fails, try Ethplorer
        try {
          const ethResponse = await fetch(`https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`);
          const ethData = await ethResponse.json();
          balance = ethData.ETH?.balance?.toFixed(6) || '0';
          txCount = (ethData.countTxs || 0).toString();
          firstTx = 'Check Explorer';
          lastTx = 'Check Explorer';
          
          if (ethData.tokens) {
            const usdtToken = ethData.tokens.find((token: any) => 
              token.tokenInfo.symbol === 'USDT' && 
              token.tokenInfo.address.toLowerCase() === '0xdac17f958d2ee523a2206206994597c13d831ec7'
            );
            
            if (usdtToken) {
              const decimals = parseInt(usdtToken.tokenInfo.decimals);
              const rawBalance = parseFloat(usdtToken.balance);
              usdtBalance = (rawBalance / Math.pow(10, decimals)).toFixed(2);
            }
          }
        } catch (ethplorerError) {
          console.error('Error fetching from Ethplorer:', ethplorerError);
          return { 
            balance: 'Check Explorer', 
            usdValue: 'Check Explorer',
            txCount: 'N/A',
            firstTx: 'N/A',
            lastTx: 'N/A',
            explorerUrl: `https://etherscan.io/address/${address}`
          };
        }
        break;

      case 'trx':
        try {
          const tronResponse = await fetch(`https://api.trongrid.io/v1/accounts/${address}`);
          const tronData = await tronResponse.json();
          if (tronData.data && tronData.data.length > 0) {
            balance = (tronData.data[0].balance / 1000000).toFixed(6);
            txCount = 'Check Explorer';
            firstTx = 'Check Explorer';
            lastTx = 'Check Explorer';
          }
        } catch (error) {
          return { 
            balance: 'Check Explorer', 
            usdValue: 'Check Explorer',
            txCount: 'N/A',
            firstTx: 'N/A',
            lastTx: 'N/A',
            explorerUrl: `https://tronscan.org/#/address/${address}`
          };
        }
        break;

      case 'sol':
        return { 
          balance: 'Check Explorer', 
          usdValue: 'Check Explorer',
          txCount: 'Check Explorer',
          firstTx: 'Check Explorer',
          lastTx: 'Check Explorer',
          explorerUrl: `https://solscan.io/account/${address}`
        };

      case 'ada':
        return { 
          balance: 'Check Explorer', 
          usdValue: 'Check Explorer',
          txCount: 'Check Explorer',
          firstTx: 'Check Explorer',
          lastTx: 'Check Explorer',
          explorerUrl: `https://cardanoscan.io/address/${address}`
        };

      case 'bnb':
        return { 
          balance: 'Check Explorer', 
          usdValue: 'Check Explorer',
          txCount: 'Check Explorer',
          firstTx: 'Check Explorer',
          lastTx: 'Check Explorer',
          explorerUrl: `https://bscscan.com/address/${address}`
        };
      
      default:
        return { 
          balance: 'Check Explorer', 
          usdValue: 'Check Explorer',
          txCount: 'Check Explorer',
          firstTx: 'Check Explorer',
          lastTx: 'Check Explorer'
        };
    }

    const usdValue = (parseFloat(balance) * price).toFixed(2);
    
    // Make sure we always return all required fields
    return {
      balance,
      usdValue,
      usdtBalance,
      txCount: txCount || '0',
      firstTx: firstTx || new Date().toLocaleString(),
      lastTx: lastTx || new Date().toLocaleString()
    };
  } catch (error) {
    console.error('Error in fetchBalance:', error);
    return { 
      balance: 'Check Explorer',
      usdValue: 'Check Explorer',
      txCount: '0',
      firstTx: new Date().toLocaleString(),
      lastTx: new Date().toLocaleString()
    };
  }
};

const getCoinGeckoId = (cryptoType: string): string => {
  switch (cryptoType.toLowerCase()) {
    case 'btc':
      return 'bitcoin';
    case 'eth':
      return 'ethereum';
    case 'sol':
      return 'solana';
    case 'trx':
      return 'tron';
    case 'ltc':
      return 'litecoin';
    case 'ada':
      return 'cardano';
    case 'xrp':
      return 'ripple';
    case 'doge':
      return 'dogecoin';
    case 'bnb':
      return 'binancecoin';
    case 'bch':
      return 'bitcoin-cash';
    default:
      return '';
  }
};

const getBinanceSymbol = (cryptoType: string): string => {
  switch (cryptoType.toLowerCase()) {
    case 'btc':
      return 'BTCUSDT';
    case 'eth':
      return 'ETHUSDT';
    case 'sol':
      return 'SOLUSDT';
    case 'trx':
      return 'TRXUSDT';
    case 'ltc':
      return 'LTCUSDT';
    case 'ada':
      return 'ADAUSDT';
    case 'xrp':
      return 'XRPUSDT';
    case 'doge':
      return 'DOGEUSDT';
    case 'bnb':
      return 'BNBUSDT';
    case 'bch':
      return 'BCHUSDT';
    default:
      return 'BTCUSDT';
  }
};

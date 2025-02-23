
import { validateCryptoAddress } from "@/utils/cryptoValidators";

interface Transaction {
  hash: string;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  fee: string;
  isIncoming: boolean;
  changeAddress?: string;
  changeAmount?: string;
}

interface BitcoinTransactionsResponse {
  transactions: Transaction[];
  hasMore: boolean;
  lastSeenTxid: string;
  totalTxs: number;
}

const formatBitcoinValue = (valueInSatoshis: number): string => {
  try {
    if (typeof valueInSatoshis !== 'number' || isNaN(valueInSatoshis)) return '0.00000000';
    return (valueInSatoshis / 100000000).toFixed(8);
  } catch (error) {
    console.error('Error formatting Bitcoin value:', error);
    return '0.00000000';
  }
};

const formatTimestamp = (timestamp: number): string => {
  try {
    const date = new Date(timestamp * 1000);
    return date.toISOString();
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return new Date().toISOString();
  }
};

const findRelevantAddresses = (tx: any, ourAddress: string) => {
  // מצא את כל הכתובות בקלט
  const inputAddresses = tx.vin
    .map((input: any) => input.prevout?.scriptpubkey_address)
    .filter((addr: string | null) => addr !== null && addr !== undefined);

  // מצא את כל הכתובות בפלט
  const outputAddresses = tx.vout
    .map((output: any) => output.scriptpubkey_address)
    .filter((addr: string | null) => addr !== null && addr !== undefined);

  const isIncoming = outputAddresses.includes(ourAddress);
  
  let from, to;
  if (isIncoming) {
    // אם זו טרנזקציה נכנסת, השולח הוא הכתובת הראשונה בקלט
    from = inputAddresses[0] || 'Unknown';
    to = ourAddress;
  } else {
    // אם זו טרנזקציה יוצאת, השולח הוא אנחנו והמקבל הוא הכתובת הראשונה בפלט שאינה שלנו
    from = ourAddress;
    to = outputAddresses.find(addr => addr !== ourAddress) || 'Unknown';
  }

  return { from, to, isIncoming };
};

export const fetchTransactions = async (
  address: string, 
  lastSeenTxid: string = ''
): Promise<BitcoinTransactionsResponse> => {
  console.log('Fetching transactions for:', address, 'type: BTC', 'lastSeenTxid:', lastSeenTxid);
  
  try {
    const baseUrl = 'https://blockstream.info/api';
    
    const addressInfoResponse = await fetch(`${baseUrl}/address/${address}`);
    if (!addressInfoResponse.ok) {
      throw new Error('Failed to fetch address info');
    }
    const addressInfo = await addressInfoResponse.json();
    const totalTxs = addressInfo.chain_stats.tx_count + addressInfo.mempool_stats.tx_count;
    
    let url = `${baseUrl}/address/${address}/txs`;
    if (lastSeenTxid) {
      url += `/chain/${lastSeenTxid}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const transactions = await response.json();
    
    if (!Array.isArray(transactions)) {
      console.error('Invalid response format:', transactions);
      return {
        transactions: [],
        hasMore: false,
        lastSeenTxid: '',
        totalTxs: 0
      };
    }

    const formattedTransactions = transactions.map((tx: any) => {
      try {
        const ourOutput = tx.vout.find((out: any) => 
          out.scriptpubkey_address === address
        );

        const { from, to, isIncoming } = findRelevantAddresses(tx, address);
        
        let mainValue = 0;
        let changeAddress = undefined;
        let changeAmount = undefined;

        if (isIncoming) {
          mainValue = ourOutput?.value || 0;
        } else {
          const ourInput = tx.vin.find((input: any) => 
            input.prevout?.scriptpubkey_address === address
          );
          
          if (ourInput) {
            const validOutputs = tx.vout
              .filter((out: any) => out.scriptpubkey_address && out.scriptpubkey_address !== address)
              .sort((a: any, b: any) => b.value - a.value);

            mainValue = validOutputs[0]?.value || 0;
            
            // בדוק אם יש עודף
            if (validOutputs.length > 1) {
              const potentialChange = tx.vout.find((out: any) => 
                out.scriptpubkey_address === address && out.value < mainValue
              );
              
              if (potentialChange) {
                changeAddress = potentialChange.scriptpubkey_address;
                changeAmount = formatBitcoinValue(potentialChange.value);
              }
            }
          }
        }

        return {
          hash: tx.txid,
          timestamp: formatTimestamp(tx.status.block_time || Math.floor(Date.now() / 1000)),
          from,
          to,
          value: formatBitcoinValue(mainValue),
          fee: formatBitcoinValue(tx.fee || 0),
          isIncoming,
          changeAddress,
          changeAmount
        };
      } catch (error) {
        console.error('Error processing transaction:', error, tx);
        return {
          hash: tx.txid || 'Unknown',
          timestamp: formatTimestamp(Math.floor(Date.now() / 1000)),
          from: 'Error',
          to: 'Error',
          value: '0.00000000',
          fee: '0.00000000',
          isIncoming: false
        };
      }
    });

    const lastTx = transactions[transactions.length - 1];
    const hasMore = transactions.length >= 25;

    return {
      transactions: formattedTransactions,
      hasMore,
      lastSeenTxid: hasMore ? lastTx.txid : '',
      totalTxs
    };
  } catch (error) {
    console.error('Error fetching Bitcoin transactions:', error);
    throw error;
  }
};

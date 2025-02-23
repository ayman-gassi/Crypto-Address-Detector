import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowDown, ArrowUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from '@tanstack/react-query';
import { validateCryptoAddress } from "@/utils/cryptoValidators";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useFiltersStore } from "@/store/filtersStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fetchBalance } from "@/utils/cryptoUtils";
import { useTransactionsStore } from "@/store/transactionsStore";

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

interface TransactionsTableProps {
  transactions: Transaction[];
  address: string;
  onRowClick: (txHash: string) => void;
  isLoadingAll: boolean;
  allTransactionsLoaded: boolean;
}

const TransactionsTable = ({ 
  transactions: currentPageTransactions, 
  address, 
  onRowClick,
  isLoadingAll,
  allTransactionsLoaded 
}: TransactionsTableProps) => {
  const navigate = useNavigate();
  const { showInUSDT, filters, sortConfig, setShowInUSDT, setFilters, setSortConfig } = useFiltersStore();
  const cryptoType = validateCryptoAddress(address);
  const { transactions: allTransactions } = useTransactionsStore();

  const { data: balanceData } = useQuery({
    queryKey: ['balance', address],
    queryFn: async () => {
      if (!address) return null;
      const cryptoType = validateCryptoAddress(address);
      if (!cryptoType) return null;
      return await fetchBalance(address, cryptoType.symbol);
    },
    enabled: !!address,
  });

  const { data: btcPrice, isLoading: isPriceLoading } = useQuery({
    queryKey: ['btcPrice'],
    queryFn: async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        const data = await response.json();
        return parseFloat(data.price);
      } catch (error) {
        console.error('Error fetching BTC price:', error);
        return null;
      }
    },
    refetchInterval: 60000,
    retry: 3,
  });

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return date.toLocaleString('he-IL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "N/A";
    }
  };

  const formatAddress = (text: string, isSearchedAddress: boolean) => {
    if (!text) return '-';
    const shortText = text.slice(0, 6) + '...';
    if (isSearchedAddress) {
      return (
        <span className="text-[#F97316] font-medium bg-[#F97316]/10 px-2 py-0.5 rounded">
          {shortText}
        </span>
      );
    }
    return <span className="text-muted-foreground">{shortText}</span>;
  };

  const renderAddressColumn = (tx: Transaction, isFrom: boolean) => {
    const addresses = [];
    
    if (tx.isIncoming) {
      if (isFrom) {
        addresses.push(formatAddress(tx.from, false));
      } else {
        addresses.push(formatAddress(address, true));
      }
    } else {
      if (isFrom) {
        addresses.push(formatAddress(address, true));
      } else {
        addresses.push(formatAddress(tx.to, false));
      }
    }
    
    return <div className="space-y-1">{addresses}</div>;
  };

  const renderChangeColumn = (tx: Transaction) => {
    if (!tx.changeAddress) return '-';
    return (
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-2">
          <div className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 font-medium">Change Address</div>
          {formatAddress(tx.changeAddress, false)}
        </div>
        {tx.changeAmount && (
          <div className="text-sm text-orange-500 font-mono">
            {showInUSDT ? convertToUSDT(tx.changeAmount) : `${tx.changeAmount} BTC`}
          </div>
        )}
      </div>
    );
  };

  const convertToUSDT = (btcValue: string) => {
    if (!btcPrice || isPriceLoading) return 'Loading...';
    try {
      const btcAmount = parseFloat(btcValue);
      const usdtAmount = btcAmount * btcPrice;
      return `$${usdtAmount.toFixed(2)}`;
    } catch (error) {
      console.error('Error converting to USDT:', error);
      return 'Error';
    }
  };

  const calculateBalance = () => {
    if (balanceData && balanceData.balance !== 'Error' && balanceData.balance !== 'Check Explorer') {
      return balanceData.balance;
    }
    return '0.00000000';
  };

  const calculateTransactionStats = () => {
    if (!allTransactionsLoaded || !allTransactions.length) {
      return {
        totalReceived: '0.00000000',
        totalSent: '0.00000000',
        totalVolume: '0.00000000',
        transactionCount: 0
      };
    }

    let totalReceived = 0;
    let totalSent = 0;

    allTransactions.forEach(tx => {
      const value = parseFloat(tx.value);
      if (tx.isIncoming) {
        totalReceived += value;
      } else {
        totalSent += value;
      }
    });

    const totalVolume = totalReceived + totalSent;

    return {
      totalReceived: totalReceived.toFixed(8),
      totalSent: totalSent.toFixed(8),
      totalVolume: totalVolume.toFixed(8),
      transactionCount: allTransactions.length
    };
  };

  const handleSort = (field: 'timestamp' | 'value' | 'fee' | 'changeAmount') => {
    setSortConfig({
      field,
      direction: 
        sortConfig.field === field
          ? sortConfig.direction === 'asc'
            ? 'desc'
            : 'asc'
          : 'asc'
    });
  };

  const getSortIcon = (field: 'timestamp' | 'value' | 'fee' | 'changeAmount') => {
    if (sortConfig.field !== field) {
      return <ArrowDown className="w-4 h-4 opacity-20" />;
    }
    if (sortConfig.direction === 'asc') {
      return <ArrowUp className="w-4 h-4 text-primary" />;
    }
    return <ArrowDown className="w-4 h-4 text-primary" />;
  };

  const stats = calculateTransactionStats();
  const balance = calculateBalance();
  const balanceInUSDT = balanceData?.usdValue || 'Loading...';
  const totalReceivedUSDT = btcPrice ? convertToUSDT(stats.totalReceived) : 'Loading...';
  const totalSentUSDT = btcPrice ? convertToUSDT(stats.totalSent) : 'Loading...';
  const totalVolumeUSDT = btcPrice ? convertToUSDT(stats.totalVolume) : 'Loading...';

  return (
    <div className="w-full space-y-4">
      {allTransactionsLoaded && (
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-lg text-blue-400">Transaction Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                This address has transacted {stats.transactionCount} times on the {cryptoType?.symbol.toUpperCase() || "Unknown"} blockchain. 
                It has received a total of {stats.totalReceived} BTC ({totalReceivedUSDT}) and has sent a total of {stats.totalSent} BTC ({totalSentUSDT}).
                The current value of this address is {balance} BTC ({balanceInUSDT}).
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Received</p>
                  <p className="font-semibold">{stats.totalReceived} BTC</p>
                  <p className="text-sm text-green-500">{totalReceivedUSDT}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Sent</p>
                  <p className="font-semibold">{stats.totalSent} BTC</p>
                  <p className="text-sm text-red-500">{totalSentUSDT}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                  <p className="font-semibold">{stats.totalVolume} BTC</p>
                  <p className="text-sm text-blue-500">{totalVolumeUSDT}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="font-semibold">{stats.transactionCount}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filters
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Transactions</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="incoming">Show Incoming</Label>
                <Switch
                  id="incoming"
                  checked={filters.incoming}
                  onCheckedChange={(checked) => setFilters({ ...filters, incoming: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="outgoing">Show Outgoing</Label>
                <Switch
                  id="outgoing"
                  checked={filters.outgoing}
                  onCheckedChange={(checked) => setFilters({ ...filters, outgoing: checked })}
                />
              </div>
              {cryptoType?.symbol.toLowerCase() === 'btc' && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="withChange">Show With Change</Label>
                  <Switch
                    id="withChange"
                    checked={filters.withChange}
                    onCheckedChange={(checked) => setFilters({ ...filters, withChange: checked })}
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          variant="outline"
          onClick={() => setShowInUSDT(!showInUSDT)}
          disabled={isPriceLoading}
        >
          Show in: {showInUSDT ? 'USDT' : cryptoType?.symbol || 'BTC'}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]">Type</TableHead>
            <TableHead 
              className="w-[90px] cursor-pointer hover:text-primary transition-colors group"
              onClick={() => handleSort('timestamp')}
            >
              <div className="flex items-center gap-1">
                Time
                {getSortIcon('timestamp')}
              </div>
            </TableHead>
            <TableHead className="w-[100px]">Hash</TableHead>
            <TableHead className="w-[120px]">From</TableHead>
            <TableHead className="w-[120px]">To</TableHead>
            <TableHead 
              className="text-right w-[120px] cursor-pointer hover:text-primary transition-colors group"
              onClick={() => handleSort('value')}
            >
              <div className="flex items-center justify-end gap-1">
                Value
                {getSortIcon('value')}
              </div>
            </TableHead>
            <TableHead 
              className="text-right w-[80px] cursor-pointer hover:text-primary transition-colors group"
              onClick={() => handleSort('fee')}
            >
              <div className="flex items-center justify-end gap-1">
                Fee
                {getSortIcon('fee')}
              </div>
            </TableHead>
            {cryptoType?.symbol.toLowerCase() === 'btc' && (
              <TableHead className="w-[200px]">Change Address & Amount</TableHead>
            )}
            <TableHead className="w-[40px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentPageTransactions.map((tx) => (
            <TableRow 
              key={tx.hash} 
              className="cursor-pointer hover:bg-muted/50" 
              onClick={() => onRowClick(tx.hash)}
            >
              <TableCell className="whitespace-nowrap">
                {tx.isIncoming ? (
                  <div className="flex items-center gap-1 text-green-500">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="m7 7 5 5 5-5"/><path d="m7 13 5 5 5-5"/></svg>
                    </div>
                    <span className="text-xs font-medium">In</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-500">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="m7 11 5-5 5 5"/><path d="m7 17 5-5 5 5"/></svg>
                    </div>
                    <span className="text-xs font-medium">Out</span>
                  </div>
                )}
              </TableCell>
              <TableCell className="font-mono whitespace-nowrap">{formatDate(tx.timestamp)}</TableCell>
              <TableCell className="font-mono">{tx.hash.slice(0, 6)}...</TableCell>
              <TableCell className="font-mono">
                {renderAddressColumn(tx, true)}
              </TableCell>
              <TableCell className="font-mono">
                {renderAddressColumn(tx, false)}
              </TableCell>
              <TableCell className={`text-right whitespace-nowrap ${tx.isIncoming ? 'text-green-500' : 'text-red-500'}`}>
                {showInUSDT ? convertToUSDT(tx.value) : `${tx.value} ${cryptoType?.symbol}`}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">{tx.fee}</TableCell>
              {cryptoType?.symbol.toLowerCase() === 'btc' && (
                <TableCell>
                  {renderChangeColumn(tx)}
                </TableCell>
              )}
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/transaction/${tx.hash}`);
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionsTable;

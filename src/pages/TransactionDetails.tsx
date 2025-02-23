import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useQuery } from '@tanstack/react-query';

interface TransactionDetail {
  txid: string;
  status: {
    confirmed: boolean;
    block_time: number;
  };
  fee: number;
  vin: Array<{
    prevout: {
      scriptpubkey_address: string;
      value: number;
    };
  }>;
  vout: Array<{
    scriptpubkey_address: string;
    value: number;
  }>;
  size: number;
}

const TransactionDetails = () => {
  const navigate = useNavigate();
  const { txid } = useParams();
  const location = useLocation();
  const searchedAddress = location.state?.searchedAddress;

  console.log('Current state:', { txid, searchedAddress, locationState: location.state });

  const { data: tx, isLoading } = useQuery({
    queryKey: ['transaction', txid],
    queryFn: async () => {
      const response = await fetch(`https://blockstream.info/api/tx/${txid}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json() as Promise<TransactionDetail>;
    },
    enabled: !!txid,
    retry: 3,
    retryDelay: 1000
  });

  if (isLoading) {
    return (
      <div className="min-h-screen w-full">
        <div className="max-w-6xl mx-auto p-4 pt-20">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">Loading transaction details...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="min-h-screen w-full">
        <div className="max-w-6xl mx-auto p-4 pt-20">
          <Card>
            <CardContent className="p-8">
              <div className="text-center">Transaction not found</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalInput = tx.vin.reduce((sum, input) => sum + (input.prevout?.value || 0), 0);
  const totalOutput = tx.vout.reduce((sum, output) => sum + output.value, 0);

  // זיהוי כתובת העודף
  let changeAddress = '';
  if (tx.vout.length === 2) {
    const largestOutput = tx.vout.reduce((prev, current) => 
      (current.value > prev.value) ? current : prev
    );
    
    changeAddress = tx.vout.find(out => out.scriptpubkey_address !== largestOutput.scriptpubkey_address)?.scriptpubkey_address || '';
  }

  return (
    <div className="min-h-screen w-full">
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 pt-20">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
              <div className="text-sm font-medium text-muted-foreground mb-1">Transaction ID</div>
              <div className="text-lg font-medium font-mono break-all">{tx.txid}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Transaction Fee</div>
                <div className="font-medium">{(tx.fee / 100000000).toFixed(8)} BTC</div>
                <div className="text-xs text-muted-foreground">
                  {((tx.fee / tx.size) * 100000000).toFixed(2)} sat/vB
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <p>{tx.status.confirmed ? 'Confirmed' : 'Pending'}</p>
              </div>
              {tx.status.confirmed && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Timestamp</h3>
                  <p>{new Date(tx.status.block_time * 1000).toLocaleString()}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Size</h3>
                <p>{tx.size} bytes</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-muted/50 rounded-lg p-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                    <ArrowUpRight className="w-3 h-3 text-red-500" />
                  </div>
                  Inputs
                </h3>
                <div className="space-y-2">
                  {tx.vin.map((input, index) => (
                    <div key={index} className="p-3 bg-muted rounded-md">
                      <div 
                        className={`font-mono text-sm break-all ${
                          input.prevout?.scriptpubkey_address === searchedAddress 
                            ? 'bg-primary/20 text-primary font-bold p-1 rounded' 
                            : ''
                        }`}
                      >
                        {input.prevout?.scriptpubkey_address}
                      </div>
                      <div className="text-sm text-red-500 font-medium">
                        {(input.prevout?.value / 100000000).toFixed(8)} BTC
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 p-2 bg-muted/50 rounded">
                  <span className="text-sm font-medium">Total Input: </span>
                  <span className="text-red-500 font-medium">{(totalInput / 100000000).toFixed(8)} BTC</span>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                    <ArrowDownRight className="w-3 h-3 text-green-500" />
                  </div>
                  Outputs
                </h3>
                <div className="space-y-2">
                  {tx.vout.map((output, index) => (
                    <div key={index} className="p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <div 
                          className={`font-mono text-sm break-all ${
                            output.scriptpubkey_address === searchedAddress 
                              ? 'bg-primary/20 text-primary font-bold p-1 rounded' 
                              : ''
                          }`}
                        >
                          {output.scriptpubkey_address}
                        </div>
                        {output.scriptpubkey_address === changeAddress && (
                          <span className="text-xs px-2 py-0.5 rounded bg-black/20 border border-black/10">
                            <span className="text-[#F97316]">Change</span>
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-green-500">
                        {(output.value / 100000000).toFixed(8)} BTC
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 p-2 bg-muted/50 rounded">
                  <span className="text-sm font-medium">Total Output: </span>
                  <span className="text-green-500 font-medium">{(totalOutput / 100000000).toFixed(8)} BTC</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionDetails;

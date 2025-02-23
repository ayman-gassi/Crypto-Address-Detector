import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeMouseHandler,
  Controls,
  Viewport,
  useReactFlow,
  ReactFlowProvider,
  EdgeMouseHandler,
  MarkerType,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Search, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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

type NodeStats = {
  totalIn: number;
  totalOut: number;
  transactions: number;
  allTransactions: Transaction[];
};

interface NodeData extends Record<string, unknown> {
  label: string;
  stats: NodeStats;
  address: string;
  isExchange?: boolean;
  totalIn: string;
  totalOut: string;
  transactions: number;
  isSearched: boolean;
}

interface EdgeData {
  transaction: Transaction;
}

interface TransactionFlowProps {
  transactions: Transaction[];
  searchedAddress: string;
  additionalAddresses?: string[];
}

const MAX_NODES = 40;
const EXCHANGE_ADDRESSES = ['Kraken.com', 'Binance.com', 'Coinbase.com', 'Bitfinex.com'];

const nodeDefaults = {
  style: {
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    padding: '20px',
    color: 'white',
    fontSize: '12px',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    width: 120,
    height: 120,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
  },
};

const getNodeLevel = (address: string, transactions: Transaction[], searchedAddress: string): number => {
  let level = 0;
  let currentAddress = searchedAddress;
  let visited = new Set<string>();

  while (currentAddress && !visited.has(currentAddress)) {
    visited.add(currentAddress);
    const outgoingTx = transactions.find(tx => tx.from === currentAddress && tx.to === address);
    if (outgoingTx) {
      return level + 1;
    }
    const incomingTx = transactions.find(tx => tx.to === currentAddress);
    if (!incomingTx) break;
    currentAddress = incomingTx.from;
    level++;
  }

  return level;
};

const TransactionFlowContent = ({ transactions, searchedAddress, additionalAddresses = [] }: TransactionFlowProps) => {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const flowContainer = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'f') {
        if (!document.fullscreenElement) {
          flowContainer.current?.requestFullscreen();
          setIsFullscreen(true);
        } else {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      } else if (event.key.toLowerCase() === 'c') {
        fitView({ duration: 800, padding: 0.2 });
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [fitView]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const uniqueAddresses = new Set<string>();
    const nodeMap = new Map<string, NodeStats>();

    transactions.forEach(tx => {
      uniqueAddresses.add(tx.from);
      uniqueAddresses.add(tx.to);
      if (tx.changeAddress) uniqueAddresses.add(tx.changeAddress);

      const fromStats = nodeMap.get(tx.from) || { totalIn: 0, totalOut: 0, transactions: 0, allTransactions: [] };
      const toStats = nodeMap.get(tx.to) || { totalIn: 0, totalOut: 0, transactions: 0, allTransactions: [] };

      const value = parseFloat(tx.value);
      fromStats.totalOut += value;
      fromStats.transactions += 1;
      fromStats.allTransactions.push(tx);
      nodeMap.set(tx.from, fromStats);

      toStats.totalIn += value;
      toStats.transactions += 1;
      toStats.allTransactions.push(tx);
      nodeMap.set(tx.to, toStats);

      if (tx.changeAddress && tx.changeAmount) {
        const changeStats = nodeMap.get(tx.changeAddress) || { totalIn: 0, totalOut: 0, transactions: 0, allTransactions: [] };
        changeStats.totalIn += parseFloat(tx.changeAmount);
        changeStats.transactions += 1;
        changeStats.allTransactions.push(tx);
        nodeMap.set(tx.changeAddress, changeStats);
      }
    });

    const allAddresses = [searchedAddress, ...additionalAddresses];
    const nodes: Node[] = Array.from(nodeMap.entries()).map(([address, stats], index) => {
      const level = getNodeLevel(address, transactions, searchedAddress);
      const isMainAddress = allAddresses.includes(address);
      const isExchange = EXCHANGE_ADDRESSES.some(exc => address.includes(exc));
      
      const verticalSpacing = 150;
      const yPosition = isMainAddress 
        ? 0 
        : (index * verticalSpacing) - ((nodeMap.size * verticalSpacing) / 2);

      return {
        id: address,
        type: 'default',
        position: { 
          x: level * 400,
          y: yPosition
        },
        data: { 
          label: `${address.slice(0, 6)}...${address.slice(-4)}`,
          stats,
          address,
          isExchange,
          totalIn: stats.totalIn.toFixed(8),
          totalOut: stats.totalOut.toFixed(8),
          transactions: stats.transactions,
          isSearched: isMainAddress
        },
        style: {
          ...nodeDefaults.style,
          borderColor: isExchange ? 'rgba(255, 235, 59, 0.5)' : isMainAddress ? 'rgba(155, 135, 245, 0.5)' : 'rgba(255, 255, 255, 0.2)',
          backgroundColor: isExchange ? 'rgba(255, 235, 59, 0.1)' : isMainAddress ? 'rgba(155, 135, 245, 0.1)' : 'rgba(255, 255, 255, 0.05)',
          width: isMainAddress ? 150 : 120,
          height: isMainAddress ? 150 : 120,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });

    const edges: Edge[] = transactions.map((tx, index) => {
      const value = parseFloat(tx.value);
      const maxWidth = 5;
      const minWidth = 1;
      const width = Math.max(minWidth, Math.min(maxWidth, value));

      const getEdgeOffset = () => {
        const parallelEdges = transactions.filter(
          t => (t.from === tx.from && t.to === tx.to)
        );
        const edgeIndex = parallelEdges.findIndex(t => t.hash === tx.hash);
        return (edgeIndex - (parallelEdges.length - 1) / 2) * 50;
      };

      const offset = getEdgeOffset();

      const edge: Edge = {
        id: tx.hash,
        source: tx.from,
        target: tx.to,
        data: { transaction: tx },
        label: `${tx.value} BTC${tx.isIncoming ? ' (הכנסה)' : ' (הוצאה)'}`,
        labelBgStyle: { 
          fill: tx.isIncoming ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        },
        labelStyle: { 
          fill: tx.isIncoming ? '#22c55e' : '#ef4444',
          fontFamily: 'monospace',
          fontSize: 12,
          fontWeight: 'bold',
        },
        style: {
          stroke: tx.isIncoming ? '#22c55e' : '#ef4444',
          strokeWidth: width,
          opacity: 0.8,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        type: 'smoothstep',
        sourceHandle: `source-${tx.hash}`,
        targetHandle: `target-${tx.hash}`,
        animated: tx.isIncoming,
        labelBgPadding: [8, 4] as [number, number],
        labelShowBg: true,
      };

      if (tx.changeAddress && tx.changeAmount) {
        const changeEdge: Edge = {
          id: `${tx.hash}-change`,
          source: tx.from,
          target: tx.changeAddress,
          data: { transaction: { ...tx, value: tx.changeAmount } },
          label: `${tx.changeAmount} BTC (עודף)`,
          labelBgStyle: { fill: 'rgba(249, 115, 22, 0.1)' },
          labelStyle: { 
            fill: '#f97316',
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: 'bold',
          },
          style: {
            stroke: '#f97316',
            strokeWidth: Math.max(minWidth, Math.min(maxWidth, parseFloat(tx.changeAmount))),
            opacity: 0.8,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          type: 'smoothstep',
          labelBgPadding: [8, 4] as [number, number],
          labelShowBg: true,
        };
        return [edge, changeEdge];
      }

      return [edge];
    }).flat();

    return { nodes, edges };
  }, [transactions, searchedAddress, additionalAddresses, searchQuery]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick: NodeMouseHandler = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data as NodeData);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick: EdgeMouseHandler = useCallback((event: React.MouseEvent, edge: Edge) => {
    if (edge.data?.transaction) {
      setSelectedEdge(edge.data.transaction as Transaction);
    }
  }, []);

  return (
    <div className="h-screen flex bg-[#1a1a1a] text-white relative" ref={flowContainer}>
      <div className="flex-1">
        <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-sm p-4 rounded-lg border border-white/10">
          <div className="space-y-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="חיפוש טרנזקציות..."
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/50"
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-20 left-4 z-20 flex flex-col gap-2">
          <Button
            onClick={() => zoomIn()}
            size="icon"
            variant="outline"
            className="bg-black/80 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/90"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => zoomOut()}
            size="icon"
            variant="outline"
            className="bg-black/80 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/90"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => fitView({ duration: 800, padding: 0.3, includeHiddenNodes: true, minZoom: 0.2, maxZoom: 1.5 })}
            size="icon"
            variant="outline"
            className="bg-black/80 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/90"
            title="מרכז צפיה (C)"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
              <path d="M1.5 2C1.22386 2 1 2.22386 1 2.5V4H2V2.5C2 2.22386 1.77614 2 1.5 2ZM4 1H2.5C2.22386 1 2 1.22386 2 1.5V2H4V1ZM7 1H5V2H7V1ZM10 1H8V2H10V1ZM13 1H11V2H13V1ZM13 4H14V2.5C14 2.22386 13.7761 2 13.5 2C13.2239 2 13 2.22386 13 2.5V4ZM14 7V5H13V7H14ZM14 10V8H13V10H14ZM14 13V11H13V13H14ZM11 14H13.5C13.7761 14 14 13.7761 14 13.5V13H11V14ZM8 14H10V13H8V14ZM5 14H7V13H5V14ZM2 14H4V13H2V14ZM1 13.5C1 13.7761 1.22386 14 1.5 14H2V13H1V13.5ZM1 11V13H2V11H1ZM1 8V10H2V8H1ZM1 5V7H2V5H1Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </Button>
          <Button
            onClick={() => {
              if (!document.fullscreenElement) {
                flowContainer.current?.requestFullscreen();
                setIsFullscreen(true);
              } else {
                document.exitFullscreen();
                setIsFullscreen(false);
              }
            }}
            size="icon"
            variant="outline"
            className="bg-black/80 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/90"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          fitView
          fitViewOptions={{ 
            padding: 0.3,
            includeHiddenNodes: true,
            minZoom: 0.2,
            maxZoom: 1.5
          }}
          attributionPosition="bottom-right"
          className="bg-[#1a1a1a]"
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.2}
          maxZoom={4}
          onViewportChange={(viewport: Viewport) => setZoomLevel(viewport.zoom)}
          nodesFocusable={true}
          edgesFocusable={true}
          elementsSelectable={true}
          nodesConnectable={false}
          nodesDraggable={true}
          preventScrolling={true}
          snapToGrid={true}
          snapGrid={[15, 15]}
        >
          <Background gap={20} color="rgba(255, 255, 255, 0.05)" />
          <Controls className="bg-black/80 border-white/10" />
        </ReactFlow>
      </div>

      <Sheet 
        open={!!(selectedNode || selectedEdge)} 
        onOpenChange={() => {
          setSelectedNode(null);
          setSelectedEdge(null);
        }}
        modal={false}
      >
        <SheetContent 
          side="right" 
          className="w-96 bg-black/95 border-l border-white/10 p-0 fixed inset-y-0 right-0"
        >
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-medium text-white">
              {selectedNode ? 'כתובת פרטים' : 'תורנsezיה פרטים'}
            </h3>
          </div>

          <ScrollArea className="h-[calc(100vh-65px)]">
            <div className="p-4">
              {selectedNode && (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-white/50">כתובת</div>
                    <div className="font-mono text-sm text-white/90 break-all">
                      {selectedNode.address}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-white/50">התקבלות</div>
                      <div className="text-green-400">{selectedNode.totalIn} BTC</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/50">נשלחות</div>
                      <div className="text-red-400">{selectedNode.totalOut} BTC</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-white/50 mb-2">התקדמות אחרונות</div>
                    <div className="space-y-2">
                      {selectedNode.stats.allTransactions.slice(0, 10).map((tx) => (
                        <div key={tx.hash} className="p-2 bg-white/5 rounded-lg">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/50">
                              {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                            </span>
                            <span className={tx.isIncoming ? "text-green-400" : "text-red-400"}>
                              {tx.value} BTC
                            </span>
                          </div>
                          <div className="font-mono text-xs text-white/70 truncate mt-1">
                            {tx.hash}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedEdge && (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-white/50">תורנsezיה קוד</div>
                    <div className="font-mono text-sm text-white/90 break-all">
                      {selectedEdge.hash}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <div>
                      <div className="text-sm text-white/50">מוצא</div>
                      <div className="font-mono text-sm text-white/90">{selectedEdge.from}</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/50">יעד</div>
                      <div className="font-mono text-sm text-white/90">{selectedEdge.to}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-white/50">סכום</div>
                      <div className="text-white">{selectedEdge.value} BTC</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/50">כיסוי</div>
                      <div className="text-white/90">{selectedEdge.fee} BTC</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-white/50">תאריך</div>
                    <div className="text-white/90">
                      {new Date(selectedEdge.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const TransactionFlow = (props: TransactionFlowProps) => (
  <ReactFlowProvider>
    <TransactionFlowContent {...props} />
  </ReactFlowProvider>
);

export default TransactionFlow;

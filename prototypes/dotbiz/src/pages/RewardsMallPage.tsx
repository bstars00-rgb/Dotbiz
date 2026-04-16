import { useState } from "react";
import { Gift, ArrowRightLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useScreenState } from "@/hooks/useScreenState";
import { StateToolbar } from "@/components/StateToolbar";
import { products } from "@/mocks/products";
import { pointsHistory } from "@/mocks/settlement";
import { toast } from "sonner";

export default function RewardsMallPage() {
  const { state, setState } = useScreenState("success");
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [category, setCategory] = useState("all");

  const filtered = category === "all" ? products : products.filter(p => p.category.toLowerCase().includes(category.replace("-", "")));

  if (state === "loading") return (<div className="p-6 space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-10 w-full" /><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-48" />)}</div><StateToolbar state={state} setState={setState} /></div>);
  if (state === "empty") return (<div className="p-6"><Card className="max-w-md mx-auto mt-20 p-6 text-center"><h2 className="text-xl font-semibold">No Products Available</h2><p className="text-muted-foreground mt-2">Check back later for rewards.</p></Card><StateToolbar state={state} setState={setState} /></div>);
  if (state === "error") return (<div className="p-6"><Alert variant="destructive" className="max-w-md mx-auto"><AlertTitle>Rewards Error</AlertTitle><AlertDescription>Failed to load rewards. Please try again.</AlertDescription><Button className="mt-3" onClick={() => setState("success")}><RefreshCw className="h-4 w-4 mr-2" />Retry</Button></Alert><StateToolbar state={state} setState={setState} /></div>);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Rewards Mall</h1>

      <Card className="p-4 flex items-center gap-6">
        <span className="text-muted-foreground">Current Points:</span>
        <span className="text-2xl font-bold">24,500P</span>
        <span className="text-muted-foreground ml-6">Used This Month:</span>
        <span className="font-semibold">3,000P</span>
      </Card>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList>
          {[["all","All"],["gift","Gift Cards"],["travel","Travel"],["electronics","Electronics"],["lifestyle","Lifestyle"],["dining","Dining"],["entertainment","Entertainment"]].map(([v, l]) => <TabsTrigger key={v} value={v}>{l}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filtered.map(p => (
          <Card key={p.id} className="p-0 overflow-hidden card-hover">
            <div className="h-40 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
              <Gift className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="p-4">
              <h3 className="font-medium truncate">{p.name}</h3>
              <p className="text-lg font-bold mt-1">{p.pointsCost.toLocaleString()}P</p>
              <Button className="w-full mt-2" onClick={() => setRedeemOpen(true)}>
                <Gift className="h-4 w-4 mr-1" aria-hidden="true" />Redeem
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Points History</h2>
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead><TableHead>Points</TableHead><TableHead>Balance</TableHead></TableRow></TableHeader>
          <TableBody>{pointsHistory.map((p, i) => <TableRow key={`${p.date}-${p.description}`}><TableCell>{p.date}</TableCell><TableCell><Badge variant={p.type === "Earned" ? "default" : "secondary"}>{p.type}</Badge></TableCell><TableCell>{p.description}</TableCell><TableCell className={p.amount > 0 ? "text-green-600" : "text-red-600"}>{p.amount > 0 ? "+" : ""}{p.amount.toLocaleString()}</TableCell><TableCell>{p.balance.toLocaleString()}</TableCell></TableRow>)}</TableBody>
        </Table>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Transfer Points</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="recipientOp" className="text-sm font-medium">Recipient OP</label>
            <select id="recipientOp" className="w-full border rounded px-3 py-2 text-sm bg-background mt-1">
              <option>Select OP</option><option>Sarah Kim</option><option>Michael Lee</option>
            </select>
          </div>
          <div>
            <label htmlFor="transferAmt" className="text-sm font-medium">Points Amount <span className="text-destructive">*</span></label>
            <Input id="transferAmt" type="number" placeholder="Enter amount" className="mt-1" />
          </div>
          <div>
            <label htmlFor="transferReason" className="text-sm font-medium">Reason</label>
            <Input id="transferReason" placeholder="Transfer reason (optional)" className="mt-1" />
          </div>
          <div className="flex items-end">
            <Button onClick={() => setTransferOpen(true)}><ArrowRightLeft className="h-4 w-4 mr-1" aria-hidden="true" />Transfer</Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={redeemOpen} onOpenChange={setRedeemOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirm Redemption</AlertDialogTitle><AlertDialogDescription>Are you sure you want to redeem this product? Points will be deducted from your balance.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => toast.success("Product Redeemed", { description: "Points have been deducted from your balance." })}>Confirm</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={transferOpen} onOpenChange={setTransferOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Confirm Transfer</AlertDialogTitle><AlertDialogDescription>Are you sure you want to transfer these points? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => toast.success("Points Transferred", { description: "Points have been transferred successfully." })}>Confirm</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StateToolbar state={state} setState={setState} />
    </div>
  );
}

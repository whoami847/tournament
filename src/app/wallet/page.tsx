import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export default function WalletPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:pb-8 pb-24">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            My Wallet
          </CardTitle>
          <CardDescription>View your balance and transaction history.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Wallet functionality is coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

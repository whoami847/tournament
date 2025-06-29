import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="flex justify-center items-start pt-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="user avatar" />
              <AvatarFallback>P1</AvatarFallback>
            </Avatar>
          <CardTitle className="text-2xl">PlayerOne</CardTitle>
          <CardDescription>player.one@email.com</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 text-center">My Stats</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-sm text-muted-foreground">Joined</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold">3</p>
                        <p className="text-sm text-muted-foreground">Wins</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold">25%</p>
                        <p className="text-sm text-muted-foreground">Win Rate</p>
                    </div>
                </div>
            </div>
          <Button className="w-full" variant="outline">
            Edit Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';


export default function BracketPageLoading() {
    return (
        <div className="container mx-auto px-4 py-4 animate-pulse">
            <header className="flex items-center justify-between mb-6">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-6 w-32 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </header>
            <div className="space-y-6">
                <Skeleton className="h-12 w-full max-w-sm mx-auto rounded-full" />
                <Card>
                    <CardContent className="py-16">
                        <div className="flex justify-center items-center gap-4">
                            <Skeleton className="h-32 w-48 rounded-lg" />
                            <Skeleton className="h-32 w-48 rounded-lg" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 md:pb-8 pb-24 animate-pulse">
            <Card className="max-w-4xl mx-auto">
                <CardHeader className="text-center">
                    <Skeleton className="h-9 w-3/4 mx-auto" />
                    <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-1/3 mx-auto" />
                        <Skeleton className="h-4 w-2/3 mx-auto" />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                            <Skeleton className="h-28 w-full" />
                            <Skeleton className="h-28 w-full" />
                            <Skeleton className="h-28 w-full" />
                        </div>
                    </div>
                    <Skeleton className="h-px w-full" />
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-1/3 mx-auto" />
                        <div className="p-4 border rounded-lg bg-background shadow-sm relative">
                            <Skeleton className="h-5 w-16 absolute -top-3 left-4" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                               <div>
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-10 w-full" />
                               </div>
                               <div>
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-10 w-full" />
                               </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <Skeleton className="h-12 w-48" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

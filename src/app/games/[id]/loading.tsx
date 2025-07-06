import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 md:pb-8 pb-24 animate-pulse">
            <Skeleton className="h-10 w-24 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                </div>
                <div className="md:col-span-2 space-y-6">
                    <Skeleton className="h-12 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
            </div>
        </div>
    );
}

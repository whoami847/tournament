'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getBannersStream, addBanner, updateBanner, deleteBanner } from '@/lib/banners-service';
import type { FeaturedBanner } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { BannerForm } from '@/components/admin/banner-form';

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<FeaturedBanner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<FeaturedBanner | undefined>(undefined);
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = getBannersStream((data) => {
            setBanners(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleFormSubmit = async (data: Omit<FeaturedBanner, 'id'>) => {
        setIsSubmitting(true);
        const result = selectedBanner
            ? await updateBanner(selectedBanner.id, data)
            : await addBanner(data);

        if (result.success) {
            toast({
                title: selectedBanner ? "Banner Updated!" : "Banner Added!",
                description: `The banner "${data.name}" has been successfully saved.`,
            });
            setIsDialogOpen(false);
            setSelectedBanner(undefined);
        } else {
            toast({
                title: "Error",
                description: result.error || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (bannerId: string, bannerName: string) => {
        if (!window.confirm(`Are you sure you want to delete the banner "${bannerName}"?`)) return;

        const result = await deleteBanner(bannerId);
        if (result.success) {
            toast({
                title: "Banner Deleted",
                description: `The banner "${bannerName}" has been successfully deleted.`,
            });
        } else {
            toast({
                title: "Error",
                description: result.error || "Failed to delete the banner.",
                variant: "destructive",
            });
        }
    };
    
    const openDialog = (banner?: FeaturedBanner) => {
        setSelectedBanner(banner);
        setIsDialogOpen(true);
    }
    
    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setSelectedBanner(undefined);
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Featured Banners</CardTitle>
                    <CardDescription>Manage the featured banners on the home page.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                    <DialogTrigger asChild>
                        <Button size="sm" onClick={() => openDialog()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Banner
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedBanner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
                            <DialogDescription>
                                Fill in the details for the featured banner.
                            </DialogDescription>
                        </DialogHeader>
                        <BannerForm 
                            banner={selectedBanner}
                            onSubmit={handleFormSubmit}
                            isSubmitting={isSubmitting}
                        />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 2 }).map((_, i) => (
                             <Skeleton key={i} className="h-24 w-full" />
                        ))}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Game</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {banners.length > 0 ? banners.map((banner) => (
                                <TableRow key={banner.id}>
                                    <TableCell>
                                        <Image src={banner.image} alt={banner.name} width={120} height={60} className="rounded-md object-cover aspect-video" data-ai-hint={banner.dataAiHint} />
                                    </TableCell>
                                    <TableCell className="font-medium">{banner.name}</TableCell>
                                    <TableCell>{banner.game}</TableCell>
                                    <TableCell>{banner.date}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openDialog(banner)}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(banner.id, banner.name)} className="text-destructive focus:text-destructive">
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No banners found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}

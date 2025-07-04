'use client';

import { useState, useEffect } from 'react';
import type { WithdrawMethod } from '@/types';
import { getWithdrawMethodsStream, addWithdrawMethod, updateWithdrawMethod, deleteWithdrawMethod } from '@/lib/withdraw-methods-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { WithdrawMethodForm } from '@/components/admin/withdraw-method-form';
import { Badge } from '@/components/ui/badge';

export default function AdminWithdrawMethodsPage() {
    const [methods, setMethods] = useState<WithdrawMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<WithdrawMethod | undefined>(undefined);
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = getWithdrawMethodsStream((data) => {
            setMethods(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleFormSubmit = async (data: any) => {
        setIsSubmitting(true);
        const result = selectedMethod
            ? await updateWithdrawMethod(selectedMethod.id, data)
            : await addWithdrawMethod(data);

        if (result.success) {
            toast({
                title: selectedMethod ? "Method Updated!" : "Method Added!",
                description: `"${data.name}" has been successfully saved.`,
            });
            setIsDialogOpen(false);
            setSelectedMethod(undefined);
        } else {
            toast({
                title: "Error",
                description: result.error || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (methodId: string, methodName: string) => {
        if (!window.confirm(`Are you sure you want to delete the method "${methodName}"?`)) return;

        const result = await deleteWithdrawMethod(methodId);
        if (result.success) {
            toast({ title: "Method Deleted" });
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        }
    };
    
    const openDialog = (method?: WithdrawMethod) => {
        setSelectedMethod(method);
        setIsDialogOpen(true);
    }
    
    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) setSelectedMethod(undefined);
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Withdrawal Methods</CardTitle>
                    <CardDescription>Configure user withdrawal options.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                    <DialogTrigger asChild>
                        <Button size="sm" onClick={() => openDialog()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Method
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{selectedMethod ? 'Edit Method' : 'Add New Method'}</DialogTitle>
                        </DialogHeader>
                        <WithdrawMethodForm 
                            method={selectedMethod}
                            onSubmit={handleFormSubmit}
                            isSubmitting={isSubmitting}
                        />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => ( <Skeleton key={i} className="h-16 w-full" /> ))}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Fee</TableHead>
                                <TableHead>Limits (Min/Max)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {methods.length > 0 ? methods.map((method) => (
                                <TableRow key={method.id}>
                                    <TableCell className="font-medium">{method.name}</TableCell>
                                    <TableCell>{method.feePercentage}%</TableCell>
                                    <TableCell>{method.minAmount} / {method.maxAmount}</TableCell>
                                    <TableCell>
                                        <Badge variant={method.status === 'active' ? 'default' : 'secondary'} className={method.status === 'active' ? 'bg-green-500' : ''}>
                                            {method.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openDialog(method)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleDelete(method.id, method.name)} className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No methods configured.
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

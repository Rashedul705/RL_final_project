
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";


type Inquiry = {
    id: string;
    name: string;
    phone: string;
    message: string;
    status: 'New' | 'Read';
};

const initialInquiries: Inquiry[] = [
    { id: 'INQ001', name: 'John Doe', phone: '01234567890', message: 'I have a question about product XYZ. I was wondering about the material and if it comes in other colors. Thank you!', status: 'New' },
    { id: 'INQ002', name: 'Jane Smith', phone: '01987654321', message: 'When will the floral bedsheet be back in stock? I have been waiting for it for a while.', status: 'Read' },
];

export default function AdminInquiriesPage() {
    const { toast } = useToast();
    const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleMarkAsRead = (inquiryId: string) => {
        setInquiries(prev => prev.map(inq => inq.id === inquiryId ? { ...inq, status: 'Read' } : inq));
        toast({
            title: 'Marked as Read',
        });
    };
    
    const handleSendReply = () => {
        if (!replyMessage.trim()) {
             toast({
                title: 'Cannot send empty reply',
                variant: 'destructive',
            });
            return;
        }
        // In a real app, you would integrate with an SMS/Email service here.
        console.log(`Replying to ${selectedInquiry?.name} (${selectedInquiry?.phone}): ${replyMessage}`);
        
        toast({
            title: 'Reply Sent!',
            description: `Your message to ${selectedInquiry?.name} has been sent.`,
        });

        if(selectedInquiry){
            // Mark the inquiry as read after replying
            setInquiries(prev => prev.map(inq => inq.id === selectedInquiry.id ? { ...inq, status: 'Read' } : inq));
        }

        setReplyMessage('');
        setIsDialogOpen(false);
        setSelectedInquiry(null);
    };

    const handleOpenDialog = (inquiry: Inquiry) => {
        setSelectedInquiry(inquiry);
        setIsDialogOpen(true);
    };

    return (
        <div className="flex flex-col">
            <header className="flex h-16 items-center justify-between border-b bg-background px-6 shrink-0">
                <h1 className="text-xl font-semibold tracking-tight">Customer Inquiries</h1>
            </header>
            <main className="flex-1 p-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>All Inquiries</CardTitle>
                        <CardDescription>View and manage all customer messages.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Inquiry ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inquiries.map(inquiry => (
                                     <TableRow key={inquiry.id}>
                                        <TableCell className="font-medium">{inquiry.id}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{inquiry.name}</div>
                                            <div className="text-sm text-muted-foreground">{inquiry.phone}</div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{inquiry.message}</TableCell>
                                        <TableCell>
                                            <Badge variant={inquiry.status === 'New' ? 'default' : 'secondary'}>
                                                {inquiry.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onSelect={() => handleOpenDialog(inquiry)}>View Details</DropdownMenuItem>
                                                {inquiry.status === 'New' && (
                                                    <DropdownMenuItem onSelect={() => handleMarkAsRead(inquiry.id)}>Mark as Read</DropdownMenuItem>
                                                )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Inquiry from {selectedInquiry?.name}</DialogTitle>
                            <DialogDescription>
                                Phone: {selectedInquiry?.phone}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div>
                                <Label className="font-semibold">Customer's Message:</Label>
                                <p className="text-sm text-muted-foreground mt-1 p-3 bg-muted rounded-md">{selectedInquiry?.message}</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reply-message" className="font-semibold">Your Reply:</Label>
                                <Textarea 
                                    id="reply-message"
                                    placeholder={`Type your reply to ${selectedInquiry?.name}...`} 
                                    rows={5}
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="button" onClick={handleSendReply}>Send Reply</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}

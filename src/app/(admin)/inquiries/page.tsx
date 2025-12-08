
'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';


type Inquiry = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subject: string;
  message: string;
  date: Date;
  status: 'Pending' | 'Resolved' | 'Closed';
};

const mockInquiries: Inquiry[] = [
  {
    id: 'INQ-001',
    customerName: 'Aarav Kumar',
    customerEmail: 'aarav.kumar@example.com',
    customerPhone: '01711223344',
    subject: 'Question about Three-Piece Sizing',
    message: 'Hello, I was looking at the "Elegant Floral Three-Piece" and was wondering about the sizing. I am usually a medium, but I wanted to confirm your size chart. Can you please provide the measurements for the medium size?',
    date: new Date(new Date().setDate(new Date().getDate() - 1)),
    status: 'Pending',
  },
  {
    id: 'INQ-002',
    customerName: 'Fatima Al-Jamil',
    customerEmail: 'fatima.j@example.com',
    customerPhone: '01822334455',
    subject: 'Issue with recent order #ORD045',
    message: 'Hi there, I received my order #ORD045 today and unfortunately, the "Soft Cotton Hijab" I ordered came in the wrong color. I ordered black but received a navy blue one. How can I get this exchanged?',
    date: new Date(new Date().setDate(new Date().getDate() - 2)),
    status: 'Pending',
  },
  {
    id: 'INQ-003',
    customerName: 'Zayn Chowdhury',
    customerEmail: 'zayn.c@example.com',
    customerPhone: '01933445566',
    subject: 'Delivery time to Chittagong?',
    message: 'I am planning to place an order for a bedsheet. Could you let me know the estimated delivery time for an address in Chittagong? Thank you.',
    date: new Date(new Date().setDate(new Date().getDate() - 3)),
    status: 'Resolved',
  },
  {
    id: 'INQ-004',
    customerName: 'Ishrat Jahan',
    customerEmail: 'ishrat.jahan@example.com',
    customerPhone: '01644556677',
    subject: 'Bulk Order Inquiry',
    message: 'We are interested in placing a bulk order for about 20 of the "Georgette Patterned Hijab" for an event. Do you offer any discounts for bulk purchases? Please let us know.',
    date: new Date(new Date().setDate(new Date().getDate() - 5)),
    status: 'Pending',
  },
  {
    id: 'INQ-005',
    customerName: 'Ryan D\'costa',
    customerEmail: 'ryan.dcosta@example.com',
    customerPhone: '01555667788',
    subject: 'Feedback on my recent purchase',
    message: 'Just wanted to say that I am extremely happy with the "Luxury King Size Bedsheet" I bought. The quality is fantastic and it feels amazing. Great product!',
    date: new Date(new Date().setDate(new Date().getDate() - 10)),
    status: 'Closed',
  },
];


export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>(mockInquiries);
  const [filter, setFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const { toast } = useToast();

  const filteredInquiries = useMemo(() => {
    if (filter === 'all') {
      return inquiries;
    }
    return inquiries.filter(inquiry => inquiry.status.toLowerCase() === filter);
  }, [inquiries, filter]);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }
  
  const handleStatusChange = (inquiryId: string, newStatus: Inquiry['status']) => {
    setInquiries(currentInquiries =>
      currentInquiries.map(inq =>
        inq.id === inquiryId ? { ...inq, status: newStatus } : inq
      )
    );
    if(selectedInquiry?.id === inquiryId) {
        setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : null)
    }
  };
  
  const handleSendReply = () => {
    // This is a mock function. In a real app, you would send the reply.
    toast({
        title: 'Reply Sent!',
        description: 'Your reply has been successfully sent to the customer.'
    });
    // Optionally close the sheet and mark as resolved
    if(selectedInquiry){
        handleStatusChange(selectedInquiry.id, 'Resolved');
    }
    setSelectedInquiry(null);
  }

  const getStatusVariant = (status: Inquiry['status']) => {
    switch (status) {
        case 'Pending': return 'secondary';
        case 'Resolved': return 'default';
        case 'Closed': return 'outline';
        default: return 'default';
    }
  }


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-xl font-semibold tracking-tight">Customer Inquiries</h1>
            <p className="text-muted-foreground">Manage messages and support tickets.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.length > 0 ? (
                    filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>
                              {getInitials(inquiry.customerName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid gap-0.5">
                            <div className="font-medium">{inquiry.customerName}</div>
                            <div className="text-xs text-muted-foreground">{inquiry.customerEmail}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{inquiry.subject}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {formatDistanceToNow(inquiry.date, { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(inquiry.status)}>
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
                            <DropdownMenuItem onSelect={() => setSelectedInquiry(inquiry)}>
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No inquiries found for this filter.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail View Sheet */}
      <Sheet open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <SheetContent className="sm:max-w-xl w-full flex flex-col">
            {selectedInquiry && (
                <>
                    <SheetHeader>
                        <SheetTitle>Inquiry Details</SheetTitle>
                        <SheetDescription>{selectedInquiry.subject}</SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto pr-4 -mr-6">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h4 className="font-semibold">Customer Information</h4>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p><strong>Name:</strong> {selectedInquiry.customerName}</p>
                                    <p><strong>Email:</strong> {selectedInquiry.customerEmail}</p>
                                    <p><strong>Phone:</strong> {selectedInquiry.customerPhone}</p>
                                </div>
                            </div>
                            
                             <div className="space-y-2">
                                <h4 className="font-semibold">Message</h4>
                                <div className="text-sm text-muted-foreground rounded-md border bg-muted/50 p-4 whitespace-pre-wrap">
                                    {selectedInquiry.message}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="reply" className="font-semibold">Write a reply</Label>
                                <Textarea id="reply" placeholder="Type your response here..." rows={6} />
                            </div>

                             <div className="space-y-2">
                                <Label htmlFor="status" className="font-semibold">Update Status</Label>
                                <Select 
                                    value={selectedInquiry.status}
                                    onValueChange={(newStatus: Inquiry['status']) => handleStatusChange(selectedInquiry.id, newStatus)}
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Change status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Resolved">Resolved</SelectItem>
                                        <SelectItem value="Closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <SheetFooter className="mt-auto pt-4">
                        <SheetClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </SheetClose>
                        <Button onClick={handleSendReply}>Send Reply</Button>
                    </SheetFooter>
                </>
            )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

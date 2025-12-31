'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { apiClient } from '@/lib/api-client';

type Inquiry = {
  _id: string; // Mongoose ID
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'new' | 'read' | 'replied'; // Matching Mongoose Schema
  createdAt: string;
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const data = await apiClient.get<Inquiry[]>('/inquiries');
      if (data) {
        setInquiries(data);
      }
    } catch (error) {
      console.error("Failed to fetch inquiries", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load inquiries."
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredInquiries = useMemo(() => {
    if (filter === 'all') {
      return inquiries;
    }
    // Mapped status for filter simplicity if needed, but here we just check raw string
    // Our schema uses lowercase 'new', 'read', 'replied'
    // The tabs might want 'pending', 'resolved' etc. 
    // Let's align the tabs to the schema or map them.
    // Schema: new, read, replied
    // Tabs: new, read, replied
    return inquiries.filter(inquiry => inquiry.status === filter);
  }, [inquiries, filter]);

  const handleStatusChange = async (inquiryId: string, newStatus: Inquiry['status']) => {
    // In real app, call API to update status
    // For now update local state
    setInquiries(currentInquiries =>
      currentInquiries.map(inq =>
        inq._id === inquiryId ? { ...inq, status: newStatus } : inq
      )
    );
    if (selectedInquiry?._id === inquiryId) {
      setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : null)
    }
  };

  const handleSendReply = () => {
    toast({
      title: 'Reply Sent!',
      description: 'Your reply has been successfully sent to the customer.'
    });
    // Optimistically update to replied
    if (selectedInquiry) {
      handleStatusChange(selectedInquiry._id, 'replied');
    }
    setSelectedInquiry(null);
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'new': return 'default'; // high attention
      case 'read': return 'secondary';
      case 'replied': return 'outline';
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
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
              <TabsTrigger value="replied">Replied</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.length > 0 ? (
                    filteredInquiries.map((inquiry) => (
                      <TableRow key={inquiry._id}>
                        <TableCell>
                          <div className="grid gap-0.5">
                            <div className="font-medium">{inquiry.name}</div>
                            <div className="text-xs text-muted-foreground">{inquiry.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{inquiry.subject || "(No Subject)"}</TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {inquiry.createdAt ? formatDistanceToNow(new Date(inquiry.createdAt), { addSuffix: true }) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(inquiry.status) as any}>
                            {inquiry.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => setSelectedInquiry(inquiry)}>
                            View Details
                          </Button>
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
            )}
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
                      <p><strong>Name:</strong> {selectedInquiry.name}</p>
                      <p><strong>Email:</strong> {selectedInquiry.email}</p>
                      <p><strong>Phone:</strong> {selectedInquiry.phone || 'N/A'}</p>
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
                      onValueChange={(newStatus: Inquiry['status']) => handleStatusChange(selectedInquiry._id, newStatus)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                        <SelectItem value="replied">Replied</SelectItem>
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

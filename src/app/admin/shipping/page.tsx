'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Truck } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

type ShippingMethod = {
  _id?: string;
  name: string;
  cost: number;
  estimatedTime?: string;
  status: 'active' | 'inactive';
};

export default function AdminShippingPage() {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // State for specific methods
  const [insideDhaka, setInsideDhaka] = useState<ShippingMethod>({ name: 'Inside Dhaka', cost: 80, status: 'active' });
  const [outsideDhaka, setOutsideDhaka] = useState<ShippingMethod>({ name: 'Outside Dhaka', cost: 150, status: 'active' });
  const [insideRajshahi, setInsideRajshahi] = useState<ShippingMethod>({ name: 'Inside Rajshahi', cost: 60, status: 'active' });
  const [freeShipping, setFreeShipping] = useState<ShippingMethod>({ name: 'Free Shipping', cost: 0, status: 'inactive' });

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<ShippingMethod[]>('/shipping');
      if (data) {
        const d = data.find(m => m.name === 'Inside Dhaka');
        if (d) setInsideDhaka(d);

        const o = data.find(m => m.name === 'Outside Dhaka');
        if (o) setOutsideDhaka(o);

        const r = data.find(m => m.name === 'Inside Rajshahi');
        if (r) setInsideRajshahi(r);

        const f = data.find(m => m.name === 'Free Shipping');
        if (f) setFreeShipping(f);
      }
    } catch (error) {
      console.error("Failed to fetch shipping methods", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load shipping settings.' });
    } finally {
      setLoading(false);
    }
  };

  const saveMethod = async (method: ShippingMethod) => {
    try {
      if (method._id) {
        return await apiClient.put<ShippingMethod>(`/shipping/${method._id}`, method);
      } else {
        return await apiClient.post<ShippingMethod>('/shipping', method);
      }
    } catch (e) {
      throw e;
    }
  };

  const handleSaveAll = async () => {
    try {
      setLoading(true);
      const [currD, currO, currR, currF] = await Promise.all([
        saveMethod(insideDhaka),
        saveMethod(outsideDhaka),
        saveMethod(insideRajshahi),
        saveMethod(freeShipping)
      ]);

      // Update state with returned objects (containing _id)
      setInsideDhaka(currD);
      setOutsideDhaka(currO);
      setInsideRajshahi(currR);
      setFreeShipping(currF);

      toast({ title: 'Success', description: 'Shipping charges updated successfully.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Shipping Charge Management</h1>
        <Button onClick={handleSaveAll} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Free Shipping Toggle */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg font-medium">Free Shipping Campaign</CardTitle>
              <CardDescription>Enable this to make shipping free for all orders regardless of location.</CardDescription>
            </div>
            <Switch
              checked={freeShipping.status === 'active'}
              onCheckedChange={(checked) => setFreeShipping({ ...freeShipping, status: checked ? 'active' : 'inactive' })}
            />
          </CardHeader>
        </Card>

        {/* Regional Charges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Regional Delivery Charges
            </CardTitle>
            <CardDescription>Set the standard delivery cost for different areas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Inside Dhaka</Label>
                <p className="text-sm text-muted-foreground">Standard delivery charge for Dhaka city.</p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">BDT</span>
                <Input
                  type="number"
                  className="pl-12"
                  value={insideDhaka.cost}
                  onChange={(e) => setInsideDhaka({ ...insideDhaka, cost: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Inside Rajshahi</Label>
                <p className="text-sm text-muted-foreground">Special rate for Rajshahi city area.</p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">BDT</span>
                <Input
                  type="number"
                  className="pl-12"
                  value={insideRajshahi.cost}
                  onChange={(e) => setInsideRajshahi({ ...insideRajshahi, cost: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Outside Dhaka (Nationwide)</Label>
                <p className="text-sm text-muted-foreground">Charge for all other districts/areas.</p>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-muted-foreground">BDT</span>
                <Input
                  type="number"
                  className="pl-12"
                  value={outsideDhaka.cost}
                  onChange={(e) => setOutsideDhaka({ ...outsideDhaka, cost: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}

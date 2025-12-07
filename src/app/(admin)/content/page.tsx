
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminContentPage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold tracking-tight">Site Content</h1>
                <Button>Save Changes</Button>
            </div>
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Hero Banner</CardTitle>
                        <CardDescription>Update the main promotional banner on the homepage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="picture">Banner Image</Label>
                            <Input id="picture" type="file" />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Why Us Section</CardTitle>
                        <CardDescription>Edit the content for the "Why Choose Us" section.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea 
                            defaultValue="We believe in more than just clothing; we believe in a lifestyle of elegance and quality. Our collections are curated with a keen eye for premium materials, timeless design, and the latest fashion insights to ensure you look and feel your absolute best."
                            rows={5}
                        />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>FAQ Section</CardTitle>
                        <CardDescription>Add, edit, or remove frequently asked questions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                             <Label>Question 1</Label>
                             <Input defaultValue="What are the delivery charges?" />
                             <Label>Answer 1</Label>
                             <Textarea defaultValue="Inside Rajshahi city, the delivery charge is 60 Taka. For the rest of Bangladesh, it is 120 Taka." />
                        </div>
                        <div className="space-y-2">
                             <Label>Question 2</Label>
                             <Input defaultValue="How long does delivery take?" />
                             <Label>Answer 2</Label>
                             <Textarea defaultValue="Deliveries inside Rajshahi are typically completed within 24-48 hours. For other locations in Bangladesh, it may take 3-5 business days." />
                        </div>
                        <Button variant="outline">Add New FAQ</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

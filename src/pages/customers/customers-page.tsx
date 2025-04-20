import { useState, useEffect } from "react";
import { Loader2, AlertTriangle, Search, Users, Trash } from "lucide-react";
import { CustomerForm } from "../../components/customers/customer-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

interface Customer {
  _id: string;
  customerName: string;
  customerType: "Individual" | "Business";
  email: string;
  contactNumber: string;
  address: string;
  due: number;
}

export function CustomersPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Ensure customers is an array and filter safely
  const safeCustomers = Array.isArray(customers) ? customers : [];

  const filteredCustomers = safeCustomers.filter((customer) => {
    if (!customer) return false;

    const name = customer.customerName?.toLowerCase() || "";
    const email = customer.email?.toLowerCase() || "";
    const type = customer.customerType?.toLowerCase() || "";
    const searchTermLower = searchTerm.toLowerCase();

    return (
      name.includes(searchTermLower) ||
      email.includes(searchTermLower) ||
      type.includes(searchTermLower)
    );
  });

  const handleDelete = async (id: string) => {
    if (!id) return;
    try {
      await apiClient.delete(`/customers/${id}`);
      toast.success("Customer deleted successfully");
      setCustomers((prevCustomers) =>
        prevCustomers.filter((customer) => customer._id !== id)
      );
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete customer");
    }
  };

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/customers");
      setCustomers(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Something went wrong while fetching customers.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleRefresh = () => {
    fetchCustomers();
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <CustomerForm onSuccess={() => handleRefresh()} />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
          <h3 className="text-lg font-semibold mb-1">
            Failed to load customers
          </h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading the customer data
          </p>
          <Button variant="outline" onClick={() => handleRefresh()}>
            Try Again
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search customers..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact Number</TableHead>
                    <TableHead>Due Amount</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Users className="h-8 w-8 mb-2" />
                          {searchTerm
                            ? "No customers found"
                            : "No customers yet"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer?._id || Math.random()}>
                        <TableCell className="font-medium">
                          {customer?.customerName || "Unnamed Customer"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {customer?.customerType || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>{customer?.email || "-"}</TableCell>
                        <TableCell>{customer?.contactNumber || "-"}</TableCell>
                        <TableCell>
                          ${Number(customer?.due || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-3">
                            <CustomerForm
                              initialData={customer}
                              id={customer._id}
                              onSuccess={() => handleRefresh()}
                            />
                            <Button
                              onClick={() => handleDelete(customer._id)}
                              variant="destructive"
                              size="icon">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

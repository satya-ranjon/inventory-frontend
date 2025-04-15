"use client";

import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { MoreHorizontal, Pencil, Trash2, Search, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useCustomers } from "../../hooks/use-customers";

interface Customer {
  _id: string;
  displayName: string;
  customerType: string;
  email: string;
  phone: {
    workPhone: string;
    mobile: string;
  };
  billingAddress: {
    country: string;
    city: string;
    state: string;
  };
  companyName?: string;
  reportingTags?: string[];
}

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const navigate = useNavigate();
  const { deleteCustomer } = useCustomers();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  // Ensure customers is an array and filter safely
  const safeCustomers = Array.isArray(customers) ? customers : [];

  const filteredCustomers = safeCustomers.filter((customer) => {
    if (!customer) return false;

    const displayName = customer.displayName?.toLowerCase() || "";
    const email = customer.email?.toLowerCase() || "";
    const companyName = customer.companyName?.toLowerCase() || "";
    const searchTermLower = searchTerm.toLowerCase();

    return (
      displayName.includes(searchTermLower) ||
      email.includes(searchTermLower) ||
      companyName.includes(searchTermLower)
    );
  });

  const handleDelete = async (id: string) => {
    if (!id) return;
    setCustomerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      await deleteCustomer(customerToDelete);
      setDeleteDialogOpen(false);
    }
  };

  return (
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
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="h-8 w-8 mb-2" />
                    {searchTerm ? "No customers found" : "No customers yet"}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer?._id || Math.random()}>
                  <TableCell className="font-medium">
                    {customer?.displayName || "Unnamed Customer"}
                  </TableCell>
                  <TableCell>{customer?.customerType || "-"}</TableCell>
                  <TableCell>{customer?.companyName || "-"}</TableCell>
                  <TableCell>{customer?.email || "-"}</TableCell>
                  <TableCell>
                    {customer?.phone?.workPhone ||
                      customer?.phone?.mobile ||
                      "-"}
                  </TableCell>
                  <TableCell>
                    {customer?.billingAddress
                      ? `${customer.billingAddress.city || ""}, ${customer.billingAddress.state || ""}, ${customer.billingAddress.country || ""}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {customer?.reportingTags &&
                    Array.isArray(customer.reportingTags) &&
                    customer.reportingTags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {customer.reportingTags
                          .slice(0, 2)
                          .map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        {customer.reportingTags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{customer.reportingTags.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        No tags
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/dashboard/customers/${customer?._id}`)
                          }>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(customer?._id || "")}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

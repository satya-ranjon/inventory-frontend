import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import { useEffect } from "react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Switch } from "../ui/switch";
import { itemSchema, type ItemFormValues } from "../../lib/schemas";
import { useItems } from "../../hooks/use-items";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface ItemFormProps {
  item?: ItemFormValues;
}

export function ItemForm({ item }: ItemFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createItem, updateItem, isCreating, isUpdating } = useItems();

  console.log("ItemForm received props:", item);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: "",
      sku: "",
      isReturnable: false,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        unit: "cm",
      },
      weight: {
        value: 0,
        unit: "kg",
      },
      manufacturer: "",
      brand: "",
      upc: "",
      ean: "",
      isbn: "",
      mpn: "",
      sellingPrice: 0,
      salesAccount: "",
      description: "",
      tax: "",
      costAccount: "",
      preferredVendor: "",
      inventoryAccount: "",
      openingStock: 0,
      reorderPoint: 0,
      inventoryValuationMethod: "FIFO",
    },
  });

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      console.log("Resetting form with item data:", item);
      reset(item);
    }
  }, [item, reset]);

  const onSubmit = (data: ItemFormValues) => {
    console.log("Form submitted with data:", data);
    if (id) {
      updateItem({ id, data });
    } else {
      createItem(data);
    }
    navigate("/dashboard/items");
  };

  const isLoading = isCreating || isUpdating;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="details">Additional Details</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" {...register("sku")} />
                  {errors.sku && (
                    <p className="text-sm text-red-500">{errors.sku.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input id="manufacturer" {...register("manufacturer")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" {...register("brand")} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    {...register("description")}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isReturnable"
                    checked={watch("isReturnable")}
                    onCheckedChange={(checked) =>
                      setValue("isReturnable", checked)
                    }
                  />
                  <Label htmlFor="isReturnable">Returnable</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    {...register("sellingPrice", { valueAsNumber: true })}
                  />
                  {errors.sellingPrice && (
                    <p className="text-sm text-red-500">
                      {errors.sellingPrice.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salesAccount">Sales Account</Label>
                  <Input id="salesAccount" {...register("salesAccount")} />
                  {errors.salesAccount && (
                    <p className="text-sm text-red-500">
                      {errors.salesAccount.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costAccount">Cost Account</Label>
                  <Input id="costAccount" {...register("costAccount")} />
                  {errors.costAccount && (
                    <p className="text-sm text-red-500">
                      {errors.costAccount.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax">Tax</Label>
                  <Input id="tax" {...register("tax")} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="inventory">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="openingStock">Opening Stock</Label>
                  <Input
                    id="openingStock"
                    type="number"
                    {...register("openingStock", { valueAsNumber: true })}
                  />
                  {errors.openingStock && (
                    <p className="text-sm text-red-500">
                      {errors.openingStock.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reorderPoint">Reorder Point</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    {...register("reorderPoint", { valueAsNumber: true })}
                  />
                  {errors.reorderPoint && (
                    <p className="text-sm text-red-500">
                      {errors.reorderPoint.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inventoryAccount">Inventory Account</Label>
                  <Input
                    id="inventoryAccount"
                    {...register("inventoryAccount")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredVendor">Preferred Vendor</Label>
                  <Input
                    id="preferredVendor"
                    {...register("preferredVendor")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inventoryValuationMethod">
                    Inventory Valuation Method
                  </Label>
                  <Select
                    defaultValue={watch("inventoryValuationMethod")}
                    onValueChange={(value) =>
                      setValue("inventoryValuationMethod", value)
                    }>
                    <SelectTrigger id="inventoryValuationMethod">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIFO">FIFO</SelectItem>
                      <SelectItem value="LIFO">LIFO</SelectItem>
                      <SelectItem value="Average">Average</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dimensions.length">Length</Label>
                  <Input
                    id="dimensions.length"
                    type="number"
                    step="0.1"
                    {...register("dimensions.length", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions.width">Width</Label>
                  <Input
                    id="dimensions.width"
                    type="number"
                    step="0.1"
                    {...register("dimensions.width", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions.height">Height</Label>
                  <Input
                    id="dimensions.height"
                    type="number"
                    step="0.1"
                    {...register("dimensions.height", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions.unit">Dimension Unit</Label>
                  <Select
                    defaultValue={watch("dimensions.unit")}
                    onValueChange={(value) =>
                      setValue("dimensions.unit", value)
                    }>
                    <SelectTrigger id="dimensions.unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">Centimeter</SelectItem>
                      <SelectItem value="m">Meter</SelectItem>
                      <SelectItem value="inches">Inches</SelectItem>
                      <SelectItem value="ft">Feet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight.value">Weight</Label>
                  <Input
                    id="weight.value"
                    type="number"
                    step="0.01"
                    {...register("weight.value", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight.unit">Weight Unit</Label>
                  <Select
                    defaultValue={watch("weight.unit")}
                    onValueChange={(value) => setValue("weight.unit", value)}>
                    <SelectTrigger id="weight.unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram</SelectItem>
                      <SelectItem value="g">Gram</SelectItem>
                      <SelectItem value="lb">Pound</SelectItem>
                      <SelectItem value="oz">Ounce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="upc">UPC</Label>
                  <Input id="upc" {...register("upc")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ean">EAN</Label>
                  <Input id="ean" {...register("ean")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input id="isbn" {...register("isbn")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mpn">MPN</Label>
                  <Input id="mpn" {...register("mpn")} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : item ? "Update Item" : "Create Item"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

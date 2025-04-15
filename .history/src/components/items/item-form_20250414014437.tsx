import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";

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

interface ItemFormProps {
  item?: ItemFormValues;
}

export function ItemForm({ item }: ItemFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createItem, updateItem, isCreating, isUpdating } = useItems();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: item
      ? {
          type: item.type,
          name: item.name,
          sku: item.sku,
          unit: item.unit,
          isReturnable: item.isReturnable,
          dimensions: {
            length: item.dimensions.length,
            width: item.dimensions.width,
            height: item.dimensions.height,
            unit: item.dimensions.unit,
          },
          weight: {
            value: item.weight.value,
            unit: item.weight.unit,
          },
          manufacturer: item.manufacturer,
          brand: item.brand,
          sellingPrice: item.sellingPrice,
          salesAccount: item.salesAccount,
          description: item.description,
          tax: item.tax,
          costPrice: item.costPrice,
          costAccount: item.costAccount,
          inventoryAccount: item.inventoryAccount,
          openingStock: item.openingStock,
          reorderPoint: item.reorderPoint,
        }
      : {
          type: "Goods",
          name: "",
          sku: "",
          unit: "piece",
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
          sellingPrice: 0,
          salesAccount: "",
          description: "",
          tax: "",
          costPrice: 0,
          costAccount: "",
          inventoryAccount: "",
          openingStock: 0,
          reorderPoint: 0,
        },
  });

  const onSubmit = (data: ItemFormValues) => {
    if (item && id) {
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
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                defaultValue={watch("type")}
                onValueChange={(value) => setValue("type", value)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Goods">Goods</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
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
              <Label htmlFor="unit">Unit</Label>
              <Select
                defaultValue={watch("unit")}
                onValueChange={(value) => setValue("unit", value)}>
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="kg">Kilogram</SelectItem>
                  <SelectItem value="liter">Liter</SelectItem>
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-sm text-red-500">{errors.unit.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Selling Price</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                {...register("sellingPrice", { valueAsNumber: true })}
              />
              {errors.sellingPrice && (
                <p className="text-sm text-red-500">
                  {errors.sellingPrice.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                {...register("costPrice", { valueAsNumber: true })}
              />
              {errors.costPrice && (
                <p className="text-sm text-red-500">
                  {errors.costPrice.message}
                </p>
              )}
            </div>

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

            {/* Additional fields */}
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input id="manufacturer" {...register("manufacturer")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" {...register("brand")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions.length">Length (cm)</Label>
              <Input
                id="dimensions.length"
                type="number"
                step="0.1"
                {...register("dimensions.length", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions.width">Width (cm)</Label>
              <Input
                id="dimensions.width"
                type="number"
                step="0.1"
                {...register("dimensions.width", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions.height">Height (cm)</Label>
              <Input
                id="dimensions.height"
                type="number"
                step="0.1"
                {...register("dimensions.height", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight.value">Weight (kg)</Label>
              <Input
                id="weight.value"
                type="number"
                step="0.01"
                {...register("weight.value", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salesAccount">Sales Account</Label>
              <Input id="salesAccount" {...register("salesAccount")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costAccount">Cost Account</Label>
              <Input id="costAccount" {...register("costAccount")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventoryAccount">Inventory Account</Label>
              <Input id="inventoryAccount" {...register("inventoryAccount")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax">Tax</Label>
              <Input id="tax" {...register("tax")} />
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
                onCheckedChange={(checked) => setValue("isReturnable", checked)}
              />
              <Label htmlFor="isReturnable">Returnable</Label>
            </div>
          </div>
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

import { z } from "zod";

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Registration schema
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
    role: z.enum(["admin", "manager", "employee"], {
      required_error: "Role is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// Item schema
export const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  isReturnable: z.boolean().optional(),
  dimensions: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      unit: z.string().optional(),
    })
    .optional(),
  weight: z
    .object({
      value: z.number().optional(),
      unit: z.string().optional(),
    })
    .optional(),
  manufacturer: z.string().optional(),
  brand: z.string().optional(),
  upc: z.string().optional(),
  ean: z.string().optional(),
  isbn: z.string().optional(),
  mpn: z.string().optional(),
  sellingPrice: z.number().min(0, "Selling price must be at least 0"),
  salesAccount: z.string(),
  description: z.string().optional(),
  tax: z.string().optional(),
  costAccount: z.string(),
  preferredVendor: z.string().optional(),
  inventoryAccount: z.string().optional(),
  openingStock: z
    .number()
    .min(0, "Opening stock must be at least 0")
    .optional(),
  reorderPoint: z
    .number()
    .min(0, "Reorder point must be at least 0")
    .optional(),
  inventoryValuationMethod: z.string().optional(),
});

export type ItemFormValues = z.infer<typeof itemSchema>;

// Customer schema

const addressValidationSchema = z.object({
  attention: z.string().optional(),
  country: z.string().min(1, { message: "Country is required" }),
  address: z.string().min(1, { message: "Address is required" }),
  street2: z.string().optional(),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  zipCode: z.string().min(1, { message: "ZIP/Postal code is required" }),
  phone: z.string().optional(),
  faxNumber: z.string().optional(),
});

const primaryContactValidationSchema = z.object({
  salutation: z.string().optional(),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
});

const phoneValidationSchema = z.object({
  workPhone: z.string().optional(),
  mobile: z.string().optional(),
});

const contactPersonValidationSchema = z.object({
  salutation: z.string().optional(),
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email().optional(),
  workPhone: z.string().optional(),
  mobile: z.string().optional(),
});

export const customerSchema = z.object({
  customerType: z.enum(["Business", "Individual"]),
  primaryContact: primaryContactValidationSchema,
  companyName: z.string().optional(),
  displayName: z.string().min(1, { message: "Display name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  phone: phoneValidationSchema,

  billingAddress: addressValidationSchema,
  shippingAddress: addressValidationSchema.optional(),
  contactPersons: z.array(contactPersonValidationSchema).optional().default([]),

  taxId: z.string().optional(),
  companyId: z.string().optional(),
  currency: z.string().min(1, { message: "Currency is required" }),
  paymentTerms: z.string().min(1, { message: "Payment terms are required" }),
  enablePortal: z.boolean().optional(),
  portalLanguage: z.string().optional(),

  customFields: z.record(z.string(), z.any()).optional().default({}),
  reportingTags: z.array(z.string()).optional().default([]),
  remarks: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

// Sales order item schema
export const salesOrderItemSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  quantity: z.number().int().positive("Quantity must be a positive number"),
  rate: z.number().nonnegative("Rate must be a positive number"),
  amount: z.number().nonnegative(),
});

// Sales order schema
const orderItemValidationSchema = z.object({
  _id: z.string().optional(),
  item: z.string().refine((val) => val.length === 24, {
    message: "Invalid item ID format",
  }),
  quantity: z.number().positive(),
  rate: z.number().nonnegative(),
  tax: z.string().optional(),
  amount: z.number().nonnegative().optional(),
});

const discountValidationSchema = z.object({
  type: z.enum(["percentage", "amount"]),
  value: z.number().nonnegative(),
});

const attachmentValidationSchema = z.object({
  fileName: z.string(),
  fileUrl: z.string().url({ message: "Invalid URL format" }),
});

export const salesOrderSchema = z.object({
  _id: z.string().optional(),
  orderNumber: z.string().optional(),
  customer: z.string().refine((val) => val.length === 24, {
    message: "Invalid customer ID format",
  }),
  reference: z.string().optional(),
  salesOrderDate: z.string().datetime().optional(),
  expectedShipmentDate: z.string().datetime().optional(),
  paymentTerms: z.string(),
  deliveryMethod: z.string().optional(),
  salesPerson: z.string().optional(),

  items: z.array(orderItemValidationSchema).nonempty({
    message: "At least one item is required",
  }),

  discount: discountValidationSchema.optional(),
  shippingCharges: z.number().nonnegative().optional(),
  adjustment: z.number().optional(),

  customerNotes: z.string().optional(),
  termsAndConditions: z.string().optional(),

  status: z
    .enum(["Draft", "Confirmed", "Shipped", "Delivered", "Cancelled"])
    .optional(),
  attachments: z.array(attachmentValidationSchema).optional(),
});

export type SalesOrderFormValues = z.infer<typeof salesOrderSchema>;

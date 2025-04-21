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
  quantity: z.number().min(0, "Quantity must be a positive number"),
  warranty: z.string().optional().nullable(), // Add .nullable() to match form component
  price: z.number().min(0, "Price must be a positive number"),
});

export type ItemFormValues = z.infer<typeof itemSchema>;

export const customerSchema = z
  .object({
    customerName: z.string().min(1, { message: "Customer name is required" }),
    contactNumber: z.string().min(1, { message: "Contact number is required" }),
    email: z.string().email().optional(),
    address: z.string().optional(),
    customerType: z.enum(["Business", "Individual"]),
  })
  .refine(
    (data) => {
      if (data.customerType === "Business" && !data.email) {
        return false;
      }
      return true;
    },
    {
      message: "Email is required for Business customers",
      path: ["email"],
    }
  )
  .refine(
    (data) => {
      if (data.customerType === "Business" && !data.address) {
        return false;
      }
      return true;
    },
    {
      message: "Address is required for Business customers",
      path: ["address"],
    }
  );

export type CustomerFormValues = z.infer<typeof customerSchema>;

// Sales item schema
export const salesItemSchema = z.object({
  item: z.string().min(1, "Item is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  rate: z.number().min(0, "Rate must be a positive number"),
  amount: z.number().min(0, "Amount must be a positive number"),
  discount: z.number().optional(),
});

export type SalesItemFormValues = z.infer<typeof salesItemSchema>;

// Sales schema
export const salesSchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  reference: z.string().optional(),
  salesOrderDate: z.date(),
  paymentTerms: z.string().optional(),
  deliveryMethod: z.string().optional(),
  salesPerson: z.string().optional(),
  items: z
    .array(salesItemSchema)
    .min(1, "At least one item is required"),
  discount: z.object({
    type: z.enum(["percentage", "fixed"]),
    value: z.number().min(0),
  }),
  shippingCharges: z.number().min(0),
  adjustment: z.number(),
  customerNotes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  status: z.enum(["Draft", "Confirmed", "Shipped", "Delivered", "Cancelled"]),
  payment: z.number().min(0),
});

export type SalesFormValues = z.infer<typeof salesSchema>;




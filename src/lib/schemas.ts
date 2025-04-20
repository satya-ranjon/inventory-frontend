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

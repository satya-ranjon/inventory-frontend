export type TPermission = "item" | "customer" | "sales" | "dashboard";

export type TUser = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "employee";
  permissions?: TPermission[];
};

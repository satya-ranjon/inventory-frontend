import * as React from "react";
import { cn } from "../../lib/utils";

type ToastProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "destructive" | "success" | "warning";
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void; // This is the correct type
};

type ToastActionElement = React.ReactElement<{
  onClick: () => void;
}>;

const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = {
  id: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
};

const ToastContext = React.createContext<{
  toasts: ToasterToast[];
  addToast: (toast: Omit<ToasterToast, "id">) => void;
  removeToast: (id: string) => void;
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

  const addToast = React.useCallback((toast: Omit<ToasterToast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, toast.duration || TOAST_REMOVE_DELAY);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = React.useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const { addToast, removeToast } = React.useContext(ToastContext);

  return React.useMemo(
    () => ({
      toast: (props: Omit<ToasterToast, "id">) => {
        addToast(props);
      },
      dismiss: (id: string) => {
        removeToast(id);
      },
    }),
    [addToast, removeToast]
  );
}

export function Toast({
  className,
  title,
  description,
  variant = "default",
  action,
  ...props
}: ToastProps) {
  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        {
          "bg-white border-slate-200": variant === "default",
          "bg-red-600 text-white border-red-600": variant === "destructive",
          "bg-green-600 text-white border-green-600": variant === "success",
          "bg-amber-500 text-white border-amber-500": variant === "warning",
        },
        className
      )}
      {...props}>
      <div className="grid gap-1">
        {title && <h3 className="font-medium">{title}</h3>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {action}
      <button
        type="button"
        className={cn("absolute top-2 right-2 rounded-md p-1", {
          "text-slate-500 hover:text-slate-900": variant === "default",
          "text-white hover:text-white/80":
            variant === "destructive" ||
            variant === "success" ||
            variant === "warning",
        })}
        onClick={(e) => {
          e.stopPropagation();
          if (props.onClose) {
            props.onClose(e); // Remove the "as any" cast
          }
        }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round">
          <path d="M18 6L6 18"></path>
          <path d="M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts, removeToast } = React.useContext(ToastContext);

  return (
    <div className="fixed top-0 right-0 z-50 flex flex-col p-4 space-y-4 sm:p-6">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          action={toast.action}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../lib/queryKeys";
import { apiClient, ApiError } from "../../lib/apiClient";
import { useToast } from "../../contexts/ToastContext";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@radix-ui/react-select"; // I'll use simple select for now to avoid complexity
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormValues {
  amount: string;
  token: "SOL" | "USDC";
  description: string;
  expiresAt: string;
  privacyMode: "anonymous" | "verifiable";
  usageType: "single-use" | "multi-use";
}

interface FieldErrors {
  amount?: string;
  token?: string;
  privacyMode?: string;
  general?: string;
}

interface PaymentLinkFormProps {
  onClose: () => void;
}

function getDefaultPrivacyMode(): "anonymous" | "verifiable" {
  if (typeof window === "undefined") return "anonymous";
  try {
    const saved = localStorage.getItem("pp_default_privacy");
    return saved === "verifiable" ? "verifiable" : "anonymous";
  } catch {
    return "anonymous";
  }
}

export function PaymentLinkForm({ onClose }: PaymentLinkFormProps) {
  const qc = useQueryClient();
  const { addToast } = useToast();
  const [values, setValues] = useState<FormValues>({
    amount: "",
    token: "SOL",
    description: "",
    expiresAt: "",
    privacyMode: getDefaultPrivacyMode(),
    usageType: "single-use",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const e: FieldErrors = {};
    const amt = parseFloat(values.amount);
    if (!values.amount || isNaN(amt) || amt <= 0)
      e.amount = "Amount must be a positive number";
    if (!values.token) e.token = "Token is required";
    if (!values.privacyMode) e.privacyMode = "Privacy mode is required";
    
    setErrors(e);
    
    if (Object.keys(e).length > 0) {
      addToast("Please fix the errors in the form", "error");
    }
    
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    try {
      await apiClient.createLink({
        amount: parseFloat(values.amount),
        token: values.token,
        description: values.description || undefined,
        expiresAt: values.expiresAt
          ? new Date(values.expiresAt).toISOString()
          : undefined,
        privacyMode: values.privacyMode,
        usageType: values.usageType,
      });
      await qc.invalidateQueries({ queryKey: queryKeys.links() });
      addToast("Payment link created successfully", "success");
      onClose();
    } catch (err) {
      console.error("Create link error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create link";
      
      if (err instanceof ApiError && err.details) {
        const fieldErrs: FieldErrors = {};
        for (const d of err.details) {
          fieldErrs[d.field as keyof FieldErrors] = d.message;
        }
        setErrors(fieldErrs);
        addToast("Validation failed", "error");
      } else {
        setErrors({
          general: errorMessage,
        });
        addToast(errorMessage, "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {errors.general && (
        <p
          role="alert"
          className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
        >
          {errors.general}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Amount */}
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Amount <span className="text-destructive">*</span>
          </label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="any"
            value={values.amount}
            onChange={(e) => setValues((v) => ({ ...v, amount: e.target.value }))}
            placeholder="0.00"
            className={cn(errors.amount && "border-destructive focus-visible:ring-destructive")}
          />
          {errors.amount && (
            <p className="text-destructive text-xs">{errors.amount}</p>
          )}
        </div>

        {/* Token */}
        <div className="space-y-2">
          <label htmlFor="token" className="text-sm font-medium leading-none">
            Token <span className="text-destructive">*</span>
          </label>
          <select
            id="token"
            value={values.token}
            onChange={(e) =>
              setValues((v) => ({ ...v, token: e.target.value as "SOL" | "USDC" }))
            }
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="SOL">SOL</option>
            <option value="USDC">USDC</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium leading-none">
          Description <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <Input
          id="description"
          type="text"
          maxLength={200}
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          placeholder="What is this for?"
        />
      </div>

      {/* Expiry */}
      <div className="space-y-2">
        <label htmlFor="expiresAt" className="text-sm font-medium leading-none">
          Expiry <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            id="expiresAt"
            type="datetime-local"
            value={values.expiresAt}
            onChange={(e) => setValues((v) => ({ ...v, expiresAt: e.target.value }))}
            className="pl-10"
          />
          <Clock className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
        <p className="text-[10px] text-muted-foreground">Click the calendar icon or the field to open the picker.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Usage Type */}
        <div className="space-y-3">
          <span className="text-sm font-medium leading-none">Usage Type</span>
          <div className="flex flex-col gap-2">
            {(["single-use", "multi-use"] as const).map((type) => (
              <label
                key={type}
                className={cn(
                  "flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors",
                  values.usageType === type ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                <input
                  type="radio"
                  name="usageType"
                  value={type}
                  checked={values.usageType === type}
                  onChange={() => setValues((v) => ({ ...v, usageType: type }))}
                  className="w-4 h-4 accent-primary"
                />
                <span className="capitalize">{type.replace("-", " ")}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Privacy Mode */}
        <div className="space-y-3">
          <span className="text-sm font-medium leading-none">Privacy Mode</span>
          <div className="flex flex-col gap-2">
            {(["anonymous", "verifiable"] as const).map((mode) => (
              <label
                key={mode}
                className={cn(
                  "flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors",
                  values.privacyMode === mode ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                <input
                  type="radio"
                  name="privacyMode"
                  value={mode}
                  checked={values.privacyMode === mode}
                  onChange={() => setValues((v) => ({ ...v, privacyMode: mode }))}
                  className="w-4 h-4 accent-primary"
                />
                <span className="capitalize">{mode}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="flex-1"
        >
          {submitting ? "Creating..." : "Create Link"}
        </Button>
      </div>
    </form>
  );
}

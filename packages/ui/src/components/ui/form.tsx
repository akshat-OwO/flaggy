"use client";
import { createFormHook, createFormHookContexts, type AnyFieldApi } from "@tanstack/react-form";
import type * as React from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// https://tanstack.com/form/latest/docs/framework/react/guides/form-composition
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

/** Base UI `FieldError` is for constraint validation API — TanStack errors need a plain live region. */
function formatValidationIssue(issue: unknown): string {
  if (issue == null) return "";
  if (typeof issue === "string") return issue;
  if (typeof issue === "object" && issue !== null && "message" in issue) {
    const message = (issue as { message: unknown }).message;
    if (typeof message === "string") return message;
  }
  try {
    return JSON.stringify(issue);
  } catch {
    return "Invalid value";
  }
}

function TanStackFieldError({
  id,
  className,
  issues,
}: {
  id: string;
  className?: string;
  issues: readonly unknown[];
}): React.ReactElement | null {
  const messages = issues.map(formatValidationIssue).filter(Boolean);
  if (messages.length === 0) return null;

  return (
    <div
      className={cn("text-destructive-foreground text-xs", className)}
      data-slot="field-error"
      id={id}
      role="alert"
    >
      {messages.length === 1 ? (
        messages[0]
      ) : (
        <ul className="ms-4 list-disc space-y-0.5">
          {messages.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export type FormFieldRenderContext = {
  field: AnyFieldApi;
  /** Same as `field.name`; use as control `id` for `FieldLabel` `htmlFor`. */
  controlId: string;
  isInvalid: boolean;
  errorId: string;
};

type FormFieldProps = {
  label: string;
  description?: React.ReactNode;
  /** Overrides `field.state.meta.isTouched && !field.state.meta.isValid`. */
  invalid?: boolean;
  /** Overrides `field.state.meta.errors` as the message source. */
  issues?: readonly unknown[];
  className?: string;
  children: React.ReactNode | ((ctx: FormFieldRenderContext) => React.ReactNode);
};

export function FormField<TData = unknown>({
  label,
  description,
  invalid,
  issues,
  className,
  children,
}: FormFieldProps): React.ReactElement {
  const field = useFieldContext<TData>();
  const isInvalid = invalid ?? (field.state.meta.isTouched && !field.state.meta.isValid);
  const controlId = String(field.name);
  const errorId = `${controlId}-error`;
  const errorIssues = issues ?? field.state.meta.errors;
  const ctx: FormFieldRenderContext = {
    field,
    controlId,
    errorId,
    isInvalid,
  };
  const resolvedChildren = typeof children === "function" ? children(ctx) : children;

  return (
    <Field className={className} data-invalid={isInvalid ? "" : undefined}>
      <FieldLabel htmlFor={controlId}>{label}</FieldLabel>
      {resolvedChildren}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {isInvalid ? <TanStackFieldError id={errorId} issues={errorIssues} /> : null}
    </Field>
  );
}

type BaseFieldProps = {
  label: string;
  description?: string;
  placeholder?: string;
};

type TextFieldProps = BaseFieldProps &
  Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "onBlur">;

export function TextField({
  label,
  description,
  placeholder,
  ...props
}: TextFieldProps): React.ReactElement {
  return (
    <FormField<string> description={description} label={label}>
      {({ field, controlId, errorId, isInvalid }) => (
        <Input
          {...props}
          aria-describedby={isInvalid ? errorId : undefined}
          aria-invalid={isInvalid}
          id={controlId}
          name={String(field.name)}
          placeholder={placeholder}
          value={field.state.value ?? ""}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
        />
      )}
    </FormField>
  );
}

type TextareaFieldProps = BaseFieldProps &
  Omit<React.ComponentProps<typeof Textarea>, "value" | "onChange" | "onBlur">;

export function TextareaField({
  label,
  description,
  placeholder,
  ...props
}: TextareaFieldProps): React.ReactElement {
  return (
    <FormField<string> description={description} label={label}>
      {({ field, controlId, errorId, isInvalid }) => (
        <Textarea
          {...props}
          aria-describedby={isInvalid ? errorId : undefined}
          aria-invalid={isInvalid}
          id={controlId}
          name={String(field.name)}
          placeholder={placeholder}
          value={field.state.value ?? ""}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
        />
      )}
    </FormField>
  );
}

export type SelectFieldOption = {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
};

type SelectFieldProps = BaseFieldProps &
  Omit<React.ComponentProps<typeof Select>, "name" | "defaultValue" | "value" | "onValueChange"> & {
    items: readonly SelectFieldOption[];
    defaultValue?: string;
    name?: string;
  };

export function SelectField({
  label,
  description,
  placeholder,
  items,
  defaultValue,
  name,
  ...props
}: SelectFieldProps): React.ReactElement {
  const field = useFieldContext<string>();
  const fieldName = name ?? String(field.name);
  const value = field.state.value ?? defaultValue ?? "";
  const selectedItem = items.find((item) => item.value === value);

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const errorId = `${fieldName}-error`;

  return (
    <Field data-invalid={isInvalid ? "" : undefined}>
      <FieldLabel htmlFor={fieldName}>{label}</FieldLabel>
      <Select {...props} value={value} onValueChange={(v) => field.handleChange(v as string)}>
        <SelectTrigger
          aria-describedby={isInvalid ? errorId : undefined}
          aria-invalid={isInvalid}
          id={fieldName}
          onBlur={field.handleBlur}
        >
          <SelectValue placeholder={placeholder ?? "Select an option"}>
            {selectedItem?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectPopup>
          {items.map((option) => (
            <SelectItem key={option.value} disabled={option.disabled} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectPopup>
      </Select>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {isInvalid ? <TanStackFieldError id={errorId} issues={field.state.meta.errors} /> : null}
    </Field>
  );
}

type SubscribeButtonProps = Omit<React.ComponentProps<typeof Button>, "type">;

export function SubscribeButton({ children, ...props }: SubscribeButtonProps): React.ReactElement {
  const formApi = useFormContext();

  return (
    <formApi.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button {...props} disabled={props.disabled || isSubmitting} type="submit">
          {children}
        </Button>
      )}
    </formApi.Subscribe>
  );
}

export const { extendForm, useAppForm, useTypedAppFormContext, withFieldGroup, withForm } =
  createFormHook({
    fieldComponents: {
      FormField,
      SelectField,
      TextField,
      TextareaField,
    },
    fieldContext,
    formComponents: {
      SubscribeButton,
    },
    formContext,
  });

export { formOptions, useForm } from "@tanstack/react-form";

export function Form({ className, ...props }: React.ComponentProps<"form">): React.ReactElement {
  return <form className={cn(className)} data-slot="form" {...props} />;
}

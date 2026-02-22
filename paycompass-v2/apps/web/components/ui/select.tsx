"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

type SelectTriggerProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
  className?: string;
  children?: React.ReactNode;
};
const TriggerPrimitive = SelectPrimitive.Trigger as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { className?: string; children?: React.ReactNode } & React.RefAttributes<HTMLButtonElement>
>;
const SelectIconPrimitive = SelectPrimitive.Icon as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Icon> & { asChild?: boolean; children?: React.ReactNode } & React.RefAttributes<HTMLSpanElement>
>;
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, ...props }, ref) => (
  <TriggerPrimitive
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...(props as React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>)}
  >
    {children}
    <SelectIconPrimitive asChild>
      <ChevronDown className="size-4 opacity-50" />
    </SelectIconPrimitive>
  </TriggerPrimitive>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

type SelectScrollUpButtonProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton> & {
  className?: string;
  children?: React.ReactNode;
};
const ScrollUpPrimitive = SelectPrimitive.ScrollUpButton as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton> & { className?: string; children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
>;
const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  SelectScrollUpButtonProps
>(({ className, ...props }, ref) => (
  <ScrollUpPrimitive
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...(props as React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>)}
  >
    <ChevronUp className="size-4" />
  </ScrollUpPrimitive>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

type SelectScrollDownButtonProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton> & {
  className?: string;
  children?: React.ReactNode;
};
const ScrollDownPrimitive = SelectPrimitive.ScrollDownButton as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton> & { className?: string; children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
>;
const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  SelectScrollDownButtonProps
>(({ className, ...props }, ref) => (
  <ScrollDownPrimitive
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...(props as React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>)}
  >
    <ChevronDown className="size-4" />
  </ScrollDownPrimitive>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

type SelectContentProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
  className?: string;
  children?: React.ReactNode;
};
const ContentPrimitive = SelectPrimitive.Content as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & { className?: string; children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
>;
const ViewportPrimitive = SelectPrimitive.Viewport as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Viewport> & { className?: string; children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
>;
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <ContentPrimitive
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-[#6B9FD4]/15 bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...(props as React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>)}
    >
      <SelectScrollUpButton />
      <ViewportPrimitive
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </ViewportPrimitive>
      <SelectScrollDownButton />
    </ContentPrimitive>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

type SelectLabelProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> & {
  className?: string;
  children?: React.ReactNode;
};
const LabelPrimitive = SelectPrimitive.Label as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> & { className?: string } & React.RefAttributes<HTMLDivElement>
>;
const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  SelectLabelProps
>(({ className, ...props }, ref) => (
  <LabelPrimitive
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...(props as React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>)}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

type SelectItemProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
  className?: string;
  children?: React.ReactNode;
};
const ItemPrimitive = SelectPrimitive.Item as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & { className?: string; children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
>;
const ItemIndicatorPrimitive = SelectPrimitive.ItemIndicator as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ItemIndicator> & { children?: React.ReactNode } & React.RefAttributes<HTMLSpanElement>
>;
const ItemTextPrimitive = SelectPrimitive.ItemText as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ItemText> & { children?: React.ReactNode } & React.RefAttributes<HTMLSpanElement>
>;
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, ...props }, ref) => (
  <ItemPrimitive
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...(props as React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>)}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <ItemIndicatorPrimitive>
        <Check className="size-4" />
      </ItemIndicatorPrimitive>
    </span>
    <ItemTextPrimitive>{children}</ItemTextPrimitive>
  </ItemPrimitive>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

type SelectSeparatorProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> & {
  className?: string;
};
const SeparatorPrimitive = SelectPrimitive.Separator as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> & { className?: string } & React.RefAttributes<HTMLDivElement>
>;
const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  SelectSeparatorProps
>(({ className, ...props }, ref) => (
  <SeparatorPrimitive
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...(props as React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>)}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};

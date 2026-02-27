"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;

type DropdownMenuTriggerProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger> & {
  children?: React.ReactNode;
  asChild?: boolean;
};
const DropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  DropdownMenuTriggerProps
>((props, ref) => <DropdownMenuPrimitive.Trigger ref={ref} {...props} />);
DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
const ItemIndicatorPrimitive = DropdownMenuPrimitive.ItemIndicator as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.ItemIndicator> & { children?: React.ReactNode } & React.RefAttributes<HTMLSpanElement>
>;

type DropdownMenuSubTriggerProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
  className?: string;
  children?: React.ReactNode;
};
const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  DropdownMenuSubTriggerProps
>(({ className, inset, children, ...props }, ref) => {
  const SubTrigger = DropdownMenuPrimitive.SubTrigger as React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & { className?: string; children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
  >;
  return (
    <SubTrigger
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "pl-8",
        className
      )}
      {...(props as React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>)}
    >
      {children}
      <ChevronRight className="ml-auto" />
    </SubTrigger>
  );
});
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

type DropdownMenuSubContentProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent> & {
  className?: string;
};
const SubContentPrimitive = DropdownMenuPrimitive.SubContent as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent> & { className?: string } & React.RefAttributes<HTMLDivElement>
>;
const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  DropdownMenuSubContentProps
>(({ className, ...props }, ref) => (
  <SubContentPrimitive
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...(props as React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>)}
  />
));
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

type DropdownMenuContentProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
  className?: string;
  children?: React.ReactNode;
};
const ContentPrimitive = DropdownMenuPrimitive.Content as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & { className?: string } & React.RefAttributes<HTMLDivElement>
>;
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <ContentPrimitive
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...(props as React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>)}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

type DropdownMenuItemProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
};
const ItemPrimitive = DropdownMenuPrimitive.Item as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & { className?: string } & React.RefAttributes<HTMLDivElement>
>;
const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(({ className, inset, onClick, ...props }, ref) => (
  <ItemPrimitive
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    onSelect={onClick ? (e) => { e.preventDefault(); onClick(); } : undefined}
    {...(props as Omit<React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>, "onSelect">)}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

type DropdownMenuCheckboxItemProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem> & {
  className?: string;
  children?: React.ReactNode;
};
const CheckboxItemPrimitive = DropdownMenuPrimitive.CheckboxItem as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem> & { className?: string; children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
>;
const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  DropdownMenuCheckboxItemProps
>(({ className, children, checked, ...props }, ref) => (
  <CheckboxItemPrimitive
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...(props as React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>)}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ItemIndicatorPrimitive>
        <Check className="h-4 w-4" />
      </ItemIndicatorPrimitive>
    </span>
    {children}
  </CheckboxItemPrimitive>
));
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

type DropdownMenuRadioItemProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> & {
  className?: string;
  children?: React.ReactNode;
};
const RadioItemPrimitive = DropdownMenuPrimitive.RadioItem as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem> & { className?: string; children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
>;
const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  DropdownMenuRadioItemProps
>(({ className, children, ...props }, ref) => (
  <RadioItemPrimitive
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...(props as React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>)}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ItemIndicatorPrimitive>
        <Circle className="h-2 w-2 fill-current" />
      </ItemIndicatorPrimitive>
    </span>
    {children}
  </RadioItemPrimitive>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

type DropdownMenuLabelProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
  className?: string;
  children?: React.ReactNode;
};
const LabelPrimitive = DropdownMenuPrimitive.Label as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & { className?: string } & React.RefAttributes<HTMLDivElement>
>;
const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  DropdownMenuLabelProps
>(({ className, inset, ...props }, ref) => (
  <LabelPrimitive
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    {...(props as React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>)}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

type DropdownMenuSeparatorProps = React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator> & {
  className?: string;
};
const SeparatorPrimitive = DropdownMenuPrimitive.Separator as React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator> & { className?: string } & React.RefAttributes<HTMLDivElement>
>;
const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <SeparatorPrimitive
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...(props as React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>)}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
    {...props}
  />
);
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
};

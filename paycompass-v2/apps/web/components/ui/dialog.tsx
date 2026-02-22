"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;

type DialogCloseProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close> & {
  className?: string;
  children?: React.ReactNode;
};
const DialogClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  DialogCloseProps
>(({ className, ...props }, ref) => {
  const Close = DialogPrimitive.Close as React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close> & { className?: string; children?: React.ReactNode } & React.RefAttributes<HTMLButtonElement>
  >;
  return <Close ref={ref} className={className} {...(props as React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>)}>{props.children}</Close>;
});
DialogClose.displayName = DialogPrimitive.Close.displayName;

type DialogOverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
  className?: string;
};
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(({ className, ...props }, ref) => {
  const Overlay = DialogPrimitive.Overlay as React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & { className?: string } & React.RefAttributes<HTMLDivElement>
  >;
  return (
    <Overlay
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
});
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  className?: string;
  children?: React.ReactNode;
  showCloseButton?: boolean;
};
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, showCloseButton = true, ...props }, ref) => {
  const Content = DialogPrimitive.Content as React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { className?: string; children?: React.ReactNode } & React.RefAttributes<HTMLDivElement>
  >;
  return (
    <DialogPortal>
      <DialogOverlay />
      <Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          className
        )}
        {...(props as Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, "className" | "children">)}
      >
        {children}
        {showCloseButton && (
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-text-secondary">
            <X className="h-4 w-4" />
            <span className="sr-only">Zamknij</span>
          </DialogClose>
        )}
      </Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

type DialogTitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
  className?: string;
  children?: React.ReactNode;
};
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>(({ className, ...props }, ref) => {
  const Title = DialogPrimitive.Title as React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & { className?: string; children?: React.ReactNode } & React.RefAttributes<HTMLHeadingElement>
  >;
  return <Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...(props as React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>)} />;
});
DialogTitle.displayName = DialogPrimitive.Title.displayName;

type DialogDescriptionProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & {
  className?: string;
  children?: React.ReactNode;
};
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  DialogDescriptionProps
>(({ className, ...props }, ref) => {
  const Description = DialogPrimitive.Description as React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & { className?: string; children?: React.ReactNode } & React.RefAttributes<HTMLParagraphElement>
  >;
  return <Description ref={ref} className={cn("text-sm text-text-secondary", className)} {...(props as React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>)} />;
});
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

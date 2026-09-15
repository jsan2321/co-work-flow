import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ className, hoverable = false, children, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "bg-[var(--surface-card)] border border-[var(--border-default)] rounded-[8px] p-6 shadow-[0_1px_3px_rgba(32,37,34,0.06)] transition-colors duration-150",
          hoverable && "hover:border-[var(--border-strong)]",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx("mb-4 flex flex-col gap-1", className))} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={twMerge(
        clsx("font-serif text-xl font-bold tracking-tight text-[var(--text-primary)]", className)
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={twMerge(
        clsx("text-sm text-[var(--text-secondary)] font-normal leading-relaxed", className)
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={twMerge(clsx("text-[var(--text-primary)]", className))} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        clsx(
          "mt-6 pt-4 border-t border-[var(--border-default)] flex items-center justify-between",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

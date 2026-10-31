"use client";

import * as React from "react";

export interface StaggerProps {
  baseDelay?: number;
  staggerInterval?: number;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  children: React.ReactNode;
}

export function Stagger({
  baseDelay = 0,
  staggerInterval = 0.06,
  as: Component = "div",
  className = "",
  children,
}: StaggerProps) {
  const staggeredChildren = React.Children.map(children, (child, i) => {
    if (!React.isValidElement(child)) return child;

    const childProps = child.props as { delay?: number };
    const currentDelay = childProps.delay ?? 0;
    const additionalDelay = baseDelay + i * staggerInterval;

    return React.cloneElement(child, {
      ...childProps,
      delay: currentDelay + additionalDelay,
    } as Record<string, unknown>);
  });

  return <Component className={className}>{staggeredChildren}</Component>;
}


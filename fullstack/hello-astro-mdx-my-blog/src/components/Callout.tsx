import React from "react";

type CalloutType = "info" | "warning" | "danger" | "tip";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const typeConfig: Record<CalloutType, { label: string; className: string }> = {
  info: { label: "Note", className: "callout-info" },
  warning: { label: "Warning", className: "callout-warning" },
  danger: { label: "Danger", className: "callout-danger" },
  tip: { label: "Tip", className: "callout-tip" },
};

export const Callout: React.FC<CalloutProps> = ({
  type = "info",
  title,
  children,
}) => {
  const config = typeConfig[type];
  return (
    <aside className={`callout ${config.className}`} role="note">
      <strong className="callout-label">{title ?? config.label}</strong>
      <div className="callout-body">{children}</div>
    </aside>
  );
};

export default Callout;

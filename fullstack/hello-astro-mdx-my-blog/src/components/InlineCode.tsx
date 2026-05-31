import React from "react";

interface InlineCodeProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Replaces default inline <code> rendering in MDX.
 * Block code inside <pre> is handled by CodeBlock; this skips language-* classes.
 */
export const InlineCode: React.FC<InlineCodeProps> = ({
  children,
  className = "",
  ...props
}) => {
  if (className.includes("language-")) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  return (
    <code className={`inline-code ${className}`.trim()} {...props}>
      {children}
    </code>
  );
};

export default InlineCode;

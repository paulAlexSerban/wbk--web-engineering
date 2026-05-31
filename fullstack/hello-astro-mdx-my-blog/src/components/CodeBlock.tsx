import React from 'react';

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
  'data-language'?: string;
}

/**
 * Replaces the default <pre> rendering in MDX.
 * Astro/MDX passes the language via the className ('language-ts')
 * and optionally via data-language.
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  className = '',
  'data-language': dataLanguage,
}) => {
  const language =
    dataLanguage ??
    className.replace('language-', '') ??
    'text';

  return (
    <div className="code-block-wrapper" data-language={language}>
      <span className="code-block-lang-label">{language}</span>
      <pre className={className}>
        {children}
      </pre>
    </div>
  );
};

export default CodeBlock;
import React from "react";

interface DiagramProps {
  title?: string;
  caption?: string;
  src?: string;
  alt?: string;
  children?: React.ReactNode;
}

/**
 * Container for architecture diagrams and visual explanations in MDX content.
 * Pass `src` for an image diagram, or `children` for text/ASCII/mermaid source.
 */
export const Diagram: React.FC<DiagramProps> = ({
  title,
  caption,
  src,
  alt = "",
  children,
}) => {
  return (
    <figure className="diagram">
      {title && <figcaption className="diagram-title">{title}</figcaption>}
      <div className="diagram-body">
        {src ? <img src={src} alt={alt || title || "Diagram"} /> : children}
      </div>
      {caption && <figcaption className="diagram-caption">{caption}</figcaption>}
    </figure>
  );
};

export default Diagram;

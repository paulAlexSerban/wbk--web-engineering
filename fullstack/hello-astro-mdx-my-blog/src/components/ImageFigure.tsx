import React from "react";

interface ImageFigureProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  caption?: string;
}

/**
 * Replaces default <img> rendering in MDX with a semantic figure + optional caption.
 */
export const ImageFigure: React.FC<ImageFigureProps> = ({
  caption,
  title,
  alt = "",
  ...props
}) => {
  const figureCaption = caption ?? title;

  return (
    <figure className="image-figure">
      <img alt={alt} title={title} {...props} />
      {figureCaption && <figcaption>{figureCaption}</figcaption>}
    </figure>
  );
};

export default ImageFigure;

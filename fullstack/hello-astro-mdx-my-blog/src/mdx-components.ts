import type { MDXComponents } from "@astrojs/mdx";
import Callout from "./components/Callout.tsx";
import TabGroup from "./components/TabGroupIsland.tsx";
import CodeBlock from "./components/CodeBlock.tsx";
import Diagram from "./components/Diagram.tsx";
import InlineCode from "./components/InlineCode.tsx";
import ImageFigure from "./components/ImageFigure.tsx";

/**
 * Global MDX component injection map.
 * Components registered here are available in every .mdx file
 * without explicit imports.
 *
 * Keys matching HTML element names override the default rendering.
 * Custom keys become available as named JSX components.
 */
export const mdxComponents: MDXComponents = {
  // HTML element overrides
  pre: CodeBlock,
  code: InlineCode,
  img: ImageFigure,

  // Custom named components
  Callout,
  TabGroup,
  Diagram,
};

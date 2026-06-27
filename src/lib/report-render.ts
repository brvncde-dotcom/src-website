import { defaultSchema } from "rehype-sanitize";

// Tags required by the SRC report design standard for inline SVG charts,
// figure/caption blocks, and callout asides. These are appended to the
// default (GitHub) schema so standard prose elements keep rendering.
const svgTags = [
  "svg",
  "g",
  "rect",
  "text",
  "tspan",
  "line",
  "path",
  "circle",
  "ellipse",
  "polyline",
  "polygon",
  "title",
  "desc",
  "defs",
  "use",
  "linearGradient",
  "radialGradient",
  "stop",
  "pattern",
  "clipPath",
];

// Presentation + geometry attributes used by SRC-original inline SVG charts.
// NOTE: rehype-sanitize matches HAST *property names*, so multi-word HTML
// attributes use their camelCase property form (className, dataChartType,
// strokeWidth, fontSize, fillOpacity ...). aria-* keep their hyphenated form.
const svgAttributes = [
  "id",
  "className",
  "dataChartType",
  "viewBox",
  "xmlns",
  "xmlnsXlink",
  "role",
  "aria-label",
  "aria-labelledby",
  "aria-hidden",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "width",
  "height",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "fx",
  "fy",
  "d",
  "points",
  "transform",
  "fill",
  "fillOpacity",
  "fillRule",
  "stroke",
  "strokeWidth",
  "strokeLinecap",
  "strokeLinejoin",
  "strokeDasharray",
  "strokeOpacity",
  "opacity",
  "textAnchor",
  "fontSize",
  "fontWeight",
  "fontFamily",
  "href",
  "xlinkHref",
  "offset",
  "gradientTransform",
  "gradientUnits",
  "spreadMethod",
  "stopColor",
  "stopOpacity",
  "patternUnits",
  "patternTransform",
  "clipPathUnits",
];

const svgAttributeRecord: Record<string, string[]> = {};
for (const tag of svgTags) {
  svgAttributeRecord[tag] = svgAttributes;
}

// Sanitisation schema for report content. Report markdown is authored
// internally (Design Director / analysts) and passes the board-approval
// publish gate (SRC-86), so we allow the design-system's SVG/figure/callout
// vocabulary while still stripping scripts and unsafe attributes.
export const reportSanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...((defaultSchema.tagNames as string[] | undefined) ?? []),
    "figure",
    "figcaption",
    "aside",
    ...svgTags,
  ],
  attributes: {
    ...defaultSchema.attributes,
    // Allow class + data-chart-type + a11y attrs on any element (design-system
    // hooks). Property names: className, dataChartType, role, aria-*.
    "*": [
      ...((defaultSchema.attributes?.["*"] as string[] | undefined) ?? []),
      "className",
      "dataChartType",
      "role",
      "aria-label",
      "aria-labelledby",
      "aria-hidden",
    ],
    img: [
      ...((defaultSchema.attributes?.img as string[] | undefined) ?? []),
      "loading",
    ],
    ...svgAttributeRecord,
  },
  strip: ["script"],
};

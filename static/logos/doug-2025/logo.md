# Waccamaw Indian People Logo

![Waccamaw Indian People Logo](./logo.svg)

## Colors

- **Primary**: `#0b05a8` (traditional blue)
- **Background**: White

## Design Concept
A circular seal in **vintage stamp/engraving style** featuring:
- **Eagle**: Central symbol of strength, freedom, and spiritual connection with detailed feather work
- **Medicine Wheel**: Cross/plus design representing the four sacred directions
- **Seal Format**: Traditional circular design with double-ring border
- **Text**: Curved upper and lower text bands

## Art Style: Vintage Seal/Engraving
The logo emulates a classic **woodcut/block print aesthetic**:
- **High contrast**: Strict two-tone (blue and white only), no gradients
- **Hand-drawn quality**: Organic, slightly irregular edges
- **Detailed texturing**: Individual feather barbs and natural line work
- **Negative space**: White shapes define blue areas for visual interest
- **Traditional engraving**: Similar to official seals, stamps, and vintage emblems

## SVG Structure
The logo is built with scalability and maintainability in mind:
- Organized in logical groups (seal border, medicine wheel, eagle, text)
- Clean, semantic markup
- CSS classes for easy color theming
- ViewBox set for proper scaling at any size

## Usage
The SVG can be used at any size without quality loss, suitable for:
- Website headers and logos
- Print materials (letterhead, business cards)
- Social media profiles
- Official documents and seals

---

## SVG Code

See: `/static/logos/doug-2025/logo.svg`

## Customization Notes

### Adjusting Colors
The logo uses CSS classes for easy theming:
- `.primary` - Main color (default: `#0b05a8`)
- `.primary-stroke` - Stroke color for outlines
- `.background` - Background color (default: white)

To create an inverted version (white on blue/black), simply swap the colors in the CSS.

### Scaling
- The `viewBox="0 0 400 400"` ensures the logo scales proportionally
- Change `width` and `height` attributes as needed
- Use in HTML: `<img src="logo.svg" width="100%">` for responsive scaling

### Adding Text
- The text band uses a curved path for professional appearance
- Modify the `<textPath>` content to change the organization name
- Adjust `font-size`, `font-family`, and `startOffset` as needed

### Symbol Modifications
- Eagle: Grouped in `<g id="eagle">` with detailed feather work
- Medicine Wheel: Cross design in `<g id="medicine-wheel">`
- Seal border: Double-ring design in `<g id="seal-outer">`
- Text: Curved paths for "THE PEOPLE OF THE" and "WACCAMAW"

## Design Philosophy
This logo maintains the **authentic vintage seal aesthetic** with:
- Hand-drawn character for warmth and tradition
- High-contrast two-tone design for maximum clarity and reproduction
- Detailed eagle rendering showing individual feathers
- Professional circular seal format suitable for official use
- Scalable vector format that works at any size

# Waccamaw Indian People - Micro.blog Theme

A modern and sophisticated Native American tribal-inspired theme for micro.blog, designed specifically for the Waccamaw Indian People of Aynor, SC.

## Features

- **Modern Design**: Clean, sophisticated layout with earth-tone colors
- **Tribal-Inspired**: Color palette and decorative elements inspired by Native American heritage
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **Accessible**: ARIA labels, semantic HTML, keyboard navigation support
- **Micro.blog Compatible**: Full integration with micro.blog features

## Color Palette

- **Earth Tones**: Deep browns (#4a3528), medium browns (#8b6f47), light tan (#d4b896)
- **Accents**: Turquoise (#3ba99c), Terracotta (#c67b5c), Sage green (#9caf88)
- **Backgrounds**: Warm cream (#f5f1e8), sand (#e8dcc8)

## Installation

This theme is designed to work with micro.blog's hosting platform. The theme files are organized as follows:

- `layouts/` - Hugo template files
- `static/` - CSS and static assets
- `config.json` - Site configuration (with placeholders)

## Configuration

The theme supports standard micro.blog configuration options in `config.json`:

- `title` - Site title
- `description` - Site description (supports HTML for micro.blog links)
- `author.name` - Author name
- `params.about_me` - About section content
- Custom navigation via Hugo menus (optional)

### Navigation

By default, the theme includes Home, Archive, and About links. You can customize navigation by defining menus in your config file.

## Security Notes

This theme uses `safeHTML` in several templates to allow HTML formatting in site configuration parameters (description, about_me). This is standard practice for Hugo/micro.blog themes where the site owner controls the configuration through `config.json`. 

**Important**: Site configuration (`config.json`) should only be edited by trusted administrators as it can contain HTML.

## Customization

Colors and spacing can be customized by editing the CSS custom properties in `static/custom.css`:

```css
:root {
  --color-earth-dark: #4a3528;
  --color-turquoise: #3ba99c;
  /* ... other variables */
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## License

See LICENSE file for details.

## Credits

Designed for the Waccamaw Indian People of Aynor, South Carolina.

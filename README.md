# Website Template

A modern, responsive, and accessible starter template.

## Files
- `index.html` – Structure and content
- `styles.css` – Styles, variables, and responsive layout
- `script.js` – Theme toggle, mobile menu, current year

## Quick start
Open `index.html` directly in your browser, or serve the folder locally:

```bash
# PowerShell
python -m http.server 8000
# or
npx serve . -l 8000 --single
```

Visit `http://localhost:8000`.

## Customize
- Branding: Update brand text and `<title>` in `index.html`.
- Colors: Edit the CSS variables in `styles.css`.
- Sections: Modify or add sections in `index.html`.
- Favicon: Replace `favicon.ico` or remove the link tag.

## Accessibility
- Skip link for keyboard users
- Focus styles on interactive elements
- Honors `prefers-reduced-motion`
- Light/dark color-scheme support

## License
MIT


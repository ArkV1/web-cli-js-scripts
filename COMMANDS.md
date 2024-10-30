
# Website to PDF

### Exclude a single element
```bash
$ node convert.js --url https://example.com --exclude "#header"
```
### Exclude multiple elements
```bash
$ node convert.js --url https://example.com --exclude "#header, .advertisement, .sidebar"
```
### Exclude elements with complex selectors
```bash
$ node convert.js --url https://example.com --exclude "div.ads, #cookie-banner, .popup-modal"
```

### Exclude "Ask AI" element on Anthropic prompt library
```bash
$ node convert.js --url https://docs.anthropic.com/en/prompt-library/library --exclude ".ikp-floating-button-box" --wait 3000 --landscape --scale 0.8
```

## Project strucutre w/ tree

### Node:
```bash
$ tree -I "node_modules|.git|*.lock|package-lock.json|dist"
```
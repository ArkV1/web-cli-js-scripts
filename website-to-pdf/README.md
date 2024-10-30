# Website to PDF Converter

A command-line tool that converts web pages to PDF files using Puppeteer. This tool allows you to easily create PDF versions of any website with customizable options for format, orientation, and scaling.

## Features

- Convert any accessible website to PDF
- Support for multiple paper formats (A4, Letter, Legal)
- Landscape or portrait orientation
- Customizable wait time for dynamic content
- Adjustable scale for content sizing
- Background graphics and colors preservation
- Custom margins
- Progress logging

## Prerequisites

Before using this tool, make sure you have the following installed:
- Node.js (version 14.0.0 or higher)
- npm (usually comes with Node.js)

## Installation

1. Clone this repository or create a new directory:
```bash
mkdir website-to-pdf
cd website-to-pdf
```

2. Initialize a new Node.js project:
```bash
npm init -y
```

3. Install the required dependencies:
```bash
npm install puppeteer yargs
```

4. Copy the `convert.js` script into your project directory.

## Usage

Basic usage:
```bash
node convert.js --url https://example.com
```

### Command Line Options

| Option | Alias | Description | Default | Required |
|--------|-------|-------------|----------|----------|
| --url | -u | Website URL to convert | - | Yes |
| --output | -o | Output PDF filename | output.pdf | No |
| --wait | -w | Time to wait for dynamic content (ms) | 1000 | No |
| --format | -f | Paper format (A4, Letter, Legal) | A4 | No |
| --landscape | -l | Use landscape orientation | false | No |
| --scale | -s | Scale of the webpage rendering | 1.0 | No |

### Examples

Convert a website to PDF with default settings:
```bash
node convert.js --url https://example.com
```

Save PDF with a custom filename:
```bash
node convert.js --url https://example.com --output my-page.pdf
```

Create a landscape PDF:
```bash
node convert.js --url https://example.com --landscape
```

Wait longer for dynamic content and use custom scaling:
```bash
node convert.js --url https://example.com --wait 5000 --scale 0.8
```

Use Letter format in landscape mode:
```bash
node convert.js --url https://example.com --format Letter --landscape
```

## Advanced Configuration

The tool provides several customization options through command-line arguments. Here are some common scenarios:

### Handling Dynamic Content

If the website has dynamic content that loads after the initial page load, you can increase the wait time:
```bash
node convert.js --url https://example.com --wait 5000
```

### Adjusting Content Size

If the content appears too large or small in the PDF, you can adjust the scale:
```bash
# Make content smaller (80% of original size)
node convert.js --url https://example.com --scale 0.8

# Make content larger (120% of original size)
node convert.js --url https://example.com --scale 1.2
```

## Troubleshooting

### Common Issues and Solutions

1. **PDF is missing content**
   - Increase the wait time using `--wait`
   - Adjust the scale using `--scale`

2. **Content is cut off**
   - Try using landscape mode with `--landscape`
   - Decrease the scale value
   - Consider using a different paper format

3. **Error: Page Timeout**
   - The website might be slow to load or blocking automated access
   - Try increasing the wait time
   - Check if the website is accessible from your browser

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests if you have suggestions for improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Puppeteer](https://pptr.dev/)
- Command-line interface powered by [yargs](https://yargs.js.org/)
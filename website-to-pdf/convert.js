// First install required packages:
// npm init -y
// npm install puppeteer yargs

const puppeteer = require('puppeteer');
const yargs = require('yargs');
const fs = require('fs');
const path = require('path');

// Configure command line arguments
const argv = yargs
    .option('url', {
        alias: 'u',
        description: 'Website URL to convert',
        type: 'string',
        demandOption: true
    })
    .option('output', {
        alias: 'o',
        description: 'Output PDF filename',
        type: 'string',
        default: 'output.pdf'
    })
    .option('wait', {
        alias: 'w',
        description: 'Time to wait for page load in milliseconds',
        type: 'number',
        default: 1000
    })
    .option('format', {
        alias: 'f',
        description: 'Paper format',
        type: 'string',
        default: 'A4',
        choices: ['A4', 'Letter', 'Legal']
    })
    .option('landscape', {
        alias: 'l',
        description: 'Use landscape orientation',
        type: 'boolean',
        default: false
    })
    .option('scale', {
        alias: 's',
        description: 'Scale of the webpage rendering (default: 1.0)',
        type: 'number',
        default: 1.0
    })
    .option('exclude', {
        alias: 'e',
        description: 'CSS selectors to exclude (comma-separated)',
        type: 'string',
        default: ''
    })
    .argv;

function ensureOutputDirectory() {
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    return outputDir;
}

async function convertWebsiteToPDF(url, outputPath, waitTime, format, landscape, scale, exclude) {
    let browser = null;

    // Ensure output directory exists and create full path
    const outputDir = ensureOutputDirectory();
    const fullOutputPath = path.join(outputDir, path.basename(outputPath));

    try {
        console.log('Launching browser...');
        browser = await puppeteer.launch({
            headless: 'new'
        });

        const page = await browser.newPage();

        await page.setViewport({
            width: landscape ? 1920 : 1080,
            height: landscape ? 1080 : 1920
        });

        console.log(`Navigating to ${url}...`);
        await page.goto(url, {
            waitUntil: 'networkidle0',
            timeout: 60000
        });

        // Handle element exclusion if specified
        if (exclude) {
            const selectors = exclude.split(',').map(s => s.trim());
            console.log('Excluding elements:', selectors);

            await page.evaluate((selectorsToExclude) => {
                function removeElement(selector, doc = document) {
                    const elements = doc.querySelectorAll(selector);
                    if (elements.length > 0) {
                        elements.forEach(el => el.remove());
                        console.log(`✅ Success: Removed ${elements.length} '${selector}' element(s).`);
                        return true;
                    }
                    return false;
                }

                function traverseFramesAndShadowDOM(doc = document) {
                    // Remove each selector from current document
                    selectorsToExclude.forEach(selector => {
                        removeElement(selector, doc);
                    });

                    // Traverse iframes
                    const iframes = doc.querySelectorAll('iframe');
                    iframes.forEach(iframe => {
                        try {
                            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                            if (iframeDoc) {
                                traverseFramesAndShadowDOM(iframeDoc);
                            }
                        } catch (e) {
                            // Cross-origin iframe, cannot access
                        }
                    });

                    // Traverse Shadow DOM
                    const allElements = doc.querySelectorAll('*');
                    allElements.forEach(el => {
                        if (el.shadowRoot) {
                            traverseFramesAndShadowDOM(el.shadowRoot);
                        }
                    });
                }

                // Initial removal
                traverseFramesAndShadowDOM();

                // Set up observer for dynamic elements
                const observer = new MutationObserver(mutations => {
                    mutations.forEach(mutation => {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === 1) {
                                selectorsToExclude.forEach(selector => {
                                    removeElement(selector, node);
                                });
                                if (node.shadowRoot) {
                                    traverseFramesAndShadowDOM(node.shadowRoot);
                                }
                            }
                        });
                    });
                });

                observer.observe(document.body, { childList: true, subtree: true });
            }, selectors);

            // Wait a bit for any dynamic content using setTimeout instead of waitForTimeout
            await page.evaluate((ms) => new Promise(resolve => setTimeout(resolve, ms)), 3000);
        }

        if (waitTime > 0) {
            console.log(`Waiting ${waitTime}ms for dynamic content...`);
            await page.evaluate(waitTime => {
                return new Promise(resolve => setTimeout(resolve, waitTime));
            }, waitTime);
        }

        console.log('Generating PDF...');
        await page.pdf({
            path: fullOutputPath,
            format: format,
            landscape: landscape,
            printBackground: true,
            scale: scale,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        console.log(`PDF successfully created: ${fullOutputPath}`);

    } catch (error) {
        console.error('Error occurred:', error);
        throw error;
    } finally {
        if (browser) {
            console.log('Closing browser...');
            await browser.close();
        }
    }
}

// Run the conversion
(async () => {
    try {
        await convertWebsiteToPDF(
            argv.url,
            argv.output,
            argv.wait,
            argv.format,
            argv.landscape,
            argv.scale,
            argv.exclude
        );
    } catch (error) {
        console.error('Conversion failed:', error);
        process.exit(1);
    }
})();
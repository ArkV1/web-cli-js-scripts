const yargs = require('yargs');
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');

// Configure CLI options
const argv = yargs
    .command('* <url>', 'Download page source code', (yargs) => {
        return yargs.positional('url', {
            describe: 'URL of the page to download',
            type: 'string',
            demandOption: true
        });
    })
    .option('o', {
        alias: 'output',
        describe: 'Output filename',
        type: 'string',
        default: 'page-source.html'
    })
    .help('h')
    .alias('h', 'help')
    .example('node page-downloader https://example.com -o my-page.html')
    .argv;

async function downloadPageSource(url, outputFilename) {
    try {
        console.log(`Downloading from: ${url}`);
        
        // Create output directory path
        const outputDir = path.join(process.cwd(), 'output');
        const outputPath = path.join(outputDir, outputFilename);
        
        // Configure axios to not follow redirects and only accept HTML
        const response = await axios.get(url, {
            maxRedirects: 0,
            headers: {
                'Accept': 'text/html',
                'User-Agent': 'Mozilla/5.0 (compatible; PageSourceBot/1.0)'
            },
            responseType: 'text'
        });
        
        // Ensure we only got HTML
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.includes('text/html')) {
            throw new Error('Response is not HTML content');
        }
        
        // Ensure the output directory exists
        await fs.mkdir(outputDir, { recursive: true });
        
        // Write the raw HTML content to the specified file
        await fs.writeFile(outputPath, response.data);
        
        console.log(`Successfully downloaded HTML source to: ${outputPath}`);
    } catch (error) {
        if (error.response) {
            console.error(`Failed to download page: ${error.response.status} ${error.response.statusText}`);
        } else {
            console.error(`Error: ${error.message}`);
        }
        process.exit(1);
    }
}

// Execute the download
downloadPageSource(argv.url, argv.output);
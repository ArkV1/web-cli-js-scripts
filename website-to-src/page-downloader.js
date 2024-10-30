const yargs = require('yargs');
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');

// Helper function to ensure output directory exists
async function ensureOutputDirectory(outputPath) {
    const outputDir = path.dirname(path.resolve(outputPath));
    try {
        await fs.mkdir(outputDir, { recursive: true });
    } catch (error) {
        console.error(`Failed to create output directory: ${error.message}`);
        throw error;
    }
}

// Configure CLI options
const argv = yargs
    .command('* <url>', 'Download page source code', (yargs) => {
        return yargs.positional('url', {
            describe: 'URL of the page to download',
            type: 'string',
            demandOption: true
        });
    })
    .option('output', {
        alias: 'o',
        describe: 'Output file path',
        type: 'string',
        default: 'output.html'
    })
    .help('h')
    .alias('h', 'help')
    .example('node page-downloader https://example.com -o path/to/my-page.html')
    .argv;

async function downloadPageSource(url, outputPath) {
    try {
        console.log(`Downloading from: ${url}`);
        
        // Ensure output directory exists and get full path
        await ensureOutputDirectory(outputPath);
        const fullOutputPath = path.resolve(outputPath);
        
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
        
        // Write the raw HTML content to the specified file
        await fs.writeFile(fullOutputPath, response.data);
        
        console.log(`Successfully downloaded HTML source to: ${fullOutputPath}`);
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
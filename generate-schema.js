const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');

// --- 1. Load the original openapi.json to get the components ---
const originalSpecPath = path.join(__dirname, 'openapi.json');
const originalSpec = JSON.parse(fs.readFileSync(originalSpecPath, 'utf8'));
const originalComponents = originalSpec.components;

// --- 2. Load swagger-jsdoc options ---
const options = require('./swagger-options');

// --- 3. Merge original components into the options ---
options.definition.components = originalComponents;

// --- 4. Generate the swagger specification ---
const swaggerSpec = swaggerJsdoc(options);

// --- 5. Write the generated spec to a file ---
const outputPath = path.join(__dirname, 'your-schema.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log(`✅ OpenAPI specification generated at ${outputPath}`);
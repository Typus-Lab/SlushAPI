const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Slush DeFi Quickstart Provider API',
      version: '0.0.3',
      description: 'Provider contract for standardized DeFi protocol integration with Slush Wallet.',
    },
    servers: [
      {
        url: 'https://api.partner.example',
      },
    ],
    // The components section should reference the original openapi.json
    // to ensure the schemas are identical.
    components: {
        // This is a bit of a trick. We will load the schemas from the original file
        // instead of redefining them, to ensure they match perfectly.
    }
  },
  // Paths to the API docs
  apis: ['./src/v1/*.ts'],
};

module.exports = options;
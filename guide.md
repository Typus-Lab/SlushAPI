# Partner API Implementation Guide: DeFi Quickstart

## Introduction

Welcome, partner! This guide outlines the requirements for implementing the Slush DeFi Quickstart Provider API. The goal is to create a standardized integration layer that allows Slush Wallet to interact with your DeFi protocol seamlessly.

This document is language-agnostic. You are free to use any programming language, framework, or technology stack to build your API, so long as the final implementation is structurally equivalent to the provided OpenAPI specification.

**The source of truth for this integration is the OpenAPI specification file:** `openapi.json`.

## Core Requirement: Structural Equivalence

Your primary goal is to implement an API that is **structurally equivalent** to the one defined in `openapi.json`.

This means:

- All specified **endpoints** (paths) must be implemented.
- The correct **HTTP methods** (GET, POST) must be used for each endpoint.
- All required **parameters** (path, query) must be supported.
- **Request and response bodies** must strictly adhere to the JSON schemas defined in the specification.

You do **not** need to match our internal type names, variable names, or business logic implementation details. As long as the external-facing API "shape" is identical, the integration will be successful.

## API Endpoints

You must implement the following endpoints:

### Strategies

- `GET /v1/strategies`: List all available investment strategies.
- `GET /v1/strategies/{strategyId}`: Get detailed information about a single strategy.

### Positions

- `GET /v1/positions`: List a user's positions for a given wallet address.
- `GET /v1/positions/{positionId}`: Get detailed information about a single position.

### Transactions

- `POST /v1/deposit`: Create a deposit transaction for a specified strategy.
- `POST /v1/withdraw`: Create a withdrawal transaction from a specified position.

## Verification: Ensuring Compatibility

To ensure your implementation is compatible, you must verify it against the provided OpenAPI specification. The recommended way to do this is by generating an OpenAPI schema from your own implementation and comparing it for breaking changes against ours.

### Step 1: Generate Your OpenAPI Schema

Most modern web frameworks have tools or libraries that can automatically generate an OpenAPI 3.1 schema from your code (e.g., through decorators, code reflection, or route definitions). Please generate a `your-schema.json` file from your implementation.

### Step 2: Compare Schemas with `oasdiff`

We use `oasdiff`, an open-source command-line tool, to detect breaking changes between two OpenAPI specifications.

1.  **Install `oasdiff`:** Follow the installation instructions on the [official oasdiff repository](https://github.com/Tufin/oasdiff).

2.  **Run the comparison:** Execute the following command from the root of this project, replacing `your-schema.json` with the path to your generated schema file.

    ```bash
    oasdiff breaking ./openapi.json /path/to/your-schema.json
    ```

### Step 3: Analyze the Results

- If the command output is empty, your implementation is structurally compatible. Congratulations!
- If the command lists breaking changes, it means your API's structure does not match the required specification. You must address the reported issues and re-run the comparison until no breaking changes are found.

By following this guide and using the verification process, you can ensure a smooth and successful integration with the Slush Wallet ecosystem.

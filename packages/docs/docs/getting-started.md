---
title: Getting started
---

<!-- markdownlint-disable MD033 MD025 MD010 -->

Welcome to Fern! This guide walks through setting up Fern in your repo, defining your API, and generating code.

### Setting up Fern in your repo

#### Install

In terminal, run `npm install -g fern-api`.

#### Initialize

In the root of your repo, run `fern init`. This will create the following folder structure in your project:

```yaml
fern/
├─ fern.config.json # root-level configuration
└─ api/ # your API
  ├─ generators.yml # generators you're using
  └─ definition/
    ├─ api.yml  # API-level configuration
    └─ imdb.yml # endpoints, types, and errors
```

### Defining your API

Your **Fern Definition** is a set of YAML files that are the single source of truth for your API. You check your **Fern Definition** into your repo, inside of which describes your API requests, responses, model, paths, methods, errors, and authentication scheme.

Check out [an example Fern Definition](https://github.com/fern-api/fern-examples/blob/main/fern/api/definition/movie.yml) on Github.

:::tip Already have OpenAPI description?

[Use our openapi-to-fern converter](mailto:hey@buildwithfern.com?subject=OpenAPI%20to%20Fern&body=Hey-%20%0A%0AHere's%20an%20attachment%2Flink%20to%20my%20OpenAPI%20description.%20Can%20you%20convert%20it%20to%20a%20Fern%20Definition%3F).

:::

### Generate code

Fern's code generators run remotely in the cloud. The input is your **Fern Definition** and the output is auto-generated code. You configure which generators you're using in [`generators.yml`](./cli/generate.md).

Check out [an example generators.yml](https://github.com/fern-api/fern-examples/blob/main/fern/api/generators.yml) on Github.

### What's next?

- [How do I get SDKs?](./features/sdk.md)
- [How do I get API documentation?](./features/api-docs.md)
- [How do I get server-side type safety?](./features/server.md)
- [How do I get a Postman integration?](./features/postman.md)

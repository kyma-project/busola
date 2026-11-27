# Tests

## Overview

| Directory                        | Tool              | Cluster needed | What it measures                           |
| -------------------------------- | ----------------- | -------------- | ------------------------------------------ |
| [`integration/`](./integration/) | Cypress E2E       | yes            | functional correctness                     |
| [`lighthouse/`](./lighthouse/)   | Playwright        | yes            | page load scores, E2E performance journeys |
| [`performance/`](./performance/) | Cypress component | no             | component render times in isolation        |

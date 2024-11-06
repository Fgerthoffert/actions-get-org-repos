<!-- markdownlint-disable MD041 -->
<p align="center">
  <img alt="ZenCrepesLogo" src="docs/zencrepes-logo.png" height="140" />
  <h2 align="center">Get Org Repos</h2>
  <p align="center">Fetch data about all repositories attached to a GitHub Organization</p>
</p>

---

<div align="center">

[![GitHub Super-Linter](https://github.com/fgerthoffert/actions-get-org-repos/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/fgerthoffert/actions-get-org-repos/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/fgerthoffert/actions-get-org-repos/actions/workflows/check-dist.yml/badge.svg)](https://github.com/fgerthoffert/actions-get-org-repos/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/fgerthoffert/actions-get-org-repos/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/fgerthoffert/actions-get-org-repos/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

</div>

---

# About

Based on work done a few years ago on
[ZenCrepes](https://docs.zencrepes.io/docs/).

The goal of this action is to fetch particular repository details for all
repositories attached to an organization, with the objective of being able to
centralize information in one single place.

## Collected data

Data is collected via a GraphQL query to GitHub, the content of the generated
JSON is based on nodes present in this query.

TODO: Add more details about what data is present

## GitHub Rate Limits

The action will play gently with GitHub rate limits (it follow the
[official guidelines](https://docs.github.com/en/graphql/overview/rate-limits-and-node-limits-for-the-graphql-api)),
but it is going to perform expensive queries. Depending of the number of
repositories in your organization, running the action might consume all credits
for the user attached to the personal API token.

This is not necessarily an issue per se, but something to consider if that same
user is performing other API operations.

## Required privileges

The token used for performing the request must have the following scopes:
['read:org']

# :gear: Configuration

## Input Parameters

The following input parameters are available:

| Parameter          | Default           | Description                                                                                                                                                                                                       |
| ------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| org                |                   | A GitHub organization to fetch data from                                                                                                                                                                          |
| token              |                   | A GitHub Personal API Token with the correct scopes (see above)                                                                                                                                                   |
| filter_topics      |                   | A comma separated (no space) list of topics to filter repositories by before fetching all the data. You can specify the "EMPTY", for example to filter by repositories with the "tooling" topic OR without topics |
| filter_operator    | AND               | Default operator to apply on filters. Can take "OR" or "AND"                                                                                                                                                      |
| artifact_name      | repositories.json | Name fo the GitHub artifact that will be generated during the run                                                                                                                                                 |
| artifact_retention | 2                 | Number of retention days for the artifact                                                                                                                                                                         |

## Outputs

The following outputs are available:

| Name              | Description                                                                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| artifact_filepath | The filepath, on the local filesystem, where the JSON file is saved. This is useful to perform operations on that JSON in following steps within the same job. |

# :rocket: Usage

## Filter repos

For organizations with a very large number of repositories you might not want to
fetch data about absolutely all repositories, mechanisms are available to filter
repositories by:

- their topics (OR and AND operator available)
- their archive status (not grabbing detailed about archived repos by default)

## Generate a JSON report

Sample workflow, generating a JSON report

```yaml
name: Fetch Orgs Repos

on:
  workflow_dispatch:

jobs:
  get-org-repos:
    runs-on: ubuntu-latest
    steps:
      - name: Create Release Notes
        uses: fgerthoffert/actions-get-org-repos
        with:
          org: zencrepes
          token: YOUR_TOKEN
```

## Generate a CSV report

## Upload report to Google Spreadsheet

# How to contribute

- Fork the repository
- npm install
- Rename .env.example into .env
- Update the INPUT_ variables
- Do your changes
- npx local-action . src/main.ts .env
- npm run bundle
- npm test
- PR into this repository, detailing your changes


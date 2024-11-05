<p align="center">
  <img alt="GoReleaser Logo" src="docs/zencrepes-logo.png" height="140" />
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
for the user attached to the personal api token.

This is not necessarily an issue per se, but something to consider if that same
user is performing other API operations.

# :rocket: Usage

## Filter repos

For organizations with a very large number of repositories you might not want to
fetch data about absolutely all repositories, mechanisms are available to filter
repositories by:

- their topics (OR and AND operand available)
- their archive status (not grabbing detailed about archived repos by default)

## Generate a JSON report

Sample workflow, generating a JSON report

```
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

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

| Parameter               | Default             | Description                                                                                                                                                                                                       |
| ----------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| org                     |                     | A GitHub organization to fetch data from                                                                                                                                                                          |
| token                   |                     | A GitHub Personal API Token with the correct scopes (see above)                                                                                                                                                   |
| fetch_custom_properties | false               | Perform additional REST calls to fetch repositories custom properties                                                                                                                                             |
| filter_topics           |                     | A comma separated (no space) list of topics to filter repositories by before fetching all the data. You can specify the "EMPTY", for example to filter by repositories with the "tooling" topic OR without topics |
| filter_operator         | AND                 | Default operator to apply on filters. Can take "OR" or "AND"                                                                                                                                                      |
| artifact_filename       | repositories.ndjson | Actual filename that will be use to save the file on disk. run                                                                                                                                                    |
| artifact_name           | repositories.ndjson | Name fo the GitHub artifact that will be generated during the run                                                                                                                                                 |
| artifact_retention      | 2                   | Number of retention days for the artifact                                                                                                                                                                         |

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
      - name: Get Repos data from Org
        # Replace main by the release of your choice
        uses: fgerthoffert/actions-get-org-repos@main
        with:
          org: zencrepes
          token: YOUR_TOKEN
```

The action will append to already existing ndjson files. You can call the action
multiple times, each time with a different GitHub organization, and without
changing the `artifact_filename` input to generate one single ndjson file
containing multiple organizations.

## Generate a CSV report and upload to Google Sheets

The generated JSON can be converted to CSV using
[json2csv](https://juanjodiaz.github.io/json2csv/#/parsers/cli).

Begin by creating the JavaScript fields configuration, it will define the
configuration for generating the CSV file from the NDJSON file generated by the
action.

```javascript
export default {
  fields: [
    {
      label: 'Name',
      value: row => {
        return row.nameWithOwner
      }
    },
    {
      label: 'URL',
      value: row => {
        return row.url
      }
    },
    {
      label: 'Topics',
      value: row => {
        return row.repositoryTopics.edges
          .map(e => e.node.topic.name)
          .sort()
          .join(', ')
      }
    }
  ]
}
```

Commit this file (here in `.github/config/delivery-grab-repos-cfg.js`) to your
repository in the location of your choice.

Make sure to add the needed secrets in your repository settings:

- GH_PERSONAL_TOKEN: GitHub Personal API token
- INCIDENT_GOOGLE_CLIENT_EMAIL: Your Google Auth email (see:
  [the action configuration](https://github.com/Fgerthoffert/actions-csv-to-gsheet?tab=readme-ov-file#google-authentication))
- INCIDENT_GOOGLE_PRIVATE_KEY_BASE64: base64 encoded Private key generated when
  setting up Google Authentication
- INCIDENT_GOOGLE_SPREADSHEET_ID: Your google spreadsheet ID (you can find it in
  the URL of the spreadsheet)

And update the parameters (`with`) to match your GitHub organization (name,
topics filters if desired, ...) and Google Sheet (name of the worsksheet, header
row, ID column).

```yaml
name: Grab Org Repositories

on:
  schedule:
    - cron: '0 5 * * *'
  workflow_dispatch:

jobs:
  get-org-repos:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*

      - name: Get Org Repositories
        id: get-repos
        # Replace main by the release of your choice
        uses: fgerthoffert/actions-get-org-repos@main
        with:
          org: zencrepes
          token: ${{ secrets.GH_PERSONAL_TOKEN }}
          fetch_custom_properties: true
          filter_topics: product
          filter_operator: AND
          filter_ignore_archived: true

      - name: Convert the NDJSON to CSV
        shell: bash
        run: |
          npx @json2csv/cli -i ${{ steps.get-repos.outputs.artifact_filepath }} --ndjson --config ${{ github.workspace }}/.github/config/delivery-grab-repos-cfg.js -o repositories.csv

      - name: Archive CSV artifacts
        uses: actions/upload-artifact@v4
        with:
          name: repositories.csv
          path: |
            repositories.csv
          retention-days: 2

      - name: Push the CSV file to Google Sheets
        # Replace main by the release of your choice
        uses: fgerthoffert/actions-csv-to-gsheet@main
        with:
          csv_filepath: repositories.csv
          gsheet_auth_email: ${{ secrets.INCIDENT_GOOGLE_CLIENT_EMAIL }}
          gsheet_auth_pkey: ${{ secrets.INCIDENT_GOOGLE_PRIVATE_KEY_BASE64 }}
          gsheet_id: ${{ secrets.INCIDENT_GOOGLE_SPREADSHEET_ID }}
          gsheet_worksheet_title: Repos
          gsheet_header_row: 1
          gsheet_title_key: Name
```

# How to contribute

- Fork the repository
- npm install
- Rename .env.example into .env
- Update the INPUT\_ variables
- Do your changes
- npx local-action . src/main.ts .env
- npm run bundle
- npm test
- PR into this repository, detailing your changes

More details about GitHub TypeScript action are
[available here](https://github.com/actions/typescript-action)

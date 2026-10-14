# open-data-actors-mcp: MCP server for public-data Apify actors (sanctions, SEC Form D, WARN, FMCSA)

A thin [Model Context Protocol](https://modelcontextprotocol.io) server that exposes 29 public-data [Apify](https://apify.com) actors as tools: sanctions screening, SEC Form D funding leads, WARN layoff notices, FMCSA new carriers, technical SEO audits, tech-stack detection, job boards, building permits, Google Maps places, TikTok profiles, YouTube comments, Amazon best sellers, SAM.gov federal bids, and more.

**Disclosure:** I am the author and maintainer of these actors. They run on Apify and are pay-per-result; the Apify free plan credit covers a trial. This server only forwards your tool call to the Apify API with *your* token. It has no backend of its own, stores nothing, and sends nothing anywhere else. If you want Apify's general-purpose MCP server (every Store actor), use [mcp.apify.com](https://mcp.apify.com); this one is a small, fixed, typed subset.

## Hosted (no install)

Stateless streamable-HTTP endpoint: `https://open-data-actors-mcp.vercel.app/mcp`

Bring your own Apify token on every request (`Authorization: Bearer <token>`, or `?token=`). Nothing is stored or logged by us; runs bill to your own Apify account. Rate limit: 30 requests/minute per token.

```
claude mcp add --transport http open-data-actors https://open-data-actors-mcp.vercel.app/mcp --header "Authorization: Bearer $APIFY_TOKEN"
```

Verify with a real client: `APIFY_TOKEN=... node test/http.test.mjs`.

## Install

You need Node 18+ and an Apify API token (<https://console.apify.com/settings/integrations>).

```json
{
  "mcpServers": {
    "open-data-actors": {
      "command": "npx",
      "args": ["-y", "github:Mamoo85/open-data-actors-mcp"],
      "env": { "APIFY_TOKEN": "your-apify-token" }
    }
  }
}
```

(Not on npm yet; the `github:` form installs straight from this repo.) Works in Claude Desktop, Claude Code (`claude mcp add open-data-actors -e APIFY_TOKEN=... -- npx -y github:Mamoo85/open-data-actors-mcp`), Cursor, and any stdio MCP client.

## Tools

Each tool takes the actor's own input fields plus `max_results` (default 25, cap 200). Calls run synchronously (`run-sync-get-dataset-items`, 240 s timeout) and return `{count, items}`. Fields that are secrets or state (proxy settings, API keys, webhook URLs, incremental-state names) are intentionally not exposed.

| Tool | Actor | Link |
|---|---|---|
| `fmcsa_new_carrier_leads` | FMCSA New Motor Carrier Leads: New Authority, Email & Phone | [Store](https://apify.com/transparent_meteorite/fmcsa-new-carrier-leads) |
| `warn_layoff_alerts` | WARN Layoff Notices API: 7 States (TX CA WA OR MD VA NC) $3/1k | [Store](https://apify.com/transparent_meteorite/warn-layoff-alerts) |
| `website_tech_stack_detector` | Website Tech Stack Lookup: CMS, Frameworks, Hosting $0.002/site | [Store](https://apify.com/transparent_meteorite/website-tech-stack-detector) |
| `ats_open_roles` | Career Site Jobs API: Greenhouse, Lever, Ashby & more | $2/1k | [Store](https://apify.com/transparent_meteorite/ats-open-roles) |
| `city_council_agendas` | City Council Meetings & Agendas: Legistar Votes, PDFs | $1/1k | [Store](https://apify.com/transparent_meteorite/city-council-agendas) |
| `company_enrichment_by_domain` | Company Enrichment by Domain: Socials, Emails, Tech Stack $5/1k | [Store](https://apify.com/transparent_meteorite/company-enrichment-by-domain) |
| `sec_form_d_funding_leads` | SEC Form D Startup Funding Leads: Recently Funded, $2.50/1k | [Store](https://apify.com/transparent_meteorite/sec-form-d-funding-leads) |
| `technical_seo_page_audit` | Technical SEO Page Audit: Broken Links, Hreflang, $3/1k | [Store](https://apify.com/transparent_meteorite/technical-seo-page-audit) |
| `domain_intelligence_lookup` | Domain Intelligence: WHOIS/RDAP, DNS, Subdomains, SSL, $2/1k | [Store](https://apify.com/transparent_meteorite/domain-intelligence-lookup) |
| `new_business_filings` | New Business Filings: New LLCs and Corporations, $4/1k | [Store](https://apify.com/transparent_meteorite/new-business-filings) |
| `app_store_reviews` | App Store Reviews Scraper: Ratings, 150+ Countries, $0.50/1k | [Store](https://apify.com/transparent_meteorite/app-store-reviews) |
| `website_contact_extractor` | Website Contact Details Scraper: Emails, Phones & Socials $2/1k | [Store](https://apify.com/transparent_meteorite/website-contact-extractor) |
| `shopify_store_leads` | Shopify Leads: Store Apps, Products & Contacts | $4/1k | [Store](https://apify.com/transparent_meteorite/shopify-store-leads) |
| `local_business_leads` | Local Business Leads: No-Website Finder (OpenStreetMap) $3/1k | [Store](https://apify.com/transparent_meteorite/local-business-leads) |
| `workday_jobs_scraper` | Workday Jobs Scraper: Any Career Site, 165+ Companies $1/1k | [Store](https://apify.com/transparent_meteorite/workday-jobs-scraper) |
| `company_news_monitor` | Company News Monitor: Brand & Keyword News Alerts, $2/1k | [Store](https://apify.com/transparent_meteorite/company-news-monitor) |
| `building_permits_leads` | Building Permits Leads: US City Permits and Violations, $1.5/1k | [Store](https://apify.com/transparent_meteorite/building-permits-leads) |
| `sitemap_link_inventory` | Sitemap Link Inventory: All URLs + Broken-Link Check, $1/1k | [Store](https://apify.com/transparent_meteorite/sitemap-link-inventory) |
| `developer_signals` | Hacker News, npm & PyPI Developer Signals | [Store](https://apify.com/transparent_meteorite/developer-signals) |
| `sanctions_screening` | Sanctions Screening: OFAC SDN, EU, UN & UK Lists, Fuzzy Match | [Store](https://apify.com/transparent_meteorite/sanctions-screening) |
| `federal_grants_contracts` | Federal Grants & Contracts Finder: Grants.gov + USAspending | [Store](https://apify.com/transparent_meteorite/federal-grants-contracts) |
| `amazon_product_search` | Amazon Product Search: prices, ratings, ASINs | [Store](https://apify.com/transparent_meteorite/amazon-product-search) |
| `linkedin_public_jobs` | LinkedIn Public Jobs Scraper (no login) | Salary & Level | [Store](https://apify.com/transparent_meteorite/linkedin-public-jobs) |
| `meta_ad_library` | Meta Ad Library Scraper: Facebook & Instagram Ads | [Store](https://apify.com/transparent_meteorite/meta-ad-library) |
| `google_maps_places_scraper` | Google Maps Scraper: Places, Phones, Emails, Reviews | [Store](https://apify.com/transparent_meteorite/google-maps-places-scraper) |
| `tiktok_public_profile_scraper` | TikTok Profile Scraper: Followers, Posts, Bio Email, $2.5/1K | [Store](https://apify.com/transparent_meteorite/tiktok-public-profile-scraper) |
| `youtube_comments_scraper` | YouTube Comments Scraper: Comments + Replies, $1/1K | [Store](https://apify.com/transparent_meteorite/youtube-comments-scraper) |
| `amazon_bestsellers` | Amazon Best Sellers Scraper: Ranks, 21 Countries, $1.9/1K | [Store](https://apify.com/transparent_meteorite/amazon-bestsellers) |
| `sam_gov_opportunities` | SAM.gov Contract Opportunities: Federal Bids & RFPs | [Store](https://apify.com/transparent_meteorite/sam-gov-opportunities) |

## Cost

Each call starts an Apify run and you pay Apify the actor's pay-per-result price for the rows it produces. Lower `max_results` to cap spend. See each Store page for current pricing.

## Tests

`npm test` starts the server and drives it with the real MCP SDK client over stdio: lists tools, checks error handling, and (when `APIFY_TOKEN` is set) makes one live `tools/call`. Verified 2026-10-14: 29 tools listed, live `sanctions_screening` call returned data.

## Development

`python gen.py` regenerates `src/tools.json` from the actors' published input schemas.

MIT licensed.

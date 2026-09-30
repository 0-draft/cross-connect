# cross-connect

[![ci](https://github.com/0-draft/cross-connect/actions/workflows/ci.yml/badge.svg)](https://github.com/0-draft/cross-connect/actions/workflows/ci.yml)
[![deploy](https://github.com/0-draft/cross-connect/actions/workflows/deploy.yml/badge.svg)](https://github.com/0-draft/cross-connect/actions/workflows/deploy.yml)

AWS Direct Connect, drawn. An illustrated, bilingual (English / 日本語) explainer that walks from the cross connect in a colocation facility to BGP path selection, resiliency models, MACsec and the monthly bill. It is built around the specific reasons people find Direct Connect hard ([research](docs/13-why-dx-is-hard.md)), with a guide character, Hikari, a photon who lives in the fiber.

**Site:** <https://0-draft.github.io/cross-connect/> ([日本語](https://0-draft.github.io/cross-connect/?lang=ja))

[日本語の README](README.ja.md)

## What is in it

| Section | Interactive part |
| --- | --- |
| Why is it hard? | The four root causes, a layer map with tap-to-define terms, who owns what, and the common traps linked to where each is untangled |
| Overview | Clickable end-to-end path: router, carrier, cage, cross connect, DX router, VIFs, gateways |
| Connections | Speed ladder, dedicated vs hosted, step-by-step LOA-CFA ordering |
| LAG and MACsec | Cut LAG members and watch minimum links; `should_encrypt` vs `must_encrypt` |
| Virtual interfaces | Switch private / public / transit and see what each reaches |
| Direct Connect gateway | VGW / TGW / Cloud WAN modes, allowed-prefix lab, SiteLink toggle |
| BGP | Path selection lab: prefix length, `7224:7x00` communities, AS_PATH prepend, home Region, VPN backup, and an asymmetric-routing warning when your outbound choice disagrees with AWS |
| Resiliency | Failure lab for the Maximum / High / Dev-Test / Classic models |
| Security | Which segment MACsec, IPsec and TLS protect |
| Operations | Yes/no troubleshooting tree, metrics worth an alarm |
| Pricing | Monthly estimate from list prices, flat-rate break-even |
| Patterns | Seven questions to a topology, anti-patterns |
| Quiz | Ten myth-or-fact cards on the most common misconceptions |
| Timeline | 2011–2026 launches |
| Glossary | Every term with its official English and Japanese console name and what it is often confused with |

The research behind every number lives in [`docs/`](docs/README.md), with sources. Facts were verified against AWS documentation on 2026-09-30.

## Development

Requires Node.js 24.

```bash
npm ci
npm run dev        # http://localhost:5173/cross-connect/
npm run check      # typecheck, lint, format, markdownlint, tests, build
```

The simulators (`src/lib/`) are pure functions with unit tests: BGP path selection, resiliency models, LAG and MACsec rules, allowed-prefix behavior, the pricing calculator (checked against AWS's own worked examples) and the topology advisor.

## CI

| Workflow | What it does |
| --- | --- |
| `ci.yml` | typecheck, ESLint, Prettier, markdownlint, build, tests with coverage, actionlint, `npm audit`, dependency review on PRs |
| `codeql.yml` | CodeQL for JavaScript/TypeScript and GitHub Actions |
| `deploy.yml` | Builds and deploys to GitHub Pages on every push to `main` |
| Dependabot | Weekly grouped updates for npm and GitHub Actions |

## Disclaimer

An independent explainer, not affiliated with or endorsed by Amazon Web Services. Prices and quotas change; check the AWS documentation before you design or buy.

## License

[MIT](LICENSE)

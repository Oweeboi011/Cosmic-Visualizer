# Cosmic Visualizer

A read-only dashboard for space and astronomy data from NASA, ESA and ESO: galaxy and planet
imagery, interactive 3D galaxies, Solar System and star classes, exoplanets, live
space-weather alerts, the latest findings, and a glossary. Next.js 16, React 19, three.js.

```bash
npm install
cp .env.example .env.local   # set NASA_API_KEY (free at https://api.nasa.gov/)
npm run dev                  # http://localhost:3000
npm run verify               # the same gate CI runs
```

## Documentation

| Question                                | Read                                                                                                                          |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| What is it, and how is it put together? | [docs/guides/architecture.md](docs/guides/architecture.md)                                                                    |
| How do I work on it?                    | [docs/guides/development.md](docs/guides/development.md)                                                                      |
| What should it do?                      | [docs/solution-plan/scope.md](docs/solution-plan/scope.md)                                                                    |
| How is it tested and delivered?         | [docs/solution-plan/quality-harness.md](docs/solution-plan/quality-harness.md), [delivery.md](docs/solution-plan/delivery.md) |
| Why was it designed this way?           | [docs/adr/](docs/adr/README.md)                                                                                               |

`visuals/` is a separate Vite prototype; see [visuals/README.md](visuals/README.md).

Data courtesy of NASA, ESA and ESO. This project isn't affiliated with or endorsed by them.

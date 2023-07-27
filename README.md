# Refs: Project Tree Example

```r
my-package/
├─ src/
│  ├─ browser/
│  │  ├─ index.ts   # Browser-specific TypeScript code
│  ├─ node/
│  │  ├─ index.ts   # Node-specific TypeScript code
│  ├─ shared/
│  │  ├─ index.ts   # TypeScript code common to both Node and browser
├─ dist/
│  ├─ browser/      # Output directory for browser-specific code
│  ├─ node/         # Output directory for Node-specific code
├─ types/
│  ├─ browser/      # Output directory for browser-specific types
│  ├─ node/         # Output directory for Node-specific types
├─ tsconfig.json
└─ package.json
```

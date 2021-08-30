# total-asset-size-action

Calculate & compare the asset sizes of PR builds.

This will generate a comment like this on PRs:

> 🚨 `dist/assets/*.js` got bigger:
> File(s) | Gzipped | Raw | Gzipped +/-
> --- | --- | --- | ---
> dist/assets/\*.js | 981 kB | 4.6 MB | +169 kB
>
> <details>
>   <summary>
>     Show breakdown per file
>   </summary>
>
> | File(s)                                                      | Gzipped | Raw     | Gzipped +/- |
> | ------------------------------------------------------------ | ------- | ------- | ----------- |
> | dist/assets/chunk.143.f3ec95c5774a91655e74.js                | 2.25 kB | 4.93 kB | -801 B      |
> | dist/assets/chunk.177.314749eaa2983ac9f767.js                | 132 kB  | 501 kB  | -2.69 kB    |
> | dist/assets/chunk.178.9014245c7e17ab99edb9.js                | 866 B   | 1.63 kB | -223 B      |
> | dist/assets/chunk.272.045adf547aa2f63fad41.js                | 10.8 kB | 34.7 kB | +5.12 kB    |
> | dist/assets/chunk.383.ebc4fe2cadcc34206af9.js                | 264 kB  | 1.16 MB | +89.9 kB    |
> | dist/assets/chunk.688.af8abd680c8fa18ad72f.js                | 112 kB  | 386 kB  | -41.3 kB    |
> | dist/assets/chunk.714.c5ae97ad56de09552265.js                | 5.09 kB | 13.8 kB | +2.14 kB    |
> | dist/assets/chunk.798.f92dc175740c206ceaaa.js                | 2.65 kB | 6.29 kB | -313 B      |
> | dist/assets/chunk.970.b41e13e5da33ba0f66b0.js                | 16.6 kB | 52.5 kB | -4.54 kB    |
> | dist/assets/fabscale-app-c098c971d202e7e916fe86d286de67a1.js | 235 kB  | 1.65 MB | +65.7 kB    |
> | dist/assets/vendor-9dfd5bee2d500439a6e6524fa35ebed5.js       | 200 kB  | 782 kB  | +56.4 kB    |
>
> </details>
>
> 🎉 `dist/assets/*.css` got smaller:
> File(s) | Gzipped | Raw | Gzipped +/-
> --- | --- | --- | ---
> dist/assets/\*.css | 12.6 kB | 60 kB | -2.87 kB
>
> <details>
>   <summary>
>     Show breakdown per file
>   </summary>
>
> | File(s)                                                       | Gzipped | Raw     | Gzipped +/- |
> | ------------------------------------------------------------- | ------- | ------- | ----------- |
> | dist/assets/fabscale-app-a26dafa6b60b634ea5eadd0660b7b2b7.css | 11.6 kB | 56.2 kB | -2.44 kB    |
> | dist/assets/vendor-6662738823da4284f3dc754a198e37be.css       | 1.01 kB | 3.87 kB | -423 B      |
>
> </details>

This is heavily inspired and partially lifted from [ember-asset-size-action](https://github.com/simplabs/ember-asset-size-action).

## Usage

Create a file named `.github/workflows/asset-sizes.yml` in your repo and add the following:

```yaml
name: Asset Sizes

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - uses: mydea/total-asset-size-action@v1
        with:
          repo_token: '${{ secrets.GITHUB_TOKEN }}'
          build_command: 'yarn build'
          file_patterns: '["dist/assets/*.js", "dist/assets/*.css"]'
```

Note: as this action requires access to the "base" commit of a PR branch we need to fetch the whole repo by adding `fetch-depth: 0` to the `actions/checkout` configuration.

`file_patterns` should be a JSON-encoded array of glob patterns.
Each pattern will be combined to a total size.

# Course Atlas

Course Atlas is a static directory of DTU elective reviews. It uses HTML, custom CSS, JavaScript ES modules, and a JSON archive. Search, rankings, and the English/original language switch run in the browser. Bookmarks and theme preferences use browser localStorage.

## Project layout

- `dist/index.html` loads the site.
- `dist/assets/app.js` renders the directory, reviews, rankings, and source links.
- `dist/assets/app.css` contains the responsive layout and color themes.
- `dist/assets/icons.js` defines the interface icons.
- `dist/assets/archive.json` contains 361 reviews and rankings for 61 course entries.
- `dist/files/` contains the original and English PDFs.

The editable source files are already in the deployable `dist/` directory. Course Atlas has no build or package-install step.

## Preview locally

From the directory containing this README, run:

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000/ in a browser. Use an HTTP server so the browser can load the JavaScript modules and JSON.

## Deploy from GitHub with Cloudflare Pages

Create a private GitHub repository and commit this README and the entire `dist/` directory to the repository root. In Cloudflare, open Workers & Pages, create a Pages project, and choose **Import an existing Git repository**. Select the GitHub repository and configure:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | None |
| Build command | `exit 0` |
| Build output directory | `dist` |
| Root directory | Repository root |

A private GitHub repository controls access to the code. Configure viewer access separately on the deployed site if you are running an invite-only pilot.

[Cloudflare Pages guide for static HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)

## Credits

Course Atlas was built by [Mohayyad Muawia](https://mohayyad.dev/). The About & Credits page links to his portfolio and to [Fresources.tech](https://fresources.tech/).

Fresources.tech is credited as the compiler of the original review survey. [Original workbook](https://bit.ly/FECreview). Review the source's redistribution terms before publishing the PDFs and review dataset publicly.

Roboto is copyright 2011 Google Inc. and is distributed under the Apache License, Version 2.0. See [the bundled license](dist/assets/licenses/Roboto-Apache-2.0.txt).

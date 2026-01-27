# dnn-simple-theme-base

A simple starting point for building a **DNN theme outside of DNN**.

This project is intended as a **base example** for users with less experience.
It focuses on clarity and simplicity rather than advanced features.

---

## Status

Work in progress, feedback welcome

---

## Goal

* Build a DNN theme in one central location
* Automatically copy the generated files to one or more local DNN installations

This allows you to develop and update your theme without working directly inside a DNN installation.

---

## Technology Used

* Node.js
* Gulp 5

---

## Requirements

* Node.js installed
* Run `npm install`

---

## Description

* Values written as `[token]` are read from the configuration file
* `[targetPaths]` can contain **one or more target locations**
* The build process outputs **minified CSS** and **minified JS** for skins

### Build Output

For each `targetPath`:

* **Skin files:** `[targetPaths]/Skins/[themeName]`
  * `skin.css` (minified, compiled from SCSS)
  * `skin.js` (minified, concatenated from JS files)
* **Container files:** `[targetPaths]/Containers/[themeName]`

---

## Watch Tasks

* **Skin and Container folders**
  When a file is changed or added, all files in the target location are removed and replaced with the updated files.
* **`src/scss` folder**
  SCSS files are compiled into `skin.css`.
* **`src/js` folder**
  JavaScript files are concatenated and minified into `skin.js`.

---

## Quick Start (Beginner Friendly)

A. Make sure you have [Node.js and npm installed](nodejs.md) before running this project.

B. Download the source zip from GitHub.

C. Unzip the folder **outside of any DNN installation**.

D. Copy `config.json` to `config-local.json`  
**Do not edit `config.json` directly** - this is the base template  
Instead, override any settings you need in `config-local.json`  

* Update paths, theme name, and JS file order for your local setup
* `targetPaths` can contain **one or more DNN installation skin paths**.
  * Each path should point to the DNN portal's folder where skins and containers reside:
    ```
    [DNN Site Root]/Portals/Default
    ```
  * This allows the build process to copy the generated files to **multiple DNN installations at once**.
  * Example:
    ```json
    {
      "themeName": "MyTheme",
      "targetPaths": [
        "C:/DNN/Website1/Portals/Default",
        "C:/DNN/Website2/Portals/Default"
      ],
      "jsFiles": [
        "src/js/vendor/jquery.js",
        "src/js/vendor/bootstrap.js",
        "src/js/components/*.js",
        "src/js/main.js"
      ]
    }
    ```

E. Install dependencies:

```bash
npm install
```

F. Build the theme once:

```bash
npx gulp
```

G. Start watching for changes (optional, recommended for development):

```bash
npx gulp watch
```

H. The compiled files (`skin.css` and `skin.js`) are now in `[targetPaths]/Skins/[themeName]`.

---

## Gulp Tasks

* **`gulp`** or **`gulp distribute`** - Build everything and copy to target paths (default)
* **`gulp build`** - Build to dist folder only (no distribution)
* **`gulp sync`** - Distribute current dist folder contents without rebuilding
* **`gulp watch`** - Watch for file changes and auto-distribute
* **`gulp init`** - Full refresh: build, distribute, and start watching
* **`gulp clean`** - Remove all output files (dist and target paths)

---

## JavaScript File Order

JavaScript files are concatenated in the order specified in your `config-local.json`:

```json
{
  "jsFiles": [
    "src/js/vendor/jquery.js",
    "src/js/vendor/bootstrap.js",
    "src/js/components/*.js",
    "src/js/main.js"
  ]
}
```

---

## Managing Vendor Files (Bootstrap, jQuery, etc.)

The `vendors/` folder is for **pre-built, production-ready** CSS and JavaScript files that don't need processing. These files are copied as-is to your distribution folder.

### Key Concept

- **`src/`** = Source files that will be compiled/processed (SCSS → CSS, multiple JS → bundled JS)
- **`vendors/`** = Already processed files, copied as-is (minified CSS/JS libraries)

### Option 1: Manual Vendor Files (Simplest)

Download pre-built files and place them in the `vendors/` folder:

```
vendors/
├─ bootstrap/
│   ├─ bootstrap.min.css
│   └─ bootstrap.bundle.min.js
└─ bootstrap-icons/
    ├─ bootstrap-icons.css
    └─ fonts/
        └─ bootstrap-icons.woff2
```

Run `gulp` and these files will be copied to `_dist/Skins/[YourTheme]/vendors/`.

Reference in your skin file:
```aspx
<%@ Register TagPrefix="dnn" Namespace="DotNetNuke.Web.Client.ClientResourceManagement" Assembly="DotNetNuke.Web.Client" %>
<dnn:DnnCssInclude runat="server" FilePath="vendors/bootstrap/bootstrap.min.css" PathNameAlias="SkinPath" />
<dnn:DnnJsInclude runat="server" ForceProvider="DnnFormBottomProvider" FilePath="vendors/bootstrap/bootstrap.bundle.min.js" PathNameAlias="SkinPath" />
```

### Option 2: Get Vendors from npm

For automatic vendor management, configure npm packages in your `config-local.json`:

**Step 1:** Install packages via npm
```bash
npm install bootstrap bootstrap-icons
```

**Step 2:** Configure in `config-local.json`
```json
{
  "themeName": "MyTheme",
  "npmVendors": {
    "bootstrap": {
      "package": "bootstrap",
      "files": [
        "dist/css/bootstrap.min.css",
        "dist/css/bootstrap.min.css.map",
        "dist/js/bootstrap.bundle.min.js",
        "dist/js/bootstrap.bundle.min.js.map"
      ]
    },
    "bootstrap-icons": {
      "package": "bootstrap-icons",
      "files": [
        "font/bootstrap-icons.css",
        "font/fonts/**/*"
      ]
    }
  }
}
```

**Step 3:** Run the vendor task
```bash
npx gulp vendors
```

This copies the specified files from `node_modules/` to your `vendors/` folder.

**Step 4:** Build as usual
```bash
npx gulp
```

### Option 3: Custom Bootstrap via SCSS

If you want to customize Bootstrap variables and compile it yourself:

**Step 1:** Install Bootstrap
```bash
npm install bootstrap
```

**Step 2:** Import in your `src/scss/skin.scss`
```scss
// Override Bootstrap variables
$primary: #your-color;
$font-family-base: 'Your Font';

// Import Bootstrap
@import "../../node_modules/bootstrap/scss/bootstrap";

// Your custom styles
.my-custom-class {
  // ...
}
```

**Step 3:** Build
```bash
npx gulp
```

Bootstrap will be compiled directly into your `skin.css` file.

### Which Option to Choose?

- **New to web development?** → Use Option 1 (manual files)
- **Want version control for vendors?** → Use Option 2 (npm)
- **Need customized Bootstrap?** → Use Option 3 (SCSS import)
- **Want Bootstrap bundled with your CSS?** → Use Option 3
- **Want Bootstrap as a separate file?** → Use Option 1 or 2

### Gulp Tasks for Vendors

- **`gulp vendors`** - Copy vendor files from node_modules to vendors/ folder
- **`gulp refresh`** - Get vendors from npm, then build everything
- **`gulp`** - Regular build (includes copying from vendors/ to dist)


**Important:** Order matters for JavaScript dependencies. Libraries like jQuery should come before plugins that depend on them.

If `jsFiles` is not specified, all files in `src/js/**/*.js` will be included (though order may not be predictable).

---

## About `config-local.json`

This project uses a `config-local.json` file for local paths and settings.

In this **base example project**, `config-local.json` is **not included in GitHub**.
This is intentional, so different users can use their own local paths without conflicts.

### When you use this as a template

* Copy `config.json` to `config-local.json`
* Adjust the values for your local setup
* Keep `config-local.json` uncommitted

### When this becomes your own theme

Once you start building your **own theme** from this base:

* `config-local.json` becomes part of your project
* It is usually fine to commit this file
* Especially if:
  * It contains no secrets
  * The paths are shared by your team
  * The project is no longer meant as a reusable template

**In short:**

* Template project → do not commit `config-local.json`
* Your own theme → committing it is usually the right choice

---

## Folder Structure Example

```
dnn-simple-theme-base/
│
├─ skin/                # Your Skin files (.ascx, .cshtml)
├─ container/           # Your Container files (.ascx, .cshtml)
├─ src/
│   ├─ scss/            # Your SCSS files
│   └─ js/              # Your JavaScript files
├─ config.json          # Template config
├─ config-local.json    # Local config (not in GitHub)
├─ gulpfile.js          # Build and watch tasks
└─ README.md
```

This diagram shows **where to place your files** for the build process to work correctly.

---

## Notes

* The build generates minified `skin.css` and `skin.js`.
* You can copy the **entire theme folder** to **one or multiple DNN installations** depending on your `targetPaths`.
* Recommended workflow for beginners:
  * Edit SCSS/JS → run `gulp` → files are automatically copied to DNN
* Use `gulp watch` during active development for automatic rebuilds on file changes.

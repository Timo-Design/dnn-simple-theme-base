# dnn-simple-theme-base

A simple starting point for building a **DNN theme outside of DNN**.

This project is intended as a **base example** for users with less experience.
It focuses on clarity and simplicity rather than advanced features.

---

## Status

Work in progress / experimental

---

## Goal

* Build a DNN theme in one central location
* Automatically copy the generated files to one or more local DNN installations

This allows you to develop and update your theme without working directly inside a DNN installation.

---


## Technology Used

* Node.js
* Gulp 4

---

## Requirements

* Node.js installed
* Run `npm install`

---

## Description

* Values written as `[token]` are read from the configuration file
* `[targetPaths]` can contain **one or more target locations**
* The build process outputs **minified CSS** for skins

### Build Output

For each `targetPath`:

* **Skin files:** `[targetPaths]/Skins/[themeName]`

  * `Skin.css` (inified compiled from SCSS)
* **Container files:** `[targetPaths]/Containers/[themeName]`

---

## Watch Tasks

* **Skin and Container folders**
  When a file is changed or added, all files in the target location are removed and replaced with the updated files.
* **`src/scss` folder**
  SCSS files are compiled into `Skin.css`.

---

## Quick Start (Beginner Friendly)

A. Make sure you have [Node.js and npm installed](nodejs.md) before running this project.
B. Download the source zip from GitHub.
C. Unzip the folder **outside of any DNN installation**.
D. Copy `config.json` to `config-local.json`

* **Update paths and theme name for your local setup.**
* `targetPaths` can contain **one or more DNN installation skin paths**.

  * Each path should point to the DNN portal’s folder where skins and containers reside:

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
      ]
    }
    ```

E. Install dependencies:

```bash / CMD
npm install
```

F. Build the theme once:

```bash / CMD
npx gulp
```

G. Start watching for changes (optional, recommended for development):

```bash / CMD
npx gulp watch
```

H. The compiled file (`Skin.css` is now in `[targetPaths]/Skins/[themeName]`.


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
│   └─ scss/            # Your SCSS files
├─ config.json          # Template config
├─ config-local.json    # Local config (not in GitHub)
├─ gulpfile.js          # Build and watch tasks
└─ README.md
```

This diagram shows **where to place your files** for the build process to work correctly.

---

## Notes

* The generated a minified `Skin.css`.
* You can copy the **entire theme folder** to **one or multiple DNN installations** depending on your `targetPaths`.
* Recommended workflow for beginners:

  * Edit SCSS → run `gulp` → copy generated files to DNN

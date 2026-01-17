const { src, dest, watch, series } = require('gulp');
const fs = require('fs');
const path = require('path');
const del = require('del');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const header = require('gulp-header');

/**
 * Load config (defensive)
 */
function loadJsonConfig(filePath, { required = false } = {}) {
  if (!fs.existsSync(filePath)) {
    if (required) {
      throw new Error(
        `\nERROR: Missing ${filePath}\n` +
        `This file is required to run gulp.\n`
      );
    }
    return {};
  }

  const raw = fs.readFileSync(filePath, 'utf8').trim();

  if (!raw) {
    throw new Error(
      `\nERROR: ${filePath} exists but is empty.\n` +
      `Please provide valid JSON.\n`
    );
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `\nERROR: ${filePath} contains invalid JSON:\n` +
      `  ${err.message}\n`
    );
  }
}

const baseConfig = loadJsonConfig('./config.json', { required: true });
const localConfig = loadJsonConfig('./config-local.json');

const config = { ...baseConfig, ...localConfig };
const themeName = config.themeName;
const targetPaths = config.targetPaths || [];

/**
 * Helpers
 */
function skinTarget(basePath) {
  return path.join(basePath, 'Skins', themeName);
}

function containerTarget(basePath) {
  return path.join(basePath, 'Containers', themeName);
}

/**
 * Clean tasks
 */
function cleanSkins() {
  const paths = targetPaths.map(p => skinTarget(p));
  return del(paths, { force: true });
}

function cleanContainers() {
  const paths = targetPaths.map(p => containerTarget(p));
  return del(paths, { force: true });
}

/**
 * Copy tasks
 */
function copySkins() {
  return targetPaths.reduce((stream, basePath) => {
    return stream.pipe(dest(skinTarget(basePath)));
  }, src('skin/**/*'));
}

function copyContainers() {
  return targetPaths.reduce((stream, basePath) => {
    return stream.pipe(dest(containerTarget(basePath)));
  }, src('container/**/*'));
}

/**
 * SCSS build and minification
 */

function buildScss() {
  const cssComment = config.cssComment || ''; // fallback if not defined

  return targetPaths.reduce((stream, basePath) => {
    const destPath = skinTarget(basePath);

    return stream
      .pipe(sass().on('error', sass.logError)) // compile SCSS
      .pipe(cleanCSS())                        // minify
      .pipe(header(cssComment + '\n'))         // add comment on top
      .pipe(rename('skin.css'))                // force output filename
      .pipe(dest(destPath));                   // write file
  }, src('src/scss/**/*.scss'));
}


/**
 * Watch
 */
function watchFiles() {
  watch('skin/**/*', series(cleanSkins, copySkins));
  watch('container/**/*', series(cleanContainers, copyContainers));
  watch('src/scss/**/*.scss', buildScss);
}

/**
 * Public tasks
 */
exports.build = series(
  cleanSkins,
  cleanContainers,
  copySkins,
  copyContainers,
  buildScss
);

exports.watch = watchFiles;
exports.default = exports.build;

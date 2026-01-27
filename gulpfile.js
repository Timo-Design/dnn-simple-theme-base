const { src, dest, watch, series } = require('gulp');
const fs = require('fs');
const path = require('path');
const del = require('del');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const header = require('gulp-header');
const concat = require('gulp-concat');
const terser = require('gulp-terser'); 


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
const distFolder = config.distFolder || '_dist';

/**
 * Helpers
 */
function distSkinPath() {
  return path.join(distFolder, 'Skins', themeName);
}

function distContainerPath() {
  return path.join(distFolder, 'Containers', themeName);
}

function skinTarget(basePath) {
  return path.join(basePath, 'Skins', themeName);
}

function containerTarget(basePath) {
  return path.join(basePath, 'Containers', themeName);
}

/**
 * Clean tasks
 */
function cleanDist() {
  return del([`${distFolder}/**`], { force: true });
}

function cleanSkins() {
  const paths = targetPaths.map(p => skinTarget(p));
  return del(paths, { force: true });
}

function cleanContainers() {
  const paths = targetPaths.map(p => containerTarget(p));
  return del(paths, { force: true });
}

/**
 * Build to dist folder
 */
function buildSkinsToDist() {
  return src('skin/**/*')
    .pipe(dest(distSkinPath()));
}

function buildContainersToDist() {
  return src('container/**/*')
    .pipe(dest(distContainerPath()));
}

function buildScss() {
  const generatedFileWarning = config.generatedFileWarning || '';
  return src('src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(header(generatedFileWarning + '\n'))
    .pipe(rename('skin.css'))
    .pipe(dest(distSkinPath()));
}

function buildJs() {
  // Check local config first, fall back to base config, then auto-detect
  const jsFiles = localConfig.jsFiles || config.jsFiles || ['src/js/**/*.js'];
  const generatedFileWarning = config.generatedFileWarning || '';
  
  return src(jsFiles)
    .pipe(concat('skin.js'))
    .pipe(terser())
    .pipe(header(generatedFileWarning + '\n'))
    .pipe(dest(distSkinPath()));
}

/**
 * Vendor management tasks
 */

// Copy pre-built vendor files from vendors/ folder to dist
function copyVendors() {
  // Check if vendors folder exists
  if (!fs.existsSync('vendors')) {
    console.log('No vendors folder found, skipping vendor copy.');
    return Promise.resolve();
  }
  
  return src('vendors/**/*')
    .pipe(dest(`${distSkinPath()}/vendors`));
}

// Copy specific files from node_modules to vendors/ folder
function getVendorsFromNpm() {
  const npmVendors = config.npmVendors || localConfig.npmVendors;
  
  if (!npmVendors || Object.keys(npmVendors).length === 0) {
    console.log('No npmVendors configured, skipping npm vendor copy.');
    return Promise.resolve();
  }
  
  const tasks = [];
  
  Object.entries(npmVendors).forEach(([vendorName, vendorConfig]) => {
    const basePath = `node_modules/${vendorConfig.package}`;
    
    // Check if package exists in node_modules
    if (!fs.existsSync(basePath)) {
      console.warn(`Warning: Package '${vendorConfig.package}' not found in node_modules. Run 'npm install' first.`);
      return;
    }
    
    vendorConfig.files.forEach(filePattern => {
      tasks.push(
        src(`${basePath}/${filePattern}`, { encoding: false })
          .pipe(dest(`vendors/${vendorName}`))
      );
    });
  });
  
  if (tasks.length === 0) {
    return Promise.resolve();
  }
  
  return Promise.all(tasks);
}

/**
 * Distribute from dist to target paths
 */
function distributeSkins() {
  if (targetPaths.length === 0) {
    console.log('No targetPaths configured, skipping distribution.');
    return Promise.resolve();
  }
  
  return targetPaths.reduce((stream, basePath) => {
    return stream.pipe(dest(skinTarget(basePath)));
  }, src(`${distFolder}/Skins/${themeName}/**/*`));
}

function distributeContainers() {
  if (targetPaths.length === 0) {
    console.log('No targetPaths configured, skipping distribution.');
    return Promise.resolve();
  }
  
  return targetPaths.reduce((stream, basePath) => {
    return stream.pipe(dest(containerTarget(basePath)));
  }, src(`${distFolder}/Containers/${themeName}/**/*`));
}

/**
 * Watch
 */
function watchFiles() {
  watch('skin/**/*', series(buildSkinsToDist, cleanSkins, distributeSkins));
  watch('container/**/*', series(buildContainersToDist, cleanContainers, distributeContainers));
  watch('src/scss/**/*.scss', series(buildScss, cleanSkins, distributeSkins));
  watch('src/js/**/*.js', series(buildJs, cleanSkins, distributeSkins));
  watch('vendors/**/*', series(copyVendors, cleanSkins, distributeSkins));
}

/**
 * Public tasks
 */
// Watch and auto-distribute
exports.watch = series(watchFiles);

// Build everything to dist only
exports.build = series(
  cleanDist,
  buildSkinsToDist,
  buildContainersToDist,
  buildScss,
  buildJs,
  copyVendors
);

// Quick distribute without rebuilding
exports.sync = series(
  cleanSkins,
  cleanContainers,
  distributeSkins,
  distributeContainers
);

// Build to dist AND distribute to target paths
exports.distribute = series(
  exports.build,
  exports.sync
);

// Clean all output files
exports.clean = series(cleanDist, cleanSkins, cleanContainers);

// Get vendor files from npm packages
exports.vendors = series(getVendorsFromNpm);

// Get vendors from npm, then build everything
exports.refresh = series(getVendorsFromNpm, exports.build);

// Full refresh: build, distribute and watch
exports.init = series(exports.distribute, exports.watch);

// Default: build to dist and distribute
exports.default = exports.distribute;
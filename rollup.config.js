import fs from 'fs';
import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
// import buble from 'rollup-plugin-buble';
import uglify from 'rollup-plugin-uglify';
import postcssLoadConfig from 'postcss-load-config';
import postcss from 'postcss';
import CleanCSS from 'clean-css';
import manifest from './manifest';

const production = !process.env.ROLLUP_WATCH;

const banner = `New Tab ${process.env.APP_RELEASE} | github.com/MaxMilton/new-tab`;
const template = fs.readFileSync(`${__dirname}/src/template.html`, 'utf8');

const uglifyOpts = {
  compress: {
    drop_console: production,
    drop_debugger: production,
    negate_iife: false, // better performance when false
    passes: 2,
    pure_getters: true,
    unsafe: true,
    unsafe_proto: true,
  },
  mangle: {
    properties: {
      // NOTE: Fragile; needs close attention especially between Svelte releases!
      regex: /^(_.*|each_value.*|.*_index.*|component|changed|previous|destroy)$/,
      // debug: 'XX',
    },
  },
  output: {
    comments: !!process.env.DEBUG,
    wrap_iife: true,
  },
  ecma: 8,
  toplevel: true,
  warnings: !!process.env.DEBUG,
};

const cleanCssOpts = {
  level: {
    1: { all: true },
    2: { all: true },
  },
};

/**
 * Generic error handler for nodejs callbacks.
 * @param {Error} err
 */
function catchErr(err) { if (err) throw err; }

/**
 * Preprocess PostCSS code into CSS for Svelte.
 * @param {object} obj
 * @param {string} obj.content Contents of the style elements or CSS.
 * @param {string} obj.filename Full path to the file containing the CSS.
 * @returns {object} An object containing CSS code and source map.
 */
function sveltePostcss({ content, filename }) {
  return postcssLoadConfig({}).then(({ plugins, options }) =>
    postcss(plugins)
      .process(content, Object.assign(options, {
        from: filename,
        to: filename,
      }))
      .then(result => ({
        code: result.css,
        map: result.map,
      }))
  ); // eslint-disable-line function-paren-newline
}

/**
 * Ultra-minimal template engine.
 * @see https://github.com/Drulac/template-literal
 * @param {string} html A HTML template to compile.
 * @returns {Function}
 */
function compileHtml(html) {
  return new Function('d', 'return `' + html + '`'); // eslint-disable-line
}

// eslint-disable-next-line import/no-extraneous-dependencies
const loader = require('uglify-es').minify(
  fs.readFileSync(`${__dirname}/src/loader.js`, 'utf8'),
  Object.assign({}, uglifyOpts)
);

export default [
  // App: NTP
  {
    input: 'src/app.js',
    output: {
      sourcemap: true,
      banner: `/* ${banner} */`,
      format: 'iife',
      name: 'ntp',
      file: 'dist/ntp.js',
    },
    plugins: [
      svelte({
        dev: !production,
        preprocess: {
          style: sveltePostcss,
        },
        css: (css) => {
          const minCss = new CleanCSS(cleanCssOpts).minify(css.code);

          // compile HTML from template
          fs.writeFile(`${__dirname}/dist/ntp.html`, compileHtml(template)({
            banner: `<!-- ${banner} -->\n`,
            title: 'New Tab',
            head: `<script src=ntp.js defer></script>\n<style>${minCss.styles}</style>\n<script>${loader.code}</script>`,
            body: '<div id=a><div class="b f">Other bookmarks</div></div><div id=m><div id=i>☰</div></div><div class=c><input type=text id=s></div>',
          }), catchErr);
        },
      }),

      resolve(),
      commonjs(),

      // production && buble({ exclude: 'node_modules/**' }),
      production && uglify(uglifyOpts),
    ],
  },

  // App: Settings
  {
    input: 'src/settings.js',
    output: {
      sourcemap: false,
      banner: `/* ${banner} */`,
      format: 'iife',
      name: 's',
      file: 'dist/s.js',
    },
    plugins: [
      svelte({
        dev: !production,
        // shared: false, // not possible to override at the moment
        preprocess: {
          style: sveltePostcss,
        },
        css: (css) => {
          const minCss = new CleanCSS(cleanCssOpts).minify(css.code);

          // compile HTML from template
          fs.writeFile(`${__dirname}/dist/s.html`, compileHtml(template)({
            banner: `<!-- ${banner} -->\n`,
            title: 'Settings | New Tab',
            head: `<script src=s.js defer></script>\n<style>${minCss.styles}</style>`,
            body: '',
          }), catchErr);
        },
      }),

      // production && buble({ exclude: 'node_modules/**' }),
      production && uglify(uglifyOpts),
    ],
  },

  // Error tracking
  {
    input: 'src/errors.js',
    output: {
      sourcemap: false,
      format: 'iife',
      name: 'e',
      file: 'dist/e.js',
    },
    plugins: [
      resolve(),
      commonjs(),
      production && uglify(uglifyOpts),
    ],
  },

  // Background process
  {
    input: 'src/background.js',
    output: {
      sourcemap: false,
      format: 'iife',
      name: 'b',
      file: 'dist/b.js',
    },
    plugins: [
      production && uglify(uglifyOpts),
    ],
  },
];

// extension manifest
fs.writeFile(`${__dirname}/dist/manifest.json`, JSON.stringify(manifest), catchErr);

/**
 * Compile a New Tab theme.
 * @param {string} nameLong The input filename.
 * @param {string} nameShort The output filename.
 */
function makeTheme(nameLong, nameShort) {
  fs.readFile(`${__dirname}/src/themes/${nameLong}.css`, 'utf8', async (err, res) => {
    if (err) throw err;

    const css = new CleanCSS(cleanCssOpts).minify(res).styles;
    fs.writeFile(`${__dirname}/dist/${nameShort}.css`, css, catchErr);
  });
}

// themes
makeTheme('light', 'l');
makeTheme('black', 'b');

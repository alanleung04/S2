import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import ttypescript from 'ttypescript';

const format = process.env.FORMAT;

const OUT_DIR_NAME_MAP = {
  esm: 'esm',
  cjs: 'lib',
  umd: 'dist',
};

const outDir = OUT_DIR_NAME_MAP[format];
const isEsmFormat = format === 'esm';

const output = {
  format: format,
  preserveModules: isEsmFormat,
  exports: 'named',
  name: 'S2',
  sourcemap: true,
  preserveModulesRoot: 'src',
};

const plugins = [
  alias({
    entries: [{ find: 'lodash', replacement: 'lodash-es' }],
  }),
  commonjs(),
  resolve(),
  typescript({
    outDir: outDir,
    abortOnError: true,
    tsconfig: 'tsconfig.json',
    tsconfigOverride: {
      exclude: ['__tests__'],
      compilerOptions: {
        declaration: isEsmFormat,
      },
    },
    typescript: ttypescript,
  }),
  postcss({
    minimize: true,
    use: {
      sass: null,
      stylus: null,
      less: { javascriptEnabled: true },
    },
    extract: true,
    output: outDir + '/s2.min.css',
  }),
];

const external = ['react', 'react-dom', '@ant-design/icons', 'antd'];

if (format === 'umd') {
  output.file = 'dist/s2.min.js';
  plugins.push(terser());
  output.globals = {
    react: 'React',
    'react-dom': 'ReactDOM',
    antd: 'antd',
    '@ant-design/icons': 'icons',
  };
} else {
  external.push(
    'd3-interpolate',
    'lodash',
    'lodash-es',
    '@antv/g-gesture',
    '@antv/g-canvas',
    '@antv/event-emitter',
    'd3-timer',
    'classnames',
  );
  output.dir = outDir;
}

// eslint-disable-next-line import/no-default-export
export default {
  input: 'src/index.ts',
  output,
  external,
  plugins,
};
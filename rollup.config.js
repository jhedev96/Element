import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "src/Element.js",
  output: [
    {
      file: "dist/Element.cjs.js",
      format: "cjs",
      sourcemap: true
    },
    {
      file: "dist/Element.esm.js",
      format: "esm",
      sourcemap: true
    },
    {
      file: "dist/Element.umd.js",
      name: "Element",
      format: "umd",
      sourcemap: true
    },
    {
      file: "dist/Element.umd.min.js",
      name: "Element",
      format: "umd",
      sourcemap: true,
      plugins: [terser()]
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**"
    }),
    terser()
  ]
};
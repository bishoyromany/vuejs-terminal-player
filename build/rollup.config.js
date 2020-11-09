import commonjs from "rollup-plugin-commonjs"; // Convert CommonJS modules to ES6
import vue from "rollup-plugin-vue"; // Handle .vue SFC files
import buble from "rollup-plugin-buble"; // Transpile/polyfill with reasonable browser support
import { terser } from "rollup-plugin-terser";
import { folder, name, file } from "./env";

export default [
  {
    input: "src/plugins/" + folder + "/index.js", // Path relative to package.json
    output: [
      {
        file: "dist/" + file + ".js",
        format: "umd",
        name: name,
      },
      {
        file: "dist/" + file + ".common.js",
        format: "cjs",
      },
      {
        file: "dist/" + file + ".esm.js",
        format: "es",
      },
    ],
    plugins: [
      commonjs(),
      vue({
        css: true, // Dynamically inject css as a <style> tag
        //compileTemplate: true, // Explicitly convert template to render function
      }),
      buble(), // Transpile to ES5
    ],
  },
  {
    input: "src/plugins/" + folder + "/index.js", // Path relative to package.json
    output: {
      file: "dist/" + file + ".min.js",
      format: "umd",
      name: name,
    },
    plugins: [
      commonjs(),
      vue({
        css: true, // Dynamically inject css as a <style> tag
        //compileTemplate: true, // Explicitly convert template to render function
      }),
      buble(), // Transpile to ES5
      terser(), //minify
    ],
  },
];

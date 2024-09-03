import clear from "rollup-plugin-clear";
import screeps from "rollup-plugin-screeps";
import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import fs from 'fs';
const secretJson = fs.readFileSync('./secret.json', 'utf8');
const secret = JSON.parse(secretJson); 

const env = process.env.DEST

let config;
// 根据指定的目标获取对应的配置项
if (!process.env.DEST) {
  console.log("未指定目标, 代码将被编译但不会上传");
}
if (!secret[process.env.DEST]) {
  throw new Error("目标未在 secret.json 中配置，请检查 secret.json");
} else {
  config = secret[env];
}

const win32 = process.platform === "win32";
const dest = win32 ? config.winPath : config.copyPath;

// 根据指定的配置决定是上传还是复制到文件夹
const pluginDeploy = () => {
  if (env === 'local') {
    return copy({
      targets: [
        {
          src: "dist/main.js",
          dest: dest,
        },
        {
          src: "dist/main.js.map",
          dest: dest,
          rename: (name) => name + ".map.js",
          transform: (contents) =>
            `export default  = ${contents.toString()};`,
        },
      ],
      hook: "writeBundle",
      verbose: true,
    })
  }

  if (env === 'main') {
    const p = screeps({ config: secret.main, dryRun: false });
    return p
  }
}

export default {
  input: "src/main.js",
  output: {
    file: "dist/main.js",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [
    // 清除上次编译成果
    clear({ targets: ["dist"] }),

    // 打包依赖
    resolve(),
    // 模块化依赖
    commonjs(),

    typescript({ tsconfig: "./tsconfig.json" }),

    // 执行上传或者复制
    pluginDeploy(),
  ],
};

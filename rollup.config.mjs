import clear from "rollup-plugin-clear";
import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import { ScreepsAPI } from "screeps-api";
import fs from 'fs';
import path from 'path';
const secretJson = fs.readFileSync('./.secret.json', 'utf8');
const secret = JSON.parse(secretJson);

const env = process.env.DEST;

// 根据指定的目标获取对应的配置项
const config = env ? secret[env] : undefined;
if (!env) {
  console.log("未指定目标, 代码将被编译但不会上传");
}
if (env && !config) {
  throw new Error("目标未在 secret.json 中配置，请检查 secret.json");
}

const win32 = process.platform === "win32";
const dest = config ? (win32 ? config.winPath : config.copyPath) : undefined;

function screepsBuildId() {
  let buildId = process.env.BUILD_ID || new Date().toISOString();

  return {
    name: "screeps-build-id",
    buildStart() {
      if (!process.env.BUILD_ID) buildId = new Date().toISOString();
      console.log(`screeps build id: ${buildId}`);
    },
    transform(code, id) {
      if (!id.endsWith("/src/runtime/build.ts") && !id.endsWith("\\src\\runtime\\build.ts")) {
        return null;
      }

      return {
        code: code.replace('"__SCREEPS_BUILD_ID__"', JSON.stringify(buildId)),
        map: null,
      };
    },
  };
}

function screepsLoopExport() {
  return {
    name: "screeps-loop-export",
    renderChunk(code) {
      return {
        code: code.replace("exports.loop = loop;", "module.exports.loop = loop;"),
        map: null,
      };
    },
  };
}

function getUploadCode(outputFile) {
  const base = path.dirname(outputFile);
  const code = {};

  for (const file of fs.readdirSync(base)) {
    if (path.extname(file) !== '.js' && path.extname(file) !== '.wasm') continue;

    if (file.endsWith('.js')) {
      code[file.replace(/\.js$/i, '')] = fs.readFileSync(path.join(base, file), 'utf8');
    } else {
      code[file] = {
        binary: fs.readFileSync(path.join(base, file)).toString('base64'),
      };
    }
  }

  return code;
}

function screepsDeploy(config) {
  return {
    name: 'screeps-deploy',
    async writeBundle(options) {
      const sourceMap = `${options.file}.map`;
      const screepsSourceMap = `${options.file}.map.js`;
      if (fs.existsSync(sourceMap)) fs.renameSync(sourceMap, screepsSourceMap);

      const api = new ScreepsAPI(config);
      const branch = config.branch;
      const code = getUploadCode(options.file);
      const branches = await api.raw.user.branches();
      const exists = branches.list.some((item) => item.branch === branch);

      if (exists) {
        await api.code.set(branch, code);
      } else {
        await api.raw.user.cloneBranch('', branch, code);
      }

      console.log(`screeps upload succeeded: branch=${branch}, files=${Object.keys(code).length}`);
    },
  };
}

// 根据指定的配置决定是上传还是复制到文件夹
const pluginDeploy = () => {
  if (env === 'dev') {
    console.log('pluginDeploy: copy to dev');
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

  if (env === 'main' || env === 'local') {
    const target = env === 'main' ? 'main' : 'local';
    console.log(`pluginDeploy: upload to ${target} ${config.protocol}://${config.hostname}:${config.port}, branch=${config.branch}`);
    return screepsDeploy(config);
  }

  return null;
}

const deployPlugin = pluginDeploy();

export default {
  input: "src/main.ts",
  output: {
    file: "dist/main.js",
    format: "cjs",
    sourcemap: true,
  },
  plugins: [
    // 清除上次编译成果
    clear({ targets: ["dist"] }),

    // 将本次编译时间写入 Schema 3 顶级 Memory.lastModified
    screepsBuildId(),

    // 先由 TypeScript 插件转换源码，再解析 TS 和 JS 模块
    typescript({
      tsconfig: "./tsconfig.json",
      include: ["src/**/*.ts"],
    }),
    resolve({
      extensions: [".mjs", ".js", ".json", ".node", ".ts"],
    }),
    commonjs(),
    screepsLoopExport(),

    // 执行上传或者复制
    ...(deployPlugin ? [deployPlugin] : []),
  ],
};

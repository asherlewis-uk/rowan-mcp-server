module.exports = {
  apps: [
    {
      name: "gpt-github-middleware",
      cwd: "C:/Users/asher/app-factory/services/gpt-github-middleware",
      script: "./src/server.ts",
      interpreter: "C:/NVM4W/NODEJS/node.exe",
      node_args: "-r ts-node/register/transpile-only",
      env: {
        NODE_ENV: "development"
      }
    }
  ]
};
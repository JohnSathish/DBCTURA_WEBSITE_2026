const path = require("path");

module.exports = {
  apps: [
    {
      name: "donbosco",
      script: path.join(__dirname, "node_modules/next/dist/bin/next"),
      args: "start -p 3001",
      cwd: __dirname,
      interpreter: "node",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};

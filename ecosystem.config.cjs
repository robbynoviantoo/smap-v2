module.exports = {
  apps: [
    {
      name: 'smap-v2',
      cwd: __dirname,
      script: './node_modules/next/dist/bin/next',
      args: 'start --hostname 127.0.0.1 --port 3000',
      interpreter: process.execPath,
      env: { NODE_ENV: 'production' },
    },
  ],
};

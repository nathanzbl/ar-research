module.exports = {
  apps: [
    {
      name: 'emmalee-site',
      script: 'server/dist/index.js',
      env: {
        NODE_ENV: 'production',
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      out_file: './logs/app-out.log',
      error_file: './logs/app-error.log',
      merge_logs: true,
    },
  ],
};

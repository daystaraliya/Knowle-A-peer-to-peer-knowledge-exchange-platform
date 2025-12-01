/**
 * @file PM2 configuration file for horizontal scaling.
 * This file configures the main API server to run in cluster mode,
 * which creates an instance on each available CPU core to handle more concurrent requests.
 * The communication microservice would have its own ecosystem file for independent scaling.
 *
 * To run:
 * Production: `pm2 start ecosystem.config.js --env production`
 * Development: `pm2-dev start ecosystem.config.js`
 *
 * @see https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

// export default {
//   apps: [
//     {
//       name: 'knowle-main-api',
//       script: 'src/index.js',
//       instances: 1, // Use 1 instance for development
//       exec_mode: 'fork', // Use fork mode for development
//       autorestart: true, // Restart the app if it crashes.
//       watch: true, // Watch for file changes in development.
//       max_memory_restart: '1G', // Restart if it exceeds 1GB of memory.
//       env: {
//         NODE_ENV: 'development'
//       },
//       env_production: {
//         NODE_ENV: 'production',
//         instances: 'max',
//         exec_mode: 'cluster'
//       }
//     }
//   ]
// }

module.exports = {
    apps: [
        {
            name: "knowle-main-api",
            script: "src/index.js",
            instances: 1,
            exec_mode: "fork",
            autorestart: true,
            watch: true,
            max_memory_restart: "1G",

            interpreter: "babel-node",
            interpreter_args: "-r dotenv/config",

            env: {
                NODE_ENV: "development",
            },
            env_production: {
                NODE_ENV: "production",
                instances: "max",
                exec_mode: "cluster",
            },
        },
    ],
};

module.exports = {
  apps: [
    {
      name: "ssh",
      cwd: "/",
      script: "/usr/sbin/sshd",
    },
    {
      name: "app",
      cwd: "/",
      script: "/dist/wheel-of-decision/server/server.mjs",
    },
  ],
};

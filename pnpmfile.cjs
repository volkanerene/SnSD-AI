module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.scripts?.install) {
        // otomatik izin ver
        pkg.scripts.preinstall = undefined
      }
      return pkg
    },
  },
};
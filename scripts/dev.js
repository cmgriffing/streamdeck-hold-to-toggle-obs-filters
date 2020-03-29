const os = require("os");
const child_process = require("child_process");
const fs = require("fs-extra");
const path = require("path");

const platforms = {
  win32: {
    pluginsFolderPath:
      "%appdata%\\Elgato\\StreamDeck\\Plugins\\com.elgato.StreamDeck\\Plugins\\"
  },
  darwin: {
    pluginsFolderPath: `${os.homedir()}/Library/Application\\ Support/com.elgato.StreamDeck/Plugins/`
  }
};

const currentPlatform = platforms[os.platform()];

if (!currentPlatform) {
  console.error(
    "Current Platform not supported. Supported platforms are: 'win32', 'darwin'"
  );
  process.exit(-1);
}
console.log({ path: currentPlatform.pluginsFolderPath });

switch (os.platform()) {
  case "darwin":
    child_process.execSync(
      `cp -R build/com.cmgriffing.hold-to-activate-vsts.sdPlugin ${currentPlatform.pluginsFolderPath}/`
    );
    break;
  case "win32":
    fs.copySync(
      "build/com.cmgriffing.hold-to-activate-vsts.sdPlugin",
      currentPlatform.pluginsFolderPath
    );
    break;

  default:
    console.error(
      "Current Platform not supported. Supported platforms are: 'win32', 'darwin'"
    );
    process.exit(-1);
}

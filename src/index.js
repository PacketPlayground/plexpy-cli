#!/usr/bin/env node

import commander from "commander";
import getActivity from "./plexpy";
import { needSettings, getSettings, resetSettings } from "./settings";
import logger from "./logger";

commander.version("1.0.0");

commander
  .command("activity")
  .description("get current plex activity")
  .action(() => {
    getActivity();
  });

commander
  .command("reset")
  .description("reset your plexpy settings")
  .action(() => {
    resetSettings();
  });

// check if settings are needed
if (needSettings()) {
  // get settings if neccessary
  getSettings()
    .then(() => {
      console.log(
        'Settings saved! You can now connect to PlexPy. Run "plexpy --help" to see what you can do.'
      );
    })
    .catch(err => logger.error(err));
} else {
  // if credentials look good let's parse the user command
  commander.parse(process.argv);
}

#!/usr/bin/env node

import commander from "commander";
import getActivity from "./plexpy";
import { needSettings, getSettings, resetSettings } from "./settings";

// commander setup
commander
  .version("1.0.4")
  .option("-p, --plain", "print results in plain text")
  .option("-f, --full", "don't truncate table text");

// activity command
commander
  .command("activity")
  .description("get current plex activity")
  .action(options => {
    const { plain, full } = options.parent;

    getActivity({
      plain,
      full
    });
  });

// reset command
commander
  .command("reset")
  .description("reset your plexpy settings")
  .action(() => {
    resetSettings();
  });

// check if settings are needed
if (needSettings()) {
  // get settings if neccessary
  getSettings();
} else {
  // if credentials look good let's parse the user command
  commander.parse(process.argv);
  // if no arguments were provided run getActivity as the default function
  if (commander.args.length < 1) {
    const { plain, full } = commander;

    getActivity({
      plain,
      full
    });
  }
}

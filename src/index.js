#!/usr/bin/env node

import low from "lowdb";
import path from "path";
import axios from "axios";
import FileSync from "lowdb/adapters/FileSync";
import Table from "cli-table2";
import { needSettings, getSettings } from "./settings";
import logger from "./logger";

// json file to store settings
const settings = path.join(__dirname, "./settings.json");
// new adapter (using a synchronous adapter)
const adapter = new FileSync(settings);
// define the database
export const db = low(adapter); //eslint-disable-line

const plexpy = cmd => {
  // get settings from db
  const { host, port, apiKey } = db.getState();
  // generate the base url
  return axios({
    method: "GET",
    url: `${host}:${port}/api/v2?apikey=${apiKey}&cmd=${cmd}`
  });
};

const getActivity = () => {
  plexpy("get_activity")
    .then(res => {
      // the sessions returned by plexpy
      const { sessions } = res.data.response.data;
      // ensure we have sessions to work with
      if (sessions.length) {
        // a new table for each media type
        const movie = new Table({
          head: ["Username", "Title"]
        });
        const episode = new Table({
          head: ["Username", "Show", "Season", "Title"]
        });
        const track = new Table({
          head: ["Username", "Artist", "Album", "Track"]
        });
        // sort the sessions by media type and push to tables
        sessions.forEach(session => {
          // get the media type
          const type = session.media_type;
          // sort based on media type
          if (type === "movie") {
            movie.push([session.friendly_name, session.title]);
          } else if (type === "episode") {
            episode.push([
              session.friendly_name,
              session.grandparent_title,
              session.parent_title,
              session.title
            ]);
          } else if (type === "track") {
            track.push([
              session.friendly_name,
              session.grandparent_title,
              session.parent_title,
              session.title
            ]);
          }
        });

        // only console the table if there are current sessions for that media type
        if (movie.length) {
          console.log("\n", "Movies");
          console.log(movie.toString());
        }

        if (episode.length) {
          console.log("\n", "TV");
          console.log(episode.toString());
        }

        if (track.length) {
          console.log("\n", "Music");
          console.log(track.toString());
        }
      } else {
        console.log("Nothing is currently being played.");
      }
    })
    .catch(err => logger.error(err));
};

// check if settings are needed
if (needSettings()) {
  // get settings if neccessary
  getSettings()
    .then(() => {
      console.log(
        'Settings saved! You can now connect to PlexPy. Run "plexpy" to get current activity.'
      );
    })
    .catch(err => logger.error(err));
} else {
  getActivity();
}

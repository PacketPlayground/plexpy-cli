import axios from "axios";
import Table from "cli-table2";
import logger from "./logger";
import { db } from "./settings";

const plexpy = cmd => {
  // get settings from db
  const { host, port, apiKey } = db.getState();
  // generate the base url
  return axios({
    method: "GET",
    url: `${host}:${port}/api/v2?apikey=${apiKey}&cmd=${cmd}`
  }).catch(() => {
    throw new Error("Could not reach PlexPy.");
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
    .catch(err => logger.error(err.message));
};

export default getActivity;

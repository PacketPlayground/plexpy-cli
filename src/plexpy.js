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

const print = (data, title, options) => {
  // define table headers
  const [head] = data.splice(0, 1);

  if (data.length) {
    if (options.plain) {
      // log each row as plain text
      data.forEach(row => console.log(`\n${row.join(" - ")}`));
    } else {
      let table;

      if (options.full) {
        table = new Table({
          head
        });
      } else {
        // set column width
        const colWidths = head.map(() => 12);
        // create the new table
        table = new Table({
          head,
          colWidths
        });
      }

      // push data to the table
      data.forEach(row => table.push(row));
      // log the table
      console.log(table.toString());
    }
  }
};

const getActivity = options => {
  plexpy("get_activity")
    .then(res => {
      // the sessions returned by plexpy
      const { sessions } = res.data.response.data;
      // ensure we have sessions to work with
      if (sessions.length) {
        // a new table for each media type
        const movie = [["Username", "Title", "State"]];
        const episode = [["Username", "Show", "Season", "Title", "State"]];
        const track = [["Username", "Artist", "Album", "Track", "State"]];

        // sort the sessions by media type and push to table
        sessions.forEach(session => {
          // define some variables
          const type = session.media_type;
          const username = session.friendly_name;
          const { title } = session;
          const parentTitle = session.parent_title;
          const grandparentTitle = session.grandparent_title;
          // capitalize the first letter (don't know why this bothers me so much!)
          const state =
            session.state.charAt(0).toUpperCase() +
            session.state.substring(1, session.state.length + 1);

          // sort based on media type
          if (type === "movie") {
            movie.push([username, title, state]);
          } else if (type === "episode") {
            episode.push([
              username,
              grandparentTitle,
              parentTitle,
              title,
              state
            ]);
          } else if (type === "track") {
            track.push([username, grandparentTitle, parentTitle, title, state]);
          }
        });

        print(movie, "Movies", options);
        print(episode, "TV", options);
        print(track, "Music", options);
        // add some padding
        console.log("\n");
      } else {
        console.log("Nothing is currently being played.");
      }
    })
    .catch(err => logger.error(err.message));
};

export default getActivity;

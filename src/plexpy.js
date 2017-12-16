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

const printTable = (data, title) => {
  // define table headers
  const head = data[0];
  // remove the header from the data
  data.splice(0, 1);
  // set the column width
  // settings this as a standard with for now but may set it dynamically based on number of columns in the future
  const colWidths = head.map(() => 12);

  const table = new Table({
    head,
    colWidths
  });

  if (data.length) {
    data.forEach(row => table.push(row));

    if (title) {
      console.log("\n", title);
    }

    console.log(table.toString());
  }
};

const getActivity = () => {
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

        // print all of the tables with titles
        printTable(movie, "Movies");
        printTable(episode, "TV");
        printTable(track, "Music");
      } else {
        console.log("Nothing is currently being played.");
      }
    })
    .catch(err => logger.error(err.message));
};

export default getActivity;

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
export const db = low(adapter);

// write some default properties to the settings object
db
  .defaults({
    host: "",
    port: "",
    apiKey: ""
  })
  .write();

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
      const table = new Table({
        head: ["username", "title"]
      });

      const { sessions } = res.data.response.data;

      sessions.forEach(session => table.push([session.user, session.title]));

      console.log(table.toString());
    })
    .catch(err => logger.error(err));
};

if (needSettings()) {
  getSettings()
    .then(() => {
      getActivity();
    })
    .catch(err => logger.error(err));
} else {
  getActivity();
}

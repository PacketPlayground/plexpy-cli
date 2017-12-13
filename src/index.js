import low from "lowdb";
import path from "path";
import FileSync from "lowdb/adapters/FileSync";

// json file to store settings
const settings = path.join(__dirname, "./settings.json");
// new adapter (using a synchronous adapter)
const adapter = new FileSync(settings);
// define the database
const db = low(adapter);

// write some default properties to the settings object
db
  .defaults({
    host: "",
    port: "",
    apiKey: ""
  })
  .write();

const needSettings = () => {
  // use object destructuring to get settings properties
  const { host, port, apiKey } = db.getState();
  // if any of these values are undefined we need to prompt the user for settings info
  if (!host || !port || !apiKey) {
    return true;
  }
  // else we're good to go!
  return false;
};

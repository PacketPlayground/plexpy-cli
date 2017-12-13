import low from "lowdb";
import prompt from "prompt";
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

const getSettings = () => {
  // prompt schema
  const schema = {
    properties: {
      host: {
        name: "host",
        description:
          "Enter the hostname for your PlexPy instance. (ex. http://192.168.0.1 OR https://plexpy.domain.com)",
        message: "Hostname is required.",
        required: true
      },
      port: {
        name: "port",
        description:
          "Enter the port number that your PlexPy instance runs on. (ex. 8181 OR 80 OR 443)",
        message: "Port is required.",
        required: true
      },
      apiKey: {
        name: "API Key",
        description: "Enter your PlexPY API key",
        message: "PlexPy API key is required",
        required: true
      }
    }
  };

  // start prompt
  prompt.start();
  // get rid of the stupid prompt message
  prompt.message = "";

  prompt.get(schema, (err, results) => {
    if (err) throw err;
    // update the settings.json file with new user settings
    db.setState(results);
  });
};

import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import path from "path";
import axios from "axios";
import inquirer from "inquirer";

const prompt = inquirer.createPromptModule();

// json file to store settings
const settingsFile = path.join(__dirname, "./settings.json");
// new adapter (using a synchronous adapter)
const adapter = new FileSync(settingsFile);
// define the database
export const db = low(adapter); //eslint-disable-line

// function to test the plexpy api and ensure our settings are valid
const testSettings = settings => {
  const { host, port, apiKey } = settings;
  // use the plexpy arnold command and make sure we get a valid response
  return axios({
    method: "GET",
    url: `${host}:${port}/api/v2?apikey=${apiKey}&cmd=arnold`
  })
    .then(res => res.data.response.result === "success")
    .catch(() => {
      // if we get an error here that means we could not connect to PlexPy
      // we'll throw an error and catch it down the line
      throw new Error(
        "Could not connect to that hostname and port number. Are you sure your settings are correct and PlexPy is running?"
      );
    });
};

// function to check if we need any settings
export const needSettings = () => {
  // use object destructuring to get settings properties
  const { host, port, apiKey } = db.getState();
  // if any of these values are undefined we need to prompt the user for settings info
  if (!host || !port || !apiKey) {
    return true;
  }
  // else we're good to go!
  return false;
};

export const getSettings = () => {
  const questions = [
    {
      type: "string",
      name: "host",
      message:
        "Enter the hostname for your PlexPy instance. (ex. http://192.168.0.1 OR https://plexpy.domain.com)"
    },
    {
      type: "number",
      name: "port",
      message:
        "Enter the port number that your PlexPy instance runs on. (ex. 8181 OR 80 OR 443)"
    },
    {
      type: "string",
      name: "apiKey",
      message: "Enter your PlexPY API key"
    }
  ];

  return prompt(questions)
    .then(settings =>
      testSettings(settings).then(settingsWork => {
        if (settingsWork) {
          db.setState(settings).write();
        } else {
          throw new Error(
            "PlexPy gave an error. Are you sure you entered the correct API key?"
          );
        }
      })
    )
    .catch(err => {
      throw err;
    });
};

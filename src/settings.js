import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import path from "path";
import axios from "axios";
import inquirer from "inquirer";
import logger from "./logger";

const prompt = inquirer.createPromptModule();

const home = process.env.HOME || process.env.USERPROFILE;

// json file to store settings
const settingsFile = path.join(home, ".plexpy-cli.json");
// new adapter (using a synchronous adapter)
const adapter = new FileSync(settingsFile);
// define the database
export const db = low(adapter); //eslint-disable-line

// function to test the plexpy api and ensure our settings are valid
// returns true if settings work and false if not
const testSettings = settings => {
  const { host, port, apiKey } = settings;
  // use the plexpy arnold command and make sure we get a valid response
  return axios({
    method: "GET",
    // timeout ensures we throw an error if port is wrong
    timeout: 5000,
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
// returns true if we need to prompt the user for settings and false if not
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

// function to prompt the user to input their plexpy settings
export const getSettings = () => {
  // prompt questions
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

  // run the prompts
  return prompt(questions)
    .then(settings =>
      // ensure the settings they entered work
      testSettings(settings).then(settingsWork => {
        // if settings are good write them to settings.json and log a success message
        if (settingsWork) {
          db.setState(settings).write();
          console.log(
            'Settings saved! You can now connect to PlexPy. Run "plexpy --help" to see what you can do.'
          );
        } else {
          // if testSettings returns false that means we were able to connect to PlexPy but the request failed
          // that means that API key must be wrong
          logger.error(
            "PlexPy gave an error. Are you sure you entered the correct API key?"
          );
        }
      })
    )
    .catch(err => {
      // if we catch an error here it means testSettings threw an erorr
      // only log the error message since the user doesn't care about the stack trace
      logger.error(err.message);
    });
};

// function to reset plexpy settings
export const resetSettings = () => {
  // double check that the user wants to reset settings
  prompt([
    {
      type: "confirm",
      name: "reset",
      message: "Are you sure you want to reset your settings?"
    }
  ])
    .then(({ reset }) => {
      // if they confirm they want to reset then wipe settings.json
      if (reset) {
        // reset the settings
        db.setState({}).write();
        // ask if the user would like to enter new settings now
        // return this so if there are any errors they will be caught
        return prompt([
          {
            type: "confirm",
            name: "newSettings",
            message: "Would you like to enter your new settings now?"
          }
        ]).then(({ newSettings }) => {
          // if the user wants to input settings run getSettings
          if (newSettings) {
            getSettings();
          } else {
            // if the user does not want to input settings log some feedback
            console.log(
              "Ok, you will be asked to input settings next time plexpy-cli runs."
            );
          }
        });
      }
      // if they do not confirm the reset then log some feedback
      console.log("Ok, your settings will NOT be reset");
    })
    .catch(err => logger.error(err));
};

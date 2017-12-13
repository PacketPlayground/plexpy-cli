import prompt from "prompt";
import axios from "axios";
import { db } from "./index";

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

// function to prompt user for PlexPy settings
export const getSettings = () =>
  new Promise((resolve, reject) => {
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
      // test the user entered settings
      testSettings(results)
        .then(settingsWork => {
          if (settingsWork) {
            db.setState(results).write();
            resolve();
          } else {
            reject(
              new Error(
                "PlexPy gave an error. Are you sure you entered the correct API key?"
              )
            );
          }
        })
        .catch(e => {
          reject(e);
        });
    });
  });

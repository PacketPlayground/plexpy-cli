# plexpy-cli

A simple cli tool for monitoring Plex usage through PlexPy

## Installation

This guide assumes that you already have Plex and PlexPy installed on your machine.

1. Download and install node.js
  
    node.js can be downloaded from [here](https://nodejs.org/en/) or if you want to install node from a package manager you find instructions [here](https://nodejs.org/en/download/package-manager/)
2. Install plexpy-cli globally

    `npm install -g plexpy-cli`
3. Input your PlexPy credentials

    On first run plexpy-cli will prompt you for hostname, port, and api key. Your credentials will be stored for future use. For more information about these credentials view the [credentials](#credentials) section.

## Credentials

- hostname: The hostname for your PlexPy installation. This could be your IP number or your domain name. DO include http:// if using http or https:// if using https. DO NOT include the port number. This will be inputted in the next step.

- port: The port number that PlexPy runs on. The default port is 8181 but you may be using 80 or 443 if you are using a reverse proxy.

- api key: Your PlexPy API key. You can find your key by navigating to PlexPy > Settings > Access Control. You might need to generate your first key if you have never done so before.
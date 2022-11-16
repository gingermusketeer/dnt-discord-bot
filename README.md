# DNT Discord Bot

We love the outdoors, DNT and IT and we dream of a more accessible, feature-rich and connected digital DNT community. With this bot and its related apps, we take building it into our own hands. Build entirely by volunteers in their spare time, we hope that you enjoy its functions.

## :red_circle: Join us!

Everybody is welcome to contribute to our app. Are you a developer yourself and can help with building new features? Do you have an idea for a new feature that may be of interest to our community? Join our [DNT discord server](https://discord.gg/acujufNF), see the bot in action and get in touch with us to learn more.

## :red_circle: Interactivity

### Mentions and DMs

The bot replies to dms and mentions in text channels with a generic message.

### /ping and /echo

```
/ping                  // Reply: "Pong!"
/echo message: hello   // Reply: "hello"
```

### /randomcabin

```
/randomcabin
/randomcabin check-in: yyyy-mm-dd check-out: yyyy-mm-dd
```

Want to go on a cabin trip but don't know where to go? Tell the bot when you'd like to go and it finds a random cabin for you that is available at the desired dates. If you omit the dates, you will receive any random cabin instead. Be aware, that we cannot check the availability of all cabins (yet), so providing dates limits the pool of potential cabins. To protect your privacy, Turbo's response is always private - nobody will know that you asked...

## :red_circle: Other features

### New DNT activities

Our app scrapes the DNT website for new activities and the bot posts them to a channel on our discord server.

### Dagens hytte

Every morning, our bot finds a random cabin and posts it to a channel on our discord server.

## :red_circle: Tech

This app uses [Nest](https://github.com/nestjs/nest) framework with TypeScript, [discord.js](https://github.com/discordjs/discord.js/) for the bot functionality and [Supabase](https://supabase.com/) to store some data.

### Installation

```bash
$ npm install
```

### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## :red_circle: License

DNT Discord Bot is [MIT licensed](LICENSE).

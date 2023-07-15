# JNU Notifications Bot

![Bot Logo](path/to/logo.png) <!-- If you have a logo, add it here -->

A bot designed to solve various problems faced by JNU students. This repository contains the code for a Telegram bot that automates the process of checking for updates on the JNU website and sends notifications to a designated channel.

## Problems

- **Daily Verification Updates**: When JNU students join the university through JOSAA, they are required to check the university's website regularly for updates regarding physical verification. This manual process can be time-consuming and frustrating.

- **Hostel Allotment**: JNU's hostel allotment procedure is different from many other universities/colleges, as the School and IHA (Indian Hostel Authority) work independently. After registration, it may take 2-3 semesters for students to receive their hostel allotment, during which they are required to repeatedly visit the website and manually refresh the page for updates.

- **Important Notices**: Important notices from various schools/centers in JNU are circulated through the university's website. This creates a similar challenge of having to visit the site repeatedly to look for updates.

These problems consume a significant amount of time and cause frustration among students.

## What This Repository Offers

This repository contains the code for a Telegram bot that automates the process of checking for updates on important JNU websites and relaying those updates to a designated channel. The bot's functionality can be extended by adding additional websites or sources of information. To add new websites, refer to the code in `src/worker.js` and `src/tasks/` directories.

## Installation

To use the JNU Notifications Bot, follow these steps:

1. Clone the repository:

   ```shell
   git clone https://github.com/PrashanthKumar0/jnu-notifications-bot.git
   ```

2. Install the required dependencies, including `wrangler`:

   ```shell
   cd jnu-notifications-bot
   npm install wrangler
   ```

3. Set up Cloudflare Workers:

   - Install the Cloudflare Workers CLI (`wrangler`) globally if you haven't already:

     ```shell
     npm install -g @cloudflare/wrangler
     ```

   - Configure your Cloudflare account by logging in:

     ```shell
     wrangler login
     ```

   - Create a new Cloudflare Workers project:

     ```shell
     wrangler init
     ```

   - Update the `wrangler.toml` file in your project directory with your Cloudflare account information. (provided reference `wrangler.exmple.toml`)

4. Set up Cloudflare's Durable Objects database:

   - Create a database and run the `schema.sql` file using `wrangler`:

     ```shell
        wrangler d1 execute <DATABASE_NAME> --file=schema.sql
     ```

5. Customize the bot:

   - Adjust the settings and preferences in the `wrangler.toml` file according to your requirements. (provided reference `wrangler.exmple.toml`)

6. Deploy the bot:

   ```shell
   npm run deploy
   ```

## Usage

Once the bot is deployed using Cloudflare Workers, it will automatically crawl through the designated JNU websites and check for updates. If any updates are found, the bot will send notifications to the specified Telegram channel. Users can subscribe to the channel to receive timely updates.

To test the bot locally, run the following command:

```shell
npm run dev
```


## Contributing

Contributions to this project are welcome. If you have any ideas, improvements, or bug fixes, feel free to open an issue or submit a pull request. Please ensure that your contributions align with the project's coding style and guidelines.

## License

This project is licensed under the [MIT License](LICENSE). You are free to use, modify, and distribute this codebase for personal or commercial purposes.

## Contact Information

If you have any questions or need further assistance, feel free to reach out to the project maintainer:

- Name: [Prashanth Kumar]
- Telegram: [@prashanthKumar0](https://t.me/prashanthKumar0)

<!-- ## Acknowledgments
s
Special thanks to [Name] for their valuable contributions to this project. -->

<!-- Add any additional acknowledgments or credits if necessary -->

---

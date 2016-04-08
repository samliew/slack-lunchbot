# slack-lunchbot

A Node.js lunch suggestion app for Slack.

## Github

https://github.com/samliew/slack-lunchbot

## Slack Integration

https://<Team URL>.slack.com/apps/manage/custom-integrations

### Incoming Webhook

- Required for sending of messages from Lunchbot
- Paste Webhook URL to Heroku’s SLACK_WEBHOOK_URL variable
- Posts to #general as incoming-webhook-lunch
- Name, icon, channel can be overridden by Lunchbot app

### Outgoing Webhook

- Required for listening of keywords like “suggest lunch,lunch”.
- Get from Slack > Custom Integrations > Incoming WebHooks.
- Action: POST to http://<Heroku Domain>/lunchbot

## Heroku

- Management https://dashboard.heroku.com/apps/<Heroku Name>/ 
- Repo, push to deploy https://git.heroku.com/<Heroku Name>.git 

## Heroku Environment Variables

Name                   | Description
---------------------- | -----------
LUNCH_NORMAL_NAME      | Will do a string search, pick if partial match
LUNCH_SPECIAL_NAME     | For special events. Remember to remove after event.
LUNCH_SPECIAL_LOCATION | As above. Optional.
LUNCH_SPECIAL_TIME     | As above. Optional.
PAUSED                 | Will do nothing when triggered.
SLACK_BOT_NAME         | Override default display name in Slack integration
SLACK_CHANNEL          | Override default channel in Slack integration, include # to indicate channel
SLACK_WEBHOOK_URL      | To allow incoming integration to Slack for listening of “lunch”. Get from Slack > Custom Integrations > Incoming WebHooks.
TEMPORIZE_URL          | Do not touch, to be set up automatically by the Temporize Scheduler add-on

## Temporize Scheduler

- Access from Resources tab in Heroku
- 5 events - One for each weekday in UTC time (minute hour * * dayOfWeek)
  `"0 4 * * 2", "0 4 * * 3", "0 4 * * 4", "0 4 * * 5", "0 4 * * 6"`
- Callback URL - http://<Heroku Domain>/lunchbot
- Method - POST

### EOF
# Tax-Collector
Discord bot made to automate tax collection in the game Albion Online

## Available commands:
- taxes <ammount>
- afk <mention> <duration> <reason>
- split

## Usage (Short)
### Taxes
Paste the logs and in the first message include the command and the ammount like so `$taxes 150000`. The bot will afterwards spit out a list of in game names of people that haven't payed their tax. The last message will be a prompt to DM everyone on the list and notify them (react to accept).
### Afk
Adds a user to the afk list. Anyone in that list will be ignored and not included in the final list of "tax evaders".
### Split
Splits everyone in the voice channel of the person that initiated the command into two teams (randomly).

## Usage (In Depth)
### Taxes
Before using the taxes command go into you game and press "G". There you'll find two icons next to the search bar, click the first one with the 3 vertical lines.

![guild panel](https://i.imgur.com/8OtZzz2.png)

Click the "Timeframe" dropdown and select last week. Now that the logs have loaded click the icon directly above the scroll bar which will copy the contents of the logs to your clipboard. 

![logs panel](https://i.imgur.com/kr8qe7Y.png)

Now you can head back to discord and type in the respective channel `$afk <ammount>` and press CTRL+V which will paste the logs. If you do it right you will get a similar popup to mine. Now hit ENTER or click the Upload button and go back into the game again.

![discord message example](https://i.imgur.com/1pazYX9.png)

Once back in click on the dropdown that says "Tax Contribution" and select "Silver Balance". Now repeat the same proccess as before (copy the logs, paste them etc) but leave the discord message empty and hit ENTER, the rest is self explanatory.

![logs panel2](https://i.imgur.com/ewyKXmd.png)

The bot will then respond with a message similar to this one. If you want everyone to be notified react to the checkmark in the very last message.

![discord bot message](https://i.imgur.com/aKAGC9U.png)


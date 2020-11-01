# Wizard of Demo
As any seasoned software engineer knows, demos are where the bugs decide to show up. On top of that, demoing the various flows of your application including error handling and recovery are not always possible. Tools like [Storybook](https://storybook.js.org/) can help but often require additional complex coding and don't demonstrate the application as it would be loaded in the wild. Enter Wizard of Demo. This project intercepts API requests just before they are sent to a server and injects its own response instead.

The end goal is to allow users to inject the Wizard of Demo on any site with a set of customizeable rules, and demonstrate any aspect of their application (as long as it relies on API results).

# jira-scraper

Takes issue range and scrapes data from Jira Server / DC instances.

```
const program = new Command()
  .version("0.0.1")
  .option("-i, --instance [instance]", "Jira Instance") // like jira.atlassian.com/jira, no trailing slash
  .option("-p, --project [project]", "Jira Project")
  .option("-s, --start [start]", "Start Issue")
  .option("-e, --end [end]", "End Issue")
  .option("-o, --output [output]", "Output File")
  .parse(process.argv);
```

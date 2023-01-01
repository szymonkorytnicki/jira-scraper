// commander script to take jira project and issue range
// and scrape the issues into a csv file

import fs from "fs";
import cheerio from "cheerio";
import { Command, Option } from "commander";

const program = new Command()
  .version("0.0.1")
  .option("-i, --instance [instance]", "Jira Instance")
  .option("-p, --project [project]", "Jira Project")
  .addOption(new Option("-s, --start <number>", "Start Issue").preset(1).argParser(parseInt))
  .addOption(new Option("-e, --end <number>", "End Issue").preset(1).argParser(parseInt))
  .option("-o, --output [output]", "Output File")
  .parse(process.argv);

const { project, start, end, output, instance } = program.opts();

if (!project || !start || !end || !output || !instance) {
  console.log({
    instance,
    project,
    start,
    end,
    output,
  });
  console.log("Missing required arguments");
  process.exit(1);
}

if (start > end) {
  console.log("Start issue must be less than end issue");
  process.exit(1);
}

// on exit, write out what we have
process.on("exit", function () {
  console.log("Caught exit signal, writing to file");
  writeCSV();
});

// on cancel, write out what we have
process.on("SIGINT", function () {
  console.log("Caught interrupt signal, writing to file");
  writeCSV();
  process.exit();
});

const url = "https://" + instance + "/browse/" + project + "-";
const issues = [];

for (let i = start; i <= end; i++) {
  issues.push(url + i);
}

const issueData = [];

function getIssueData(url) {
  console.log("Requesting: " + url);
  fetch(url)
    .then((response) => response.text())
    .then((html) => {
      const $ = cheerio.load(html);
      const issue = {};
      issue.url = url;
      issue.title = $("#summary-val").text();
      issue.priority = $("#priority-val").text().trim();
      console.log(issue);
      issueData.push(issue);
    });
}

let currentIssue = 0;
setInterval(function () {
  if (issueData.length === issues.length) {
    return writeCSV();
  }

  if (currentIssue < issues.length) {
    getIssueData(issues[currentIssue]);
    currentIssue++;
  }
}, 1000);

function writeCSV() {
  var csv = "url,title,priority\n";

  issueData.forEach(function (issue) {
    csv += issue.url + "," + issue.title + "," + issue.priority + "\n";
  });

  fs.writeFileSync(output, csv);
}

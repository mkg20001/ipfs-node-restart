#!/usr/bin/env node

const optionDefinitions = [
  {
    name:"interval",
    alias:"i",
    type:"number",
    describe:"Scan Interval",
    defaultValue:1000
  },
  {
    name:"binary",
    alias:"b",
    type:"string",
    describe:"Path to IPFS binary",
    defaultValue:"ipfs"
  },
  {
    name:"restart",
    alias:"r",
    type:"boolean",
    describe:"Allow restart",
    defaultValue:false
  },
  {
    name:"restart.script",
    alias:"s",
    type:"string",
    describe:"Path to restart script",
    defaultValue:""
  },
  {
    name:"min.nodes",
    alias:"m",
    type:"number",
    describe:"Minimum nodes online",
    defaultValue:4
  },
  {
    name:"path",
    alias:"p",
    type:"string",
    describe:"Path to IPFS repo",
    defaultValue:require("path").join(require("os").homedir(),".ipfs")
  }
]

var args=require("yargs");
optionDefinitions.map(function(o) {
  args
    .alias(o.alias,o.name)
    .describe(o.alias,o.describe)
    .default(o.alias,o.defaultValue)[o.type](o.alias);
});

args
  .help("h")
  .alias("h","help")
  .epilog("Copyright (C) 2015 Maciej Krüger\nThis is free software; see the source for copying conditions.  There is NO warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.");

const restart=require(require("path").join(__dirname,"index.js"));
new restart(args.argv);

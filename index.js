const cp=require("child_process");
const jsonfile=require("jsonfile");
const path=require("path");
const w=require(path.join(__dirname,"w.js"));
function nodeRestart(opt,mute) {
  var ee,events;
  if (mute) {
    ee=require("events").EventEmitter
    events=new ee();
  }
  function event(type,ev,msg,arg) {
    if (arg) {
      if (mute) {
        events.emit(ev,arg);
      } else {
        if (msg) console[type](msg,arg);
      }
    } else {
      if (mute) {
        events.emit(ev);
      } else {
        if (msg) console[type](msg);
      }
    }
  }
  function exec(cmd,cb) {
    return cp.exec(opt.binary+" "+cmd,{env:{"IPFS_PATH":opt.path}},function(e,std,ste) {
      if (e) return cb(new Error(e.toString()));
      if (ste.toString()) return cb(new Error(ste.toString().trim()));
      return cb(e,std);
    });
  }
  var lock=false;
  function fine() {
    lock=false;
    event("log","ok","OK!");
    //Everything is fine.
  }
  function fail(i) {
    lock=false;
    event("error","failed","Failed after %s method(s)",i);
  }
  function nodeConnect(i) {
    if ((i%3)===0&&i!==0) {
      console.error("Could not connect to the IPFS or not enough nodes in list - restarting...");
      return nodeRestart(i);
    } else {
      jsonfile.readFile(path.join(opt.path,"config"),function(e,config) {
        var l=config.Bootstrap.length;
        var c=0;
        event("log","ipfs.connect","Connecting to nodes");
        w(config.Bootstrap,function(n,done) {
          event("log","node.connect","",n);
          exec("swarm connect "+n,function(e) {
            if (e) event("error","node.connect.failed","Failed to connect to node %s",n); else c++;
            done();
          });
        })(function() {
          event("log","ipfs.connected","Connected to %s nodes",c+"/"+l);
          i++;
          return check(i);
        });
      });
    }
  }
  function nodeRestart(i) {
    i++;
    if (i>6) {
      return fail(i);
    }
    if (opt.restart) {
      if (opt["restart-script"]) {
        event("log","restart","Restarting...");
        cp.execFile(opt["restart-script"],function(e,std,ste) {
          if (e) {
            event("error","restart.error","Restart failed with error: %s",new Error(e.toString()));
            return fail(i);
          }
          if (ste.toString()) {
            event("error","restart.error","Restart failed with error: %s",new Error(ste.toString().trim()));
            return fail(i);
          }
          event("log","restart.ok","Restart was sucessfull");
          return check(i);
        });
      } else {
        event("log","restart.skip","Restart script is missing - skip...");
        return fail(i);
      }
    } else {
      event("log","restart.skip","Restart is disabled - skip...");
      return fail(i);
    }
  }
  function check(i) {
    if (!i&&lock) return;
    if (!i) i=0;
    lock=true;
    exec("swarm peers",function(e,out) {
      if (e) {
        event("error","ipfs.peerlist","Is your node running?",e);
        return nodeRestart(i);
      } else {
        out=out.split("\n").filter(function(l) {return !!l;});
        if (out.length<opt["min-nodes"]) {
          return nodeConnect(i);
        } else {
          return fine(i);
        }
      }
    });
  }
  if (events) {
    this.once=events.once.bind(events);
    this.on=events.on.bind(events);
  }
  this.interval=setInterval(check,opt.interval);
}
module.exports=nodeRestart;

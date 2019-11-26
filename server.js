const express = require("express");
const app = express();
app.use(express.json());
const {isIn, regex, send, del} = require("./utils");

app.get("/", (req,res) => {
	res.send("Thanks for keeping me alive fellow policer!")
});

app.post("/events", (req, res) => {
  try {
    if (req.body.event.channel != "C0P5NE354") { res.end() }
    if (req.body.event.type == "message" && req.body.event.subtype != "message_deleted") {
      let {ts ,text ,user, channel,thread_ts} = req.body.event;
      if (!user) {
        user = req.body.event.message.user;
        ts = req.body.event.message.ts;
        thread_ts = req.body.event.message.thread_ts;
        text = req.body.event.message.text;
      }
      let maints = ts;
      ts = thread_ts ? thread_ts : ts
      var emojis = text.match(regex);
      if (emojis) {
        emojis.map((emoji) => {
          isIn(emoji,user)
            .then((is) => {
              if (is) {
                console.log(req.body.event);
                console.log("the ts is: "+ts+" || and the channel is : "+channel)
                send(process.env.LOGS,`<@${user}> has used an emoji in a message the wrong way! The message was \`${text}\` in channel <#${channel}>`)
                send(channel,"This message has been removed for using a restricted emoji!",ts);
              }
            })
        })
      } 
    } else if (req.body.event.type == "reaction_added"){
      let {user, reaction} = req.body.event;
      isIn(`:${reaction}:`,user)
        .then((is) => {
          if (is) {
            send(process.env.LOGS,`<@${user}> has used an emoji in a reaction the wrong way! The emoji was :${reaction}: in channel <#${req.body.event.item.channel}>`)
            send(user,`A reaction you posted has had a restricted emoji. The admin's will be contacted. The emoji you used was :${reaction}:!`);
          }
        })
	}
  } finally {
	  res.send(req.body.challenge)
  }
});


const listener = app.listen(process.env.PORT, function () {
  console.log("Badger is listening on port " + listener.address().port);
});
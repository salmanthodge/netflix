const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const netflix = require("./netflix");

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
  req.headers["request_id"] = uuid.v4(); //request_id
  next();
});

app.use("/v1/", netflix);

app.listen(3000, () => {
  console.log("Server Started");
});

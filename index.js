#!/usr/bin/env node
const app = require("./server/app");

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server listening at ${port}`);
});

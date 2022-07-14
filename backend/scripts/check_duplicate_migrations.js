const fs = require("fs");
const path = require("path");
const { exit } = require("process");

const directoryPath = path.join(__dirname, "../migrations");
const filenames = fs.readdirSync(directoryPath);
console.log({ filenames });

let prevUp = 0;
let prevDown = 0;
let errors = [];

filenames.forEach((filename) => {
  const num = filename.split("_")[0];
  const direction = filename.split(".")[1];

  if (direction === "up") {
    if (prevUp !== num) {
      prevUp = num;
    } else {
      errors.push(`Migration #${num} already exists`);
    }
  } else {
    if (prevDown !== num) {
      prevDown = num;
    } else {
      errors.push(`Migration #${num} already exists`);
    }
  }
});

console.log({ prevDown, prevUp, errors });
if (errors.length > 0) {
  console.log(errors.join("\n"));
  exit(1);
}
exit(0);

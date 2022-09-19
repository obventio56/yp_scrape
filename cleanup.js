const { writeToPath } = require("@fast-csv/format");
const { parse } = require("csv-parse");
const fs = require("fs");

let allData = [];

new Promise((outerRes, outerRej) => {
  fs.readdir("./data/", async (err, filenames) => {
    for (var filename of filenames) {
      const data = await new Promise((resolve, reject) => {
        rows = [];
        fs.createReadStream(`./data/${filename}`)
          .pipe(parse({ delimiter: ",", quote: '"', relax_quotes: true }))
          .on("data", (r) => {
            rows.push([...r, filename]);
          })
          .on("end", () => {
            resolve(rows);
            if (filename === filenames[filenames.length - 1]) {
              outerRes(allData);
            }
          });
      });

      allData = [...allData, ...data.filter((r) => r[0] != "" && r[1] != "")];
      const path = `allData.csv`;
      const options = { headers: true, quoteColumns: true };

      writeToPath(path, allData, options)
        .on("error", (err) => console.error(err))
        .on("finish", () => console.log("Done writing."));
      console.log(allData);
    }
  });
});

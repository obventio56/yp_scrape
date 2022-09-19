const axios = require("axios").default;
const parser = require("node-html-parser");
const { writeToPath } = require("@fast-csv/format");

const cities = ["Louisville%2C+KY"];
const scrapeContractors = async (url) => {
  const { data } = await axios.get(url);

  const root = parser.parse(data);
  const contractors = root.querySelectorAll(".srp-listing");

  const contactInfo = contractors.map((c) => {
    const phone = c.querySelector(".phone.primary")?.text;
    const name = c.querySelector(".business-name span")?.text;
    return { name, phone };
  });

  return contactInfo;
};

const pagesToScrape = 2;
const searchTerm = "contractor";

cities.forEach(async (city) => {
  var data = [];

  for (var i = 0; i < pagesToScrape; i++) {
    const results = await scrapeContractors(
      `https://www.yellowpages.com/search?search_terms=${searchTerm}&geo_location_terms=${city}&page=${i +
        1}`
    );
    data = [...data, ...results];
  }

  const path = `${__dirname}/${city}.csv`;
  const options = { headers: true, quoteColumns: true };

  writeToPath(path, data, options)
    .on("error", (err) => console.error(err))
    .on("finish", () => console.log("Done writing."));
});

require("dotenv").config();
const cookie = process.env.COOKIE;
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");

const filepath = "./microchip/";
const logfpath = "./microchip.log";
const baseURL = "https://app.savethislife.com";

const pageTotalinSection = 30;
const pagecountLimit = 47450;
const startPage = 1;

fs.writeFile(filepath, '{\n"microchip": [\n', function () {
    fs.writeFile(logfpath, "Enveloping start of file..." + "\n", () => {
        console.log("Enveloping start of file...");
    });
    section_scraping(startPage, startPage + pageTotalinSection);
});

function section_scraping(pageStartID, pageEndID) {
    let partial_scraped_count = 0;
    for (let index = pageStartID; index < pageEndID; index++) {
        fs.appendFile(logfpath, "Request sent to page: " + index + "\n", () => {
            console.log("Request sent to page: " + index);
        });

        try {
            request.get(
                {
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                        Cookie: cookie,
                    },
                    url: baseURL + "/admin/registeredpets?page=" + index,
                },
                function (err, res, html) {
                    if (err) {
                        fs.appendFile(logfpath, err + "\n", () => {
                            console.log(err);
                        });
                    } else {
                        const $ = cheerio.load(html);
                        $("tbody > tr > td:nth-child(2) a").each((i, ele) => {
                            const data = {
                                id: $(ele).attr("href"),
                                microchip: $(ele).text(),
                            };
                            fs.appendFile(
                                filepath,
                                JSON.stringify(data) + ",\n",
                                function (err) {
                                    if (err) console.log(err);
                                }
                            );
                        });

                        fs.appendFile(
                            logfpath,
                            "Scraping completed page: " + index + "\n",
                            () => {
                                console.log(
                                    "Scraping completed page: " + index
                                );
                            }
                        );
                    }

                    partial_scraped_count++;

                    if (partial_scraped_count === pageTotalinSection) {
                        if (pageEndID < pagecountLimit) {
                            if (err) {
                                setTimeout(() => {
                                    section_scraping(pageStartID, pageEndID);
                                }, 3000);
                            } else {
                                section_scraping(
                                    pageStartID + pageTotalinSection,
                                    pageEndID + pageTotalinSection
                                );
                            }
                        } else {
                            fs.appendFile(filepath, "]}", function () {
                                fs.appendFile(
                                    logfpath,
                                    "Enveloping end of file..." + "\n",
                                    () => {
                                        console.log(
                                            "Enveloping end of file..."
                                        );
                                    }
                                );
                                fs.appendFile(
                                    logfpath,
                                    "Scraping completed successfully!!!s" +
                                        "\n",
                                    () => {
                                        console.log(
                                            "Scraping completed successfully!!!s"
                                        );
                                    }
                                );
                            });
                        }
                    }
                }
            );
        } catch (error) {
            fs.appendFile(logfpath, error + "\n", () => {
                console.log(error);
            });
        }
    }
}

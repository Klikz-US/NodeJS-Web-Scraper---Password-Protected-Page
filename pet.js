require("dotenv").config();
const cookie = process.env.COOKIE;
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");

const microchipfpath = "./microchips_test.json";
const filepath = "./pet.json";
const logfpath = "./pet.log";
const baseURL = "https://app.savethislife.com/";

var microchip_obj = {};
const pageTotalinSection = 2;
const pagecountLimit = 5;

fs.writeFile(filepath, '{\n"pet": [\n', function () {
    fs.writeFile(logfpath, "Enveloping start of file..." + "\n", () => {
        console.log("Enveloping start of file...");
    });
    fs.readFile(microchipfpath, "utf8", function (err, data) {
        if (err) {
            fs.appendFile(logfpath, error + "\n", () => {
                console.log(error);
            });
        }
        microchip_obj = JSON.parse(data);
        section_scraping(1, pageTotalinSection);
    });
});

function section_scraping(pageStartID, pageEndID) {
    let partial_scraped_count = 0;
    for (let index = pageStartID; index < pageEndID + 1; index++) {
        const pageID = microchip_obj.microchip[index - 1].id;
        fs.appendFile(
            logfpath,
            "Request sent to page: " + pageID + "\n",
            () => {
                console.log("Request sent to page: " + pageID);
            }
        );

        try {
            request.get(
                {
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                        Cookie:
                            "savethislife.challenge=Xrx8W3NhdmV0aGlzbGlmZW1pY3JvY2hpcHNAZ21haWwuY29t2gvcbRELadFrg9oFoxQxGX-ErngtUeWuxpi7vNh4KRI=; Path=/admin",
                    },
                    url: baseURL + pageID,
                },
                function (err, res, html) {
                    if (err) {
                        fs.appendFile(logfpath, err + "\n", () => {
                            console.log(err);
                        });
                    } else {
                        const $ = cheerio.load(html);
                        const data = {
                            microchip: $(
                                "#pet-form > div > .panel-body > div:nth-child(2) > .panel-body > div:nth-child(3) > span"
                            ).text(),
                            reg_date: $(
                                "#pet-form > div > .panel-body > div:nth-child(2) > .panel-body > div:nth-child(5) > span"
                            ).text(),
                            petname: $("#petname").attr("value"),
                            species: $(
                                "select[name='species'] option:selected"
                            ).attr("value"),
                            breed: $("#breed").attr("value"),
                            color: $("input[name='color']").attr("value"),
                            gender: $(
                                "select[name='gender'] option:selected"
                            ).attr("value"),
                            birthdate: $("input[name='birthdate']").attr(
                                "value"
                            ),
                            photo: $("img.image-pet").attr("src"),
                            special_needs: $("textarea[name='needs']").text(),
                            veterinary: $("textarea[name='veterinary']").text(),
                            datevacc: $("input[name='datevacc']").attr("value"),
                            purchasedfrom: $(
                                "input[name='purchasedfrom']"
                            ).attr("value"),
                            owneremail: $("input[name='owneremail']").attr(
                                "value"
                            ),
                            membership: "platinum",
                        };
                        if ($(".container > div > .panel-warning").length !== 0)
                            data.membership = "diamond";
                        fs.appendFile(
                            filepath,
                            JSON.stringify(data) + ",\n",
                            function (err) {
                                if (err) console.log(err);
                            }
                        );

                        partial_scraped_count++;
                        fs.appendFile(
                            logfpath,
                            "Scraping completed page: " +
                                pageID +
                                ", index: " +
                                index +
                                "\n",
                            () => {
                                console.log(
                                    "Scraping completed page: " +
                                        pageID +
                                        ", index: " +
                                        index
                                );
                            }
                        );

                        if (partial_scraped_count === pageTotalinSection) {
                            if (pageEndID < pagecountLimit) {
                                section_scraping(
                                    pageStartID + pageTotalinSection,
                                    pageEndID + pageTotalinSection
                                );
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
                }
            );
        } catch (error) {
            fs.appendFile(logfpath, error + "\n", () => {
                console.log(error);
            });
        }
    }
}

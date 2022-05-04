$(function () { // ready function
    const channels = ['Falcodrin']
    const clientOptions = {
        options: {
            debug: true
        },
        channels: channels
    }
    const client = tmi.Client(clientOptions)

    const tableHeaderRow = $("#chat-table-header-row")

    performTests(tableHeaderRow);

    client.connect().catch(console.error)
    client.on('message', (channel, tags, message, self) => {
        if (self) return;

        // append new row
        if (isValidAlert(tags.username, message)) {
            tableHeaderRow.after(parseRow(message))
        }

        // if too many rows, delete the last one
        var allRows = $("#chat-table tr")
        if (allRows.length > 20) {
            $(allRows[allRows.length - 1]).remove()
        }
    })
})


const regexPrice = /\$\d+\.?\d*/gu
const regexJustNumber = /\d+\.?\d*/gu
const regexLink = /https:\/\/\w+\.\S+/gu
const regexCard = /[A-Z]+ [\w\s]+? [0-9]+ [^:]+https/gu

const acceptableCards = ["3060 Ti"]
const excellentPrice = 500
const greatPrice = 530
const goodPrice = 570

/**
 * Returns true when this string is actually an alert.
 */
function isValidAlert(username, message) {
    const isStonkBot = !!username.match("stonkbot")
    const hasPrice = !!message.match(regexPrice)
    const hasLink = !!message.match(regexLink)
    const isAcceptableCard = acceptableCards.some(card => !!message.toLowerCase().includes(card.toLowerCase()))

    return isStonkBot && hasPrice && hasLink && isAcceptableCard
}

/**
 * Returns a string representing an HTML table row, converted from a string of data that represents an alert.
 */
function parseRow(alertString) {
    var row = []
    row.push(new Date().toLocaleTimeString())

    const price = alertString.match(regexPrice)[0]
    const priceNumber = price.match(regexJustNumber)[0]

    var priceQuality = "bad"
    if (parseFloat(priceNumber) < excellentPrice) priceQuality = "excellent"
    else if (parseFloat(priceNumber) < greatPrice) priceQuality = "great"
    else if (parseFloat(priceNumber) < goodPrice) priceQuality = "good"
    row.push(price)

    row.push(alertString.match(/ \S+: /u)[0].slice(1, -2))
    row.push(alertString.match(/: \S+ \$/u)[0].slice(2, -2))

    row.push(alertString.match(regexCard)[0].slice(0, -5))

    var listOfLinks = alertString.match(regexLink)
    row.push(createLink(listOfLinks[0], true))
    row.push(listOfLinks[1] ? createLink(listOfLinks[1], false) : "")

    const rowString = "<tr>" + row.map((td, index) => {
        if (index == 1) {
            return `<td><div class="price-cell price-${priceQuality}">${td}</div></td>`
        } else {
            return `<td>${td}</td>`
        }
    }).join('') + "</tr>"

    return rowString
}

/**
 * Return an HTML hyperlink containing a link icon.
 * Might also have text in it if it's a bigger button.
 */
function createLink(linkUrl, biggerButton) {
    return `<a target="_blank" href="${linkUrl}" class="button` + (biggerButton ? " bigger-button" : "") + `"><i class="fas fa-link"></i>` + (biggerButton ? " GO!" : "") + `</a>`
}

function performTests(tableHeaderRow) {
    const testStrings = ["🚀🚨 AMAZON: New $749.99 GIGABYTE GeForce RTX 3060 Ti GAMING OC https://stockl.ink/npDvfJQb ATC: https://stockl.ink/jbmbQFoJ #ad 🚨🚀",
        "🚀🚨 AMAZON: New $242.33 Kingston FURY Beast 32GB (2 x 16GB) https://stockl.ink/S79udr7h ATC: https://stockl.ink/YbmvKfbB #ad 🚨🚀",
        "🚀🚨 AMAZON: Used $459.99 PNY GeForce RTX 3060 XLR8 REVEL EPIC-X RGB Single https://stockl.ink/IpikQzCl ATC: https://stockl.ink/BXefdD5V #ad 🚨🚀",
        "🚀🚨 AMAZON: New $549.99 GIGABYTE GeForce RTX 3060 Ti GAMING OC https://stockl.ink/npDvfJQb ATC: https://stockl.ink/jbmbQFoJ #ad 🚨🚀",
        "🚀🚨 AMAZON: New $509.99 GIGABYTE GeForce RTX 3060 Ti GAMING OC https://stockl.ink/npDvfJQb ATC: https://stockl.ink/jbmbQFoJ #ad 🚨🚀",
        "🚀🚨 AMAZON: New $499.99 GIGABYTE GeForce RTX 3060 Ti GAMING OC https://stockl.ink/npDvfJQb ATC: https://stockl.ink/jbmbQFoJ #ad 🚨🚀"
    ]

    testStrings.forEach(str => {
        if (isValidAlert('stonkbot', str)) {
            tableHeaderRow.after(parseRow(str))
        }
    })
}
// String extentions
interface String {
    trimEnds(): string;
    parseMana(): string;
    parseNewLine(): string;
}

// Parse new line
String.prototype.parseNewLine = function(): string {
    return this.replace(/(?:\r\n|\r|\n)/g, '<br>');
}

// Trim first and last character ("")
String.prototype.trimEnds = function(): string {
    return this.substr(1).slice(0, -1);
}

// Build mana image
function getManaImage(fileName) {
    return "<img class='inline-symbol' src='/assets/symbols/" + fileName + ".svg' />";
}

// Parse mana
String.prototype.parseMana = function(): string {
    let mana: string = this;

    for (let i = 0; i < symbols.length; i++) {
        let symbol = symbols[i];
        let regex = new RegExp(symbol.k, "g");
        mana = mana.replace(regex, getManaImage(symbol.v));
    }
    return mana;
}

// Mana key/value
// Key/k = scryfall mana symbol
// Value/v = svg file name
let symbols = [
    { k: "\\{T\\}", v: "t" },
    { k: "\\{Q\\}", v: "q" },
    { k: "\\{E\\}", v: "e" },
    { k: "\\{PW\\}", v: "pw" },
    { k: "\\{CHAOS\\}", v: "choas" },
    { k: "\\{A\\}", v: "a" },
    { k: "\\{X\\}", v: "x" },
    { k: "\\{Y\\}", v: "Y" },
    { k: "\\{Z\\}", v: "Z" },
    { k: "\\{0\\}", v: "0" },
    { k: "\\{½\\}", v: "1-2" },
    { k: "\\{1\\}", v: "1" },
    { k: "\\{2\\}", v: "2" },
    { k: "\\{3\\}", v: "3" },
    { k: "\\{4\\}", v: "4" },
    { k: "\\{5\\}", v: "5" },
    { k: "\\{6\\}", v: "6" },
    { k: "\\{7\\}", v: "7" },
    { k: "\\{8\\}", v: "8" },
    { k: "\\{9\\}", v: "9" },
    { k: "\\{10\\}", v: "10" },
    { k: "\\{11\\}", v: "11" },
    { k: "\\{12\\}", v: "12" },
    { k: "\\{13\\}", v: "13" },
    { k: "\\{14\\}", v: "14" },
    { k: "\\{15\\}", v: "15" },
    { k: "\\{16\\}", v: "16" },
    { k: "\\{17\\}", v: "17" },
    { k: "\\{18\\}", v: "18" },
    { k: "\\{19\\}", v: "19" },
    { k: "\\{20\\}", v: "20" },
    { k: "\\{100\\}", v: "100" },
    { k: "\\{1000000\\}", v: "1000000" },
    { k: "\\{∞\\}", v: "infinite" },
    { k: "\\{W/U\\}", v: "wu" },
    { k: "\\{W/B\\}", v: "wb" },
    { k: "\\{B/R\\}", v: "br" },
    { k: "\\{B/G\\}", v: "bg" },
    { k: "\\{U/B\\}", v: "ub" },
    { k: "\\{U/R\\}", v: "ur" },
    { k: "\\{R/G\\}", v: "rg" },
    { k: "\\{R/W\\}", v: "rw" },
    { k: "\\{G/W\\}", v: "gw" },
    { k: "\\{G/U\\}", v: "gu" },
    { k: "\\{2/W\\}", v: "2w" },
    { k: "\\{2/U\\}", v: "2u" },
    { k: "\\{2/B\\}", v: "2b" },
    { k: "\\{2/R\\}", v: "2r" },
    { k: "\\{2/G\\}", v: "2g" },
    { k: "\\{P\\}", v: "p" },
    { k: "\\{W/P\\}", v: "wp" },
    { k: "\\{U/P\\}", v: "up" },
    { k: "\\{B/P\\}", v: "bp" },
    { k: "\\{R/P\\}", v: "rp" },
    { k: "\\{G/P\\}", v: "gp" },
    { k: "\\{HW\\}", v: "hw" },
    { k: "\\{HR\\}", v: "hr" },
    { k: "\\{W\\}", v: "w" },
    { k: "\\{U\\}", v: "u" },
    { k: "\\{B\\}", v: "b" },
    { k: "\\{R\\}", v: "r" },
    { k: "\\{G\\}", v: "g" },
    { k: "\\{C\\}", v: "c" },
    { k: "\\{S\\}", v: "s" }
]
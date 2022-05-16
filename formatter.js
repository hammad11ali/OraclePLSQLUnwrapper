function format(str) {
    const regex = /([ ]*\n)+/gm;
    const subst = `\n`;
    const result = str.replace(regex, subst);
    return result;
}

module.exports = {
    format
}
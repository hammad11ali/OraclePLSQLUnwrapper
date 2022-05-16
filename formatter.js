function format(str) {
    const regex = /(?:\s*\n)+/g;
    const subst = '\n';
    const result = str.replace(regex, subst);
    return result;
}

module.exports = {
    format
}
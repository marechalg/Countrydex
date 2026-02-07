function neutralize(text) {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[-'''`\s]/g, '')
        .toLowerCase().trim();
}

module.exports = neutralize;
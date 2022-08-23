function cleanPrice (value = '') {
    value = value.replace('$', '')
    value = value.replace('\n', '')
    value = value.trim()

    return Number(value)
}

module.exports = cleanPrice

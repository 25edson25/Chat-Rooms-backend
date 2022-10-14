function generateCode(number) {
    const auxCode = Math.random().toString(36).slice(-number)

    code = []
    for (c of auxCode)
        if (Math.floor(Math.random()*2)) 
            code.push(c.toUpperCase())
        else
            code.push(c)

    return code.join("")
}

module.exports = generateCode
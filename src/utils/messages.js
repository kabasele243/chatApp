const generateMessage = (text) => {
    return {
        text,
        createdAt: new Date().getTime()
    }
}

const generateUrl = (url) => {
    return {
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateUrl
}
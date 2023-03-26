import plugins.org.rd.plugin.openai.GenerativeContentServices

def result = [:]
def contentUrl = params.url

def generativeContentServices = new GenerativeContentServices(pluginConfig)

return "the app is not using this yet"
def audioResult = generativeContentServices.generateAudioDownloadUrlForText(text)

if(audioResult) {
    logger.error("audio " + text)

    def inputstream = audioResult.getAudioStream()
    response.setContentType("audio/mpeg")    
    inputstream.transferTo(response.getOutputStream)
}
else {
    logger.error("can't download audio for text: " + text)
    response.setStatus(400)
    return result
}



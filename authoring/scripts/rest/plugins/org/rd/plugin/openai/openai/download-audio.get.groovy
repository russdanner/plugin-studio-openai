import plugins.org.rd.plugin.openai.GenerativeContentServices

def result = [:]
def contentUrl = params.url

def generativeContentServices = new GenerativeContentServices(pluginConfig)

def text = "Trail braking is makes you a safer, better, faster rider.  What is trail braking? Using your mototcycle's rear break? No. Trail braking refers to trailing off the brakes as we progress into and through the corner."
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



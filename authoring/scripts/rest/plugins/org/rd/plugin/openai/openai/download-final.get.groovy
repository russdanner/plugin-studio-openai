import plugins.org.rd.plugin.openai.GenerativeContentServices

def result = [:]
def contentUrl = params.id

def generativeContentServices = new GenerativeContentServices(pluginConfig)

def finalDownloadStream = generativeContentServices.getFinalDownload(id)

if(finalDownloadStream) {
    logger.error("Downloading final " + id)
    response.setContentType("video/mpeg")    
    finalDownloadStream.transferTo(response.getOutputStream)
}
else {
    logger.error("can't download audio for text: " + text)
    response.setStatus(400)
    return result
}



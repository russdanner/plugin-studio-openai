import plugins.org.rd.plugin.openai.GenerativeContentServices

def result = [:]
def contentUrl = params.url
def mainIdea = params.mainIdea
def content = params.content
def source = params.source

def generativeContentServices = new GenerativeContentServices(pluginConfig)

def text = ""
if("text".equals(source)) {
    text = content
    result.slides = generativeContentServices.generateVideoFromText(text, mainIdea)

}
else if("url".equals(source)) {
    text = content
    result.slides = generativeContentServices.generateVideoFromUrl(text, mainIdea)
}
else {
    return "unsupported source"
}


return result
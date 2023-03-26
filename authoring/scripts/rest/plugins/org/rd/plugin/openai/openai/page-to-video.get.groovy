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
}
else {
    text.content
}

result.slides = generativeContentServices.generateVideoFromText(text, mainIdea)

return result
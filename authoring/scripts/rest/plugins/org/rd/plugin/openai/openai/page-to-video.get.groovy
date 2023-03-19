import plugins.org.rd.plugin.openai.GenerativeContentServices

def result = [:]
def contentUrl = params.url

def generativeContentServices = new GenerativeContentServices(pluginConfig)

def text = "Trail braking is makes you a safer, better, faster rider.  What is trail braking? Using your mototcycle's rear break? No. Trail braking refers to trailing off the brakes as we progress into and through the corner."
result.slides = generativeContentServices.generateVideoFromText(text)
//result.slides = generativeContentServices.generateVideoFromUrl(contentUrl)

return result


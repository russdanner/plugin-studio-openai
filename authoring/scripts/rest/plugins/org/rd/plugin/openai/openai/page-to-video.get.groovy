import plugins.org.rd.plugin.openai.GenerativeContentServices

def result = [:]
def contentUrl = params.url

def generativeContentServices = new GenerativeContentServices(pluginConfig)

def text = "Trail braking makes you a safer, better, faster rider. What is trail braking?! Is it using your mototcycles' rear brake? No. The term trail in trail braking refers to trailing off or gradually releasing the brakes as we progress into and through the corner."
result.slides = generativeContentServices.generateVideoFromText(text)
//result.slides = generativeContentServices.generateVideoFromUrl(contentUrl)

return result


import plugins.org.rd.plugin.openai.GenerativeContentServices

import org.apache.commons.io.IOUtils
import groovy.json.JsonSlurper

def result = [:]

def generativeContentServices = new GenerativeContentServices(pluginConfig)

def json = IOUtils.toString(request.getReader())

def slurper = new groovy.json.JsonSlurper()
def slides = slurper.parseText(json)

result.id = generativeContentServices.prepareMovie(slides)

return result

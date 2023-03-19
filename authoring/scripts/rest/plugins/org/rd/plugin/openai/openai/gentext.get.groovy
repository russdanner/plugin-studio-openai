import plugins.org.rd.plugin.openai.AiServices

def ask = params.ask

def prompt = "$ask"
def mode = params.mode ? params.mode : "complete"

def aiServices = new AiServices(pluginConfig)

if("image".equals(mode)) {
   return aiServices.doImageGeneration(prompt)
}
else {
   return aiServices.doCompletion(prompt)
}
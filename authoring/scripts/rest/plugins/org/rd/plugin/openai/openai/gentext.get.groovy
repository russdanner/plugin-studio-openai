@Grab(group='com.theokanning.openai-gpt3-java', module='client', version='0.11.0', initClass=false)

import com.theokanning.openai.OpenAiService
import com.theokanning.openai.completion.CompletionRequest
import com.theokanning.openai.image.CreateImageRequest

def ask = params.ask

def prompt = "$ask"
def mode = params.mode ? params.mode : "complete"

def token = pluginConfig.getString("token")
def userId = pluginConfig.getString("userId")

OpenAiService service = new OpenAiService(token)

if("image".equals(mode)) {
        return doImageGeneration(prompt, service)
}
else {
        return doCompletion(prompt, service, userId)
}


/**
 * perform text completion
 */
def doImageGeneration(ask, service) {
        CreateImageRequest request = CreateImageRequest.builder()
                .prompt(ask)
                .build();

        def images = []
        def generatedImages = service.createImage(request).getData()
        
        generatedImages.each { image ->
                images.add(image.getUrl())
        }

        return images
}

/**
 * perform text completion
 */
def doCompletion(ask, service, userId) {
        CompletionRequest completionRequest = CompletionRequest.builder()
                .model("text-davinci-003")
                .prompt(ask)
                .echo(false)
                .user(userId)
                .maxTokens(350)
                .build()

        def choices = service.createCompletion(completionRequest).getChoices()

        def generatedContent = []

        choices.each { choice -> 
                // All of the answers come as one string (bug in API?)
                def answers = choice.text.split("\n")

                answers.each { answer ->
                        if(answer && answer != "") {
                                // remove number label from each answer
                                def cleanedAnswer = answer.substring(answer.indexOf(". ")+1)
                                
                                // Clean quotes off string (may be better way long term to parse answers)
                                cleanedAnswer = cleanedAnswer.substring(1,cleanedAnswer.length-1)

                                generatedContent.add(cleanedAnswer)
                        }
                }
        }

        return generatedContent        
}

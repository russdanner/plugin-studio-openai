@Grab(group='com.theokanning.openai-gpt3-java', module='client', version='0.11.0', initClass=false)

import com.theokanning.openai.OpenAiService
import com.theokanning.openai.completion.CompletionRequest

def ask = params.ask

def prompt = "$ask"
def token = pluginConfig.getString("token")
def userId = pluginConfig.getString("userId")

OpenAiService service = new OpenAiService(token)

CompletionRequest completionRequest = CompletionRequest.builder()
        .model("text-davinci-003")
        .prompt(prompt)
        .echo(false)
        .user(userId)
        .maxTokens(350)
        .build()

def choices = service.createCompletion(completionRequest).getChoices()

def generatedContent = []

choices.each { choice -> 
        def answers = choice.text.split("\n")

        answers.each { answer ->
                if(answer && answer != "") {
                        def cleanedAnswer = answer.substring(answer.indexOf(". ")+1)
                        generatedContent.add(cleanedAnswer)
                }
        }
}

return generatedContent
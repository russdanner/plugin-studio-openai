@Grab(group='com.theokanning.openai-gpt3-java', module='client', version='0.8.1')

import com.theokanning.openai.OpenAiService
import com.theokanning.openai.completion.CompletionRequest

def fieldName = params.fieldName
def subject = params.subject

def prompt = "write me a $fieldName about $subject"


String token = "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"

OpenAiService service = new OpenAiService(token)

CompletionRequest completionRequest = CompletionRequest.builder()
        .model("text-davinci-003")
        .prompt(prompt)
        .echo(false)
        .user("russ.danner@craftercms.com")
        .maxTokens(100)
        .build()
                
return service.createCompletion(completionRequest).getChoices()
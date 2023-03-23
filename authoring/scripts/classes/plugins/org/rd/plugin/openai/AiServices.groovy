package plugins.org.rd.plugin.openai

@Grab(group='com.theokanning.openai-gpt3-java', module='client', version='0.11.0', initClass=false)
@Grab(group='com.amazonaws', module='aws-java-sdk-polly', version='1.12.425', initClass=false)

import org.slf4j.Logger
import org.slf4j.LoggerFactory

import com.theokanning.openai.OpenAiService
import com.theokanning.openai.completion.CompletionRequest
import com.theokanning.openai.image.CreateImageRequest

import com.amazonaws.services.polly.AmazonPolly
import com.amazonaws.services.polly.AmazonPollyClientBuilder
import com.amazonaws.services.polly.model.OutputFormat
import com.amazonaws.services.polly.model.SynthesizeSpeechRequest
import com.amazonaws.services.polly.model.SynthesizeSpeechResult
import com.amazonaws.services.polly.model.VoiceId

import com.amazonaws.auth.BasicAWSCredentials
import com.amazonaws.auth.AWSStaticCredentialsProvider
import com.amazonaws.auth.AWSCredentialsProvider


/** 
 * OpenAI text services
 * DAL-E image image services
 * AWS Polly Voice Services
 */
class AiServices {

  private static final Logger logger = LoggerFactory.getLogger(AiServices.class)

  def openAiToken
  def openAiUserId

  def awsApiKey
  def awsApiSecret
  def awsRegion 

  def openAiService
  def awsPollyclient 

  /**
   * config constructor
   */
  def AiServices(pluginConfig) {
    openAiToken = pluginConfig.getString("openAiToken")
    openAiUserId = pluginConfig.getString("openAiUserId")

    awsApiKey = pluginConfig.getString("awsApiKey")
    awsApiSecret = pluginConfig.getString("awsApiSecret")
    awsRegion = pluginConfig.getString("awsApiRegion")

    openAiService = new OpenAiService(openAiToken)

    def credProvider = (AWSCredentialsProvider)(new AWSStaticCredentialsProvider(new BasicAWSCredentials(awsApiKey, awsApiSecret)))

    def clientBuilder = AmazonPollyClientBuilder.standard()
        clientBuilder.setCredentials(credProvider)
        clientBuilder.setRegion(awsRegion)

    awsPollyclient = clientBuilder.build()
  }

 /**
  * perform text completion
  */
  def doImageGeneration(ask) {
    CreateImageRequest request = CreateImageRequest.builder()
      .prompt(ask)
      .build();

    def images = []
    def generatedImages = openAiService.createImage(request).getData()

    generatedImages.each { image ->
      images.add(image.getUrl())
    }

    return images
  }

  def doDistillation(ask) {
    return doCompletion("distill the following to a single word or phase: "+ask)[0]
  }

 /**
  * perform text completion
  */
  def doCompletion(ask) {
      def generatedContent = []

    try {
      CompletionRequest completionRequest = CompletionRequest.builder()
        .model("text-davinci-003")
        .prompt(ask)
        .echo(false)
        .user(openAiUserId)
        .maxTokens(350)
        .build()

      def choices = openAiService.createCompletion(completionRequest).getChoices()

      choices.each { choice -> 
        // All of the answers come as one string (bug in API?)
        def answers = choice.text.split("\n")

        answers.each { answer ->
          if(answer && answer != "") {
            // remove number label from each answer
            def cleanedAnswer = answer.substring(answer.indexOf(". ")+1)
            
            // Clean quotes off string (may be better way long term to parse answers)
            //cleanedAnswer = cleanedAnswer.substring(1,cleanedAnswer.length)

            generatedContent.add(cleanedAnswer)
          }
        }
      }

    }
    catch(err) {
      generatedContent = ["oops"]
    }

    return generatedContent
  }

  /**
   * peform text to speech operation
   */
  def doTextToSpeech(text) {
    def synthesizeSpeechRequest = new SynthesizeSpeechRequest()
          .withOutputFormat(OutputFormat.Mp3) //.Ogg_vorbis)
          .withVoiceId(VoiceId.Brian)
          .withText(text)
          .withEngine("neural")

    def synthesizeSpeechResult = awsPollyclient.synthesizeSpeech(synthesizeSpeechRequest)

    return synthesizeSpeechResult
  }

}

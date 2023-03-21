import plugins.org.rd.plugin.openai.GenerativeContentServices

def result = [:]
def contentUrl = params.url

def generativeContentServices = new GenerativeContentServices(pluginConfig)

//def mainIdea = "Motorcycle Braking"
//def text = "Trail braking makes you a safer, better, faster rider. What is trail braking?! Is it using your mototcycles' rear brake? No. The term trail in trail braking refers to trailing off or gradually releasing the brakes as we progress into and through the corner."

//def mainIdea = "Headless Content Management"
//def text = "Headless CMSs were built for developers, and have unleashed higher levels of developer productivity. However, they leave the content authoring teams with a limited UX. Overall enterprise productivity hasn't gotten any better. CrafterCMS fixes this. Finally, a 'headless plus' composable CMS that empowers your entire team of content authors, software developers, and DevOps to innovate faster and collaborate better. Developers get an open source, API-first platform to build all types of sites and apps using any front-end or server-side technology, while content authors get an easy to use visual editing and drag/drop composable experience. All built around a Git-based content repository that raises enterprise productivity through unique DevContentOps® processes. For composing fast, secure and scalable content-centric digital experiences."

def mainIdea = "Motorcycle Cornering"
def text="Hey, don’t forget to pick up your paycheck! (more on that in a moment….)  As we do more mid-winter virtual laps around our favorite tracks, today let’s take a look at New Jersey Motorsports Park (NJMP) Thunderbolt and STOP at Turns 4 and 5, and the small straight that connects them together.  All too often I see this scenario: A rider’s doing everything right: Awesome turn-in, nailing the apex and then, suddenly, a “what do I do now?” moment seems to happen. Now, the rider is in limbo.  Turn 5 comes up quickly after T4 and, in order to be well set up for it, the rider must get to the right side of the track for the classic extreme outside-inside-outside approach. BUT, this leaves the rider unable to take advantage of the drive out of T4.  OK, let’s STOP again and think. Would you work hard all week at your job and not pick up your paycheck at the end of the week? Hell no!  Well, let’s think about that same approach to Turns 4 and 5.  Back to that awesome turn-in, then nailing the apex for T4. If done as described, you’ve already put in the hard work, now it’s time to get paid. Drive off that apex, open up the exit so you can get back to the center of the tire. Wow! What a great drive and now here come T5 and, crap, I’m on the wrong side of the track to open up the entrance.  Let’s STOP one more time. This is where you weigh two options: 1) Is it more cost effective to take advantage of the drive out of T4, or 2) Sacrifice your drive out and insure that you’re set up to the extreme outside (right side of the track) for T5 turn-in?  Well, because of the way T5 is designed (sharper than 90 degrees and turns back on itself), your drive out of T5 doesn’t start until you are later into the turn, when you can line up the apex and exit. At some point in this corner, you will be following the radius of the corner, so the extreme outside-inside-outside approach won’t open up the radius of the corner. All it will do is open up the entrance and exit with a brief time at apex following radius.     Sooooo, the only benefit of being set up to the extreme outside for T5 turn-in is just to open up the entrance to apex. It will have no direct benefit to your drive out of T5.  That right there tells me the drive out of T4 is the most bang for the buck. Drive out of T4 and work your way back over to the right, without sacrificing the drive, and where you end up is where you end up. On a bigger bike with more power to take advantage of the drive, you may only make it to half-track for T5 turn-in. Smaller bikes (i.e. 390 and smaller class machines) can drive out and still make it all the way back over to the right. Either way, where you end up on your T5 turn-in only costs you pennies compared to the dollars you’re making on the drive out.  And THAT is your payday."

result.slides = generativeContentServices.generateVideoFromText(text, mainIdea)
//result.slides = generativeContentServices.generateVideoFromUrl(contentUrl)

return result


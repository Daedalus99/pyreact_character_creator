I'm starting a new programming project inspired by https://backyard.ai/. I want to build a standalone desktop application that uses React for the frontend and Python for the backend. The application will act as a chat interface for AI character roleplay, and it should eventually work with both locally installed models and mainstream APIs such as Gemini, Grok, ChatGPT/OpenAI-compatible APIs, and other providers. I'll also support image generation for characters, user personas, and chat thumbnails. Ideally for image generation I'll be able to somehow use https://pixai.art/en/generator/image.

For my prototype, I want to connect to my local model through a locally hosted LM Studio server. My current LM Studio setup exposes an OpenAI-compatible endpoint at:

http://localhost:7095/v1/chat/completions

The model I tested with is:

gemma-4-26b-a4b-it

The request format should be OpenAI-style:

{
  "model": "gemma-4-26b-a4b-it",
  "messages": [
    {
      "role": "system",
      "content": "..."
    },
    {
      "role": "user",
      "content": "..."
    }
  ],
  "temperature": 0.8,
  "max_tokens": 500
}
For development, I previously used a Vite dev proxy so the frontend could call /lmstudio/v1/chat/completions instead of hitting localhost:7095 directly, avoiding browser CORS/preflight issues. In this new version, since I am using a Python backend, the React frontend should call my Python backend, and the Python backend should call LM Studio or other model providers.

---

# Here is my current list of requirements for app functionality:

## Omnipresent (every screen)
- On the left persists a sidebar with square icons representing Chats, Characters, User, Image Generation, Settings, etc.
- On the bottom persists a footer displaying a dropdown (drop up?) menu that lets you select what AI you want to use. You can select from LM Studio server, Gemini, Grok, or OpenAI-compatible APIs. 

## Chat Management (Chats Tab)
- This is the default tab that opens when the app first launches.
- The main content area should show a grid of interactable cards representing created chats.
- Clicking a chat card should open that chat.
- Each chat card should have a label, an image/thumbnail, and a menu for editing, deleting, duplicating, or otherwise managing the chat.
- The first grid item in the top left should always be a “New Chat” button with a large plus icon.
- Clicking the "New Chat" or "Edit Chat" buttons should bring you to that chat's creation/settings page.

### Chat Creation/Settings
- In the chat settings you will be able to select a user profile, and one or more characters that will be able to interact.
- There will be configurable options to set the narration's perspective, tense, genre, setting, and tone.
- For each character added to the chat settings, you should be able to assign their relationship to the user and the other characters if applicable.
- Other settings include: Chat title, and chat thumbnail/image.
- Obviously there should be "save" and "cancel" buttons that are self explanatory. 

### Chat Interface
- On the right side of the screen is a scrollable panel containing the user input and all the chat logs.
- On the left side of the screen (if the window is wide enough) is a panel containing a summary of the Character you're chatting with, as well as their profile picture if they have one.
- If the app window is not wide enough to fit both panels, the chat logs will take center stage.
- When typing in the user input box, in addition to the "send" button, pressing Ctrl+Enter should act as a hotkey to send the message.
- Chat messages should support markdown rendering when not editing.
- Individual message (both character and user) should support buttons for editing, deleting, copying to clipboard, and extending.
- When editing a message there should be buttons for "save" and "cancel". Markdown hotkeys such as Ctrl+I or Ctrl+B should also function.
- Character messages should include a button for regenerating from scratch.
- Extending should also work inside the user input box, and extends what's currently typed into the input.
- If the user deleted the most recent character response, a button should temporarily appear to manually request a new character response.
- Generating, regenerating, and extending messages should cause a "generating..." pop up to temporarily appear while it waits.

## Character Management (Characters Tab)
- The main content are should show a grid of cards, similar to the home tab, except these represent created characters.
- The first grid item is also a "New Character" button, similar to the home tab.
- Clicking the "New Character" or "Edit Character" buttons should bring you to that character's creation/settings page.

### Character Creation/Settings
- Creating character personas will use a multi-step character creation process similar to https://secretdesires.ai/
- During creation there should be an navbar on top that let's you easily jump to each creation step. Each step is labelled and displays "X/Y", where X is the current number of valid option groups, and Y is the total number of option groups that require validation.
- Support a randomize-character button for debugging and fast testing.
- The creation will be data-driven, where character creation steps are defined by (configurable in code) option groups rather than being hardcoded.
- It should support direct character fields such as name (textbox input) and age (slider).
- Supports selectable option groups such as artstyle, gender, race, eye color, hair color, hairstyle, body type, breast size, cock size, butt size, personality traits, relationship status, occupation, hobbies, kinks, typical outfit(s), other notable features, and misccellanious lore or fun facts.
- Each selectable option card must have display text, but can also have a thumbnail and/or a text description.
- Some option groups should support custom text entries, so the user can add their own custom options.
- Support min/max selectable rules per option group, so the user can't select too many or too few options in each group.
- Support option selection validation, so the character cannot be completed until all required visible fields are valid.
- Support gender-dependent option visibility. (Hidden option groups should not block validation.)
- Hidden option group values should be cleared or ignored so stale hidden selections do not leak into saved character summaries or prompts.
- Keep art style as a character-creation option, but exclude it from normal text summaries and roleplay prompts. It should be saved exclusively for image generation use.
- Include "back", "next", and "cancel" buttons that let the user navigate through the creation step pages, or return to the main Characters tab without saving.
- Navigation buttons should be anchored to the top of the window rather than the creation step pages, so the user doesn't have to scroll to the top of the screen each time they want to navigate.

## User Profiles Management (User Tab)
- The User Profiles screen is practically identical to the character management screen.
- This tab allows the user to create characters that will represent themselves in chats.

### User Profile Creation/Settings
- Basically the same as character creation, just replacing "Character" with "User Persona" where applicable.

## Image Generation Tab
- In this tab it lets you select a Chat, Character, or User Persona to create an image for.
- Selecting an item brings you to its Image Generation Settings 

### Image Generation Settings.
- Here it shows you a small gallery of all the other images you've already created for the current item.
- It shows the character's/user persona's summary.
- It shows several optional dropdown menus for pose/action, outfit, facial expression, scenery/setting, and other typical detail categories.
- There is also a text input for the user to input a custom image prompt.
- A large "Generate" button at the bottom will combine character summary information, selected image options, and the user's custom text, and send it off to be generated.
- After clicking generate and waiting for it to finish, the new image will be displayed.
- You're then given the option to save the image, make the image the primary portrait shown in the main tabs, regenerate the image using the same prompt, or go back to the prompt settings to try again without saving the image.

## Settings Tab
- API Keys
- LM Studio endpoint configurable
- storage location

---

# Answers to questions ChatGPT asked when given this readme:
1. Are you planning to package with Electron, Tauri, PyWebView, or start as a local web app?
    - Electron
2. Do you want chat history to support branches/alternate regenerations, or only one linear timeline?
    - One linear timeline
3. Will user personas and characters share the same schema, or will user personas hide some character-only fields?
    - I don't intend to have any character-only or user-only fields, but let's use some dummy fields and build it as if we will have differences.
4. Should character creation options be moddable by editing JSON/config files?
    - Maybe... Not sure yet.
5. Do you want streaming responses from LM Studio immediately, or is non-streaming fine for the first prototype?
    - Non-streaming is fine for now.
6. Should images be stored inside the app data folder, or should users choose a media library location?
    - App data folder is fine
7. Is this app intended to support adult roleplay? If yes, enforce adult-only validation in the schema from the start.
    - Yes, we will hardcode the age slider to go 18-100
8. Do you want multi-character chats to produce one combined assistant response, or separate turns per character?
    - One combined response
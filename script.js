/** @format */

import config from "./config.js";
const btn = document.querySelector("#btn");

const codeInput = CodeMirror.fromTextArea(
  document.getElementById("codeInput"),
  {
    mode: "javascript",
    theme: "yonce",
    lineNumbers: true,
    autoCloseTags: true,
  }
);
const debuggedCode = CodeMirror.fromTextArea(
  document.getElementById("debuggedCode"),
  {
    mode: "javascript",
    theme: "yonce",
    lineNumbers: true,
    autoCloseTags: true,
  }
);
codeInput.setSize("100%", "450px");
debuggedCode.setSize("100%", "450px");

btn.addEventListener("click", async (event) => {
  event.preventDefault();

  const apiKey = config.API_KEY;
  const textareaValue = codeInput.getValue();
  const prompt = `You need to debug and fix an error in the following code, and then rewrite the corrected code. Please refer to the code below and provide the corrected version in the provided text area.\n\nCode to debug and fix:\n${textareaValue}\n\n`;

  const response = await axios.post(
    "https://api.openai.com/v1/completions",
    {
      prompt: prompt,
      model: "text-davinci-003",
      temperature: 0,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
      // stop: "\n\n",
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );
  const debugged = response.data.choices[0].text.trim();
  debuggedCode.setValue(debugged);
});

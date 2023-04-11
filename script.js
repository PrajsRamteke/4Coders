/** @format */

import config from "./config.js";
const btn = document.querySelector("#btn");
const modeSelect = document.getElementById("mode");
const copybtn = document.getElementById("copybtn");
const apiKeyInput = document.getElementById("api-key-input");

const codeInput = CodeMirror.fromTextArea(
  document.getElementById("codeInput"),
  {
    mode: "javascript",
    theme: "yonce",
    lineNumbers: true,
    autoCloseTags: true,
    lineWrapping: true,
  }
);
const debuggedCode = CodeMirror.fromTextArea(
  document.getElementById("debuggedCode"),
  {
    mode: "javascript",
    theme: "yonce",
    lineNumbers: true,
    autoCloseTags: true,
    lineWrapping: true,
  }
);
codeInput.setSize("100%", "450px");
debuggedCode.setSize("100%", "450px");

// ----------Get apiKey from local storage-----
// ----html line number 22 remove class hidden----
const savedApiKey = localStorage.getItem("apiKey");
if (savedApiKey) {
  apiKeyInput.value = savedApiKey;
}

// ------------Select mode---------
var mode = modeSelect.value;
modeSelect.addEventListener("change", (event) => {
  mode = event.target.value;
  btn.innerHTML = mode.split(" ")[0];
});

btn.addEventListener("click", async (event) => {
  event.preventDefault();

  // -------input api key get------------
  const apiKey = apiKeyInput.value;
  localStorage.setItem("apiKey", apiKey);
  // -------------------------------

  // const apiKey = config.API_KEY; //comment if input field on
  const textareaValue = codeInput.getValue();
  const prompt = `You need to ${mode} in the following code, and then rewrite the corrected code. Please refer to the code below and provide the corrected version in the provided text area.\n\nCode to ${mode}:\n${textareaValue}\n\n`;

  try {
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
    var debugged = response.data.choices[0].text.trim();
    debuggedCode.setValue(debugged);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      alert("API key is invalid");
    } else {
      alert("API Limit over, API invalid");
      console.error("API Invalid Error:", error);
    }
  }
});

copybtn.addEventListener("click", () => {
  try {
    // Create a temporary textarea element
    const tempTextarea = document.createElement("textarea");
    // Set the value of the temporary element to the debugged code
    tempTextarea.value = debuggedCode.getValue();
    // Add the temporary element to the DOM
    document.body.appendChild(tempTextarea);
    // Select the contents of the temporary element
    tempTextarea.select();
    // Copy the contents of the temporary element
    document.execCommand("copy");
    // Alert the user that the code has been copied
    alert("Code copied to clipboard");
    // Remove the temporary element from the DOM
    document.body.removeChild(tempTextarea);
  } catch (err) {
    console.error("Error copying text: ", err);
  }
});

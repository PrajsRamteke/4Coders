/** @format */

import config from "./config.js";
const btn = document.querySelector("#btn");
const modeSelect = document.getElementById("mode");
const copybtn = document.getElementById("copybtn");
const apiKeyInput = document.getElementById("api-key-input");
const apiInputBox = document.getElementById("apiInputBox");

// -----------temperature----------
// ------its a secrete btn only developer knows-----
const increaseTempBtn = document.querySelector("#increase-temp-btn");
let temperature = 0;
const tempbtn = document
  .querySelector("#temp-btn")
  .addEventListener("click", () => {
    increaseTempBtn.classList.remove("hidden");
  });

increaseTempBtn.addEventListener("click", () => {
  if (temperature < 0.8) {
    temperature += 0.2;
  } else {
    temperature = 0.2;
  }
  console.log("Temperature:", temperature);
  increaseTempBtn.innerHTML = `Temperature ${temperature}`;
});
// -----------temperature----------

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
  apiInputBox.classList.add("hidden"); //if api key found in local storage then add input field
  apiInputBox.classList.remove("pt-4"); //if api key found in local storage then remove input field
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

  // const apiKey = config.API_KEY; //comment if input field on
  const textareaValue = codeInput.getValue();

  const prompt = `You need to ${mode} in the following code, dont write previous code only write new update code "\n\n${textareaValue}\n\n"`;

  try {
    btn.disabled = true;
    btn.innerHTML = "Loading...";
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        prompt: prompt,
        model: "text-davinci-003",
        temperature: temperature,
        max_tokens: 3000,
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

    localStorage.setItem("apiKey", apiKey);
    var debugged = response.data.choices[0].text.trim();
    debuggedCode.setValue(debugged);
    btn.innerHTML = "Done";
    btn.disabled = false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("apiKey"); //when api key expired
      btn.disabled = false;
      window.location.reload();
      alert("Invalid API Key Entered. Please Generate a New OpenAi API Key.");
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

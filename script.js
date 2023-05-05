/** @format */

const btn = document.querySelector("#btn");
const modeSelect = document.getElementById("mode");
const copybtn = document.getElementById("copybtn");
const apiKeyInput = document.getElementById("api-key-input");
const apiInputBox = document.getElementById("apiInputBox");
const speak = document.getElementById("speak");

// -----------temperature----------
// ------its a secrete buttin only developer knows-----
const increaseTempBtn = document.querySelector("#increase-temp-btn");
const tempBox = document.querySelector("#tempBox");
const tempText = document.querySelector("#tempText");
let temperature = 0;
const tempbtn = document
  .querySelector("#temp-btn")
  .addEventListener("click", () => {
    tempBox.classList.toggle("hidden"); //instead of if else used toggle
    setTimeout(() => {
      tempText.classList.add("hidden");
    }, 10000);
  });

increaseTempBtn.addEventListener("click", () => {
  temperature = temperature < 0.8 ? temperature + 0.2 : 0.2;
  console.log("Temperature:", temperature);
  increaseTempBtn.innerHTML = `Temperature ${temperature.toFixed(1)}`; //used toFixed(1) only answer in 1 digit (0.600001 not like this)
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
const codeOutput = CodeMirror.fromTextArea(
  document.getElementById("codeOutput"),
  {
    mode: "javascript",
    theme: "yonce",
    lineNumbers: true,
    autoCloseTags: true,
    lineWrapping: true,
  }
);
codeInput.setSize("100%", "450px");
codeOutput.setSize("100%", "450px");

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
  const textareaValue = codeInput.getValue();

  const prompt = `You need to ${mode} in the following code, dont write previous code only write new update code "\n\n${textareaValue}\n\n"`;

  try {
    btn.disabled = true;
    btn.innerHTML = "Processing . . .";
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: `${prompt}` }],
        n: 1,
        temperature: 0.5,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    localStorage.setItem("apiKey", apiKey);
    var debugged = response.data.choices[0].message.content;
    codeOutput.setValue(debugged);

    speak.classList.remove("hidden");
    document.querySelector("#copybtn").classList.remove("hidden");

    apiInputBox.classList.add("hidden"); //if api valid then hide input box
    btn.innerHTML = "Done";
    btn.disabled = false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("apiKey"); //when api key expired
      btn.disabled = false;
      window.location.reload();
      alert("Invalid API Key Entered. Please Generate a New OpenAi API Key.");
    } else {
      window.location.reload();
      alert("API Limit over, API invalid");
      console.error("API Invalid Error:", error);
    }
  }
});

// ---------Copy Output------------
copybtn.addEventListener("click", () => {
  try {
    const tempTextarea = document.createElement("textarea");
    tempTextarea.value = codeOutput.getValue();
    document.body.appendChild(tempTextarea);
    tempTextarea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextarea);
    copybtn.innerText = "Copied!";
    setTimeout(() => {
      copybtn.innerText = "Copy";
    }, 2000);
  } catch (err) {
    console.error("Error copying text: ", err);
  }
});

// -------------Speak And Stop-----------
let isSpeaking = false;

speak.addEventListener("click", () => {
  if (!isSpeaking) {
    let loud = new SpeechSynthesisUtterance(codeOutput.getValue());
    //tracted the voice
    loud.onend = () => {
      isSpeaking = false;
      speak.innerText = "Read";
      speak.style.backgroundColor = "green";
    };
    speechSynthesis.speak(loud);
    speak.innerText = "Stop";
    speak.style.backgroundColor = "red";
    isSpeaking = true;
  } else {
    speechSynthesis.cancel();
    speak.innerText = "Read";
    isSpeaking = false;
    speak.style.backgroundColor = "green";
  }
});

// ----------------Create File------------
let CreateFile = document
  .getElementById("CreateFile")
  .addEventListener("click", () => {
    var textToSave = codeOutput.getValue();
    var blob = new Blob([textToSave], { type: "text/plain;charset=utf-8" });
    var link = document.createElement("a");
    link.setAttribute("href", window.URL.createObjectURL(blob));
    link.setAttribute("download", "code.txt");
    link.click();
  });

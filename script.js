import config from "./config.js";
const btn = document.querySelector("#btn");
const codeInput = document.querySelector("#codeInput");
const debuggedCode = document.querySelector("#debuggedCode");

btn.addEventListener("click", async (event) => {
  event.preventDefault();

  const apiKey = config.API_KEY;
  const prompt = `Debug the following code:\n${codeInput.value}\n\n`;

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
      stop: "\n\n",
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );
  const debugged = response.data.choices[0].text.trim();
  debuggedCode.innerText = debugged;
});

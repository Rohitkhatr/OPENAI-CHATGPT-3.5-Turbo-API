import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadIntevval;

function loader(element) {
  element.textContent = "";

  loadIntevval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "...") {
      element.textContent = " ";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 10);
}

function generateUniqueId() {
  const timeStamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timeStamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, unipueId) {
  return `
        <div class="wrapper ${isAi && "ai"}">
            <div class="chat">
                <div class="profile">
                    <img 
                        src="${isAi ? bot : user}" 
                        alt="${isAi ? "bot" : "user"}" 
                    />
                </div>
                    <div class = "message" id = ${unipueId}>${value}</div>
            </div>
        </div>
        `;
}

const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  // user's ChatStripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  // bot's ChatStripe
  const unipeId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", unipeId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(unipeId);

  loader(messageDiv);

  // fetch data from server

  const response = await fetch("http://localhost:8000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadIntevval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot;

    console.log(parsedData);
    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = err + "\nSomething went wrong";
    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});

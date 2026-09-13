const messages = document.getElementById("messages") as HTMLDivElement;
const input = document.getElementById("input") as HTMLInputElement;
const sendBtn = document.getElementById("send") as HTMLButtonElement;

const userId: string = "demo-user";

function addMessage(text: string, sender: string): void {
  const div = document.createElement("div");
  div.textContent = `${sender}: ${text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

sendBtn.addEventListener("click", async () => {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "You");
  input.value = "";

  const response = await fetch("https://wmdtwl2n-5001.inc1.devtunnels.ms/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, message: text })
  });

  const data: { reply: string } = await response.json();
  addMessage(data.reply, "AI");
});

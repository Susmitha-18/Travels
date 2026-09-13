"use strict";
const messages = document.getElementById("messages");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const userId = "demo-user";
function addMessage(text, sender) {
    const div = document.createElement("div");
    div.textContent = `${sender}: ${text}`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}
sendBtn.addEventListener("click", async () => {
    const text = input.value.trim();
    if (!text)
        return;
    addMessage(text, "You");
    input.value = "";
    const response = await fetch("http://localhost:5001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message: text })
    });
    const data = await response.json();
    addMessage(data.reply, "AI");
});

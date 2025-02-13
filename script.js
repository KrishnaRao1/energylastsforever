document.getElementById("contact").addEventListener("submit", async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const responseMessage = document.getElementById("responseMessage");

    try {
        let response = await fetch("https://your-backend-url.com/send-email", {
            method: "POST",
            body: formData
        });

        let result = await response.json();
        responseMessage.innerText = result.message;
    } catch (error) {
        responseMessage.innerText = "Error sending message.";
    }
});

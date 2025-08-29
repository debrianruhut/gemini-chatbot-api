document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    // --- Event Listener for Form Submission ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission which reloads the page

        const userMessage = userInput.value.trim();
        if (!userMessage) {
            // Don't send empty messages
            return;
        }

        // 1. Add the user's message to the chat box
        addMessageToChatBox(userMessage, 'user');
        userInput.value = ''; // Clear the input field
        userInput.focus();

        // 2. Show a temporary "Thinking..." bot message
        const thinkingMessageElement = addMessageToChatBox('Thinking...', 'bot', true);

        try {
            // 3. Send the user's message to the backend API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: userMessage
                    }]
                }),
            });

            if (!response.ok) {
                // Handle HTTP errors like 404 or 500
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();

            // 4. Replace "Thinking..." with the AI's actual response
            if (data && data.result) {
                // Render the response as HTML to support formatting like bold
                thinkingMessageElement.innerHTML = marked.parse(data.result); //renderMarkdown(data.result);
            } else {
                // Handle cases where the response is ok but doesn't contain the result
                thinkingMessageElement.textContent = 'Sorry, no response was received from the assistant.';
            }

        } catch (error) {
            console.error('Error fetching chat response:', error);
            // 5. Show an error message if the request fails
            thinkingMessageElement.textContent = 'Failed to get a response from the server. Please try again.';
            thinkingMessageElement.classList.add('error'); // Optional: for styling error messages
        } finally {
            // Clean up the 'thinking' state regardless of success or failure
            thinkingMessageElement.classList.remove('thinking');
            // Scroll to the bottom of the chat box to show the latest message
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    });
    /**
     * Helper function to add a message to the chat box.
     * @param {string} message - The text content of the message.
     * @param {string} sender - The sender, either 'user' or 'bot'.
     * @param {boolean} isThinking - Whether this is a temporary "thinking" message.
     * @returns {HTMLElement} The newly created message element.
     */
    function addMessageToChatBox(message, sender, isThinking = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);

        if (isThinking) {
            messageElement.classList.add('thinking');
        }

        messageElement.textContent = message;
        chatBox.appendChild(messageElement);

        // Scroll to the new message
        chatBox.scrollTop = chatBox.scrollHeight;

        return messageElement;
    }
});


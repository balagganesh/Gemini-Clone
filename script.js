const typingform = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestionlist .suggestion")
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

let userMessage = null;
let isResponseGenerating = false;

const API_KEY = "AIzaSyDpL1NAS6JLaYirUUQ4b5IGVFQOPcTLqPg";
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

const loadlocalStorageData = () =>{
    const savedChats = localStorage.getItem("savedChats");
    const isLigthMode = (localStorage.getItem("themecolor")==="light_mode");
    document.body.classList.toggle("light_mode",isLigthMode);
    toggleThemeButton.innerText = isLigthMode ? "dark_mode" : "light_mode";

    chatList.innerHTML = savedChats || "";
    document.body.classList.toggle("hide-header",savedChats);
    chatList.scrollTo(0,chatList.scrollHeight);

}
loadlocalStorageData();
const createMessageElement = (content,...classes)=>{
    const div = document.createElement("div");
    div.classList.add("message",...classes);
    div.innerHTML = content;
    return div;
}
const showTypingEffect = (text,textElement,incomingMessageDiv) =>{
    const words = text.split(' ');
    let currentWordIndex =0;
    isResponseGenerating = false; 
    const typingInterval = setInterval(()=>{
        textElement.innerText += (currentWordIndex === 0 ? '' : ' ' )+ words[currentWordIndex++];
        incomingMessageDiv.querySelector(".icon").classList.add("hide");

        if(currentWordIndex === words.length){
            clearInterval(typingInterval);
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            localStorage.setItem("savedChats",chatList.innerHTML); 
        }
        chatList.scrollTo(0,chatList.scrollHeight);
    },75)
}
const generateAPIResponse = async (incomingMessageDiv) =>{
    const textElement = incomingMessageDiv.querySelector(".text");
    try{
        const response = await fetch(API_URL,{
            method:"post",
            headers:{
                "content-type":"application/json"
            },
            body:JSON.stringify({
                contents:[{
                    role:"user",
                    parts:[{text:userMessage}]
                }]
            })
        });
        // Assuming 'response' is the result of a fetch request
const data = await response.json();
if(!response.ok) throw new Error(data.error.message);

// Safely access the text and apply the regex replacement
const apiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/\*\*(.*?)\*\*/g, '$1');

// If 'apiResponse' is undefined, handle it appropriately
if (apiResponse) {
    // Uncomment this line if you want to directly set the text to an element
    // textElement.innerText = apiResponse;
    
    // Use the showTypingEffect function to display the text with a typing effect
    showTypingEffect(apiResponse, textElement, incomingMessageDiv);
    
    // Log the final processed text to the console
    console.log(apiResponse);
} else {
    console.error('apiResponse is undefined or could not be processed');
}

    }
    catch(error){
        isResponseGenerating = false;
        textElement.innerText = error.message;
        textElement.classList.add("error");
    }finally{
        incomingMessageDiv.classList.remove("loading");
    }
}

const showLoadingAnimation = () =>{
    const html = `<div class="message-content">
            <img src="./images/gemini.svg" alt="Gemini image" class="avatar">
            <p class="text"></p>
            <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
            </div>
        </div>
        <span onclick = "copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`
        const incomingMessageDiv = createMessageElement(html,"incoming","loading");
        chatList.appendChild(incomingMessageDiv);
        chatList.scrollTo(0,chatList.scrollHeight);

        generateAPIResponse(incomingMessageDiv);
}
const copyMessage = (copyIcon) =>{
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;
    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "Done";
    setTimeout(()=> copyIcon.innerText ="content_copy",1000)
}
const handleOutgoingChat = () =>{
    userMessage = typingform.querySelector(".typing-input").value.trim() || userMessage ;
    if(!userMessage || isResponseGenerating)return;
    isResponseGenerating = true;
    const html = `<div class="message-content">
                <img src="./images/user.jpg" alt="User Image" class="avatar">
                <p class="text"></p>
            </div>`;
        const outgoingMessageDiv = createMessageElement(html,"outgoing");
        outgoingMessageDiv.querySelector(".text").innerText = userMessage;
        chatList.appendChild(outgoingMessageDiv);
        chatList.scrollTo(0,chatList.scrollHeight);
        document.body.classList.add("hide-header");
        typingform.reset();
        setTimeout(showLoadingAnimation,500);
}

suggestions.forEach(suggestion =>{
    suggestion.addEventListener("click",()=>{
        userMessage = suggestion.querySelector(".text").innerText;
        handleOutgoingChat();
    })
})

toggleThemeButton.addEventListener("click",()=>{
    const isLigthMode =document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor",isLigthMode ? "light_mode" : "dark_mode")
    toggleThemeButton.innerText = isLigthMode ? "dark_mode" : "light_mode";
})
deleteChatButton.addEventListener("click",()=>{
    if(confirm("Are you sure you want to delete all messages?")){
        localStorage.removeItem("savedChats");
        loadlocalStorageData();
    }
})
typingform.addEventListener("submit",(e)=>{
    e.preventDefault();
    handleOutgoingChat();
})

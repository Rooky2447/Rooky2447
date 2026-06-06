const MessageBubble = ({ message }) => {
    const isUser = message.role === "user";
    return (
        <div
            className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-up`}
            data-testid={`chat-message-${message.role}`}
        >
            <div
                className={`max-w-[85%] sm:max-w-[75%] border-2 border-qc-ink rounded-2xl p-4 shadow-brutalSm whitespace-pre-wrap leading-relaxed ${
                    isUser
                        ? "bg-qc-blue text-qc-ink rounded-tr-sm"
                        : "bg-white text-qc-ink rounded-tl-sm"
                }`}
            >
                {message.content}
            </div>
        </div>
    );
};

export default MessageBubble;

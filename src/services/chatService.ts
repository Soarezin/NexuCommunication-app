// src/services/chatService.ts
import { io, Socket } from 'socket.io-client';

// O tipo de mensagem que esperamos receber/enviar via Socket.IO
// (Deve ser consistente com o que o backend envia no evento 'newMessage')
interface ChatMessage {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
    receiverClientId: string;
    caseId: string;
    viewed: boolean;
    viewedAt?: string;
    sender: {
        userId: string;
        firstName: string;
        lastName: string;
        email?: string;
    };
    receiverClient: {
        userId: string;
        firstName: string;
        lastName: string;
        email?: string;
    };
    // Adicione outras propriedades que a mensagem possa ter
}

// O tipo de dados para o evento 'sendMessage' que o cliente emite
interface SendMessageData {
    content: string;
    caseId: string;
    receiverClientId: string;
}

// Uma instância do socket para manter a conexão
let socket: Socket | null = null;

// URL base da API do backend (para a conexão WebSocket)
// Adapte para como você acessa suas variáveis de ambiente no frontend (ex: import.meta.env.VITE_API_BASE_URL)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const joinCaseRoom = (caseId: string) => {
    if (socket && socket.connected && caseId) {
        console.log(`[ChatService] Entrando na sala do caso ${caseId}`);
        socket.emit("joinCase", caseId);
    } else {
        console.warn("[ChatService] Não foi possível entrar na sala, socket desconectado ou caseId inválido.");
    }
};


/**
 * Conecta o cliente Socket.IO ao servidor.
 * @param {string} token - O token JWT do usuário autenticado.
 * @param {function(ChatMessage): void} onNewMessage - Callback para quando uma nova mensagem é recebida.
 * @param {function(string): void} onMessageViewed - Callback para quando uma mensagem é marcada como visualizada.
 * @param {function(string): void} onError - Callback para erros de conexão ou mensagem.
 * @param {string} caseId - ID do caso.
 * @returns {Socket} A instância do socket conectado.
 */
export const connectChatSocket = (
    token: string,
    onNewMessage: (message: ChatMessage) => void,
    onMessageViewed: (messageId: string) => void,
    onError: (error: string) => void,
): Socket => {
    // Desconecta o socket existente se houver um antes de criar um novo
    if (socket && socket.connected) {
        console.log('[ChatService] Desconectando socket existente antes de reconectar...');
        socket.disconnect();
    }

    // Inicializa uma nova conexão Socket.IO
    socket = io(API_BASE_URL, {
        auth: {
            token: token // Envia o token JWT para autenticação no WebSocket
        },
        transports: ['websocket'], // Força o uso de WebSockets
    });

    // --- Listeners de Eventos do Socket ---

    // Evento de conexão bem-sucedida
    socket.on('connect', () => {
        console.log('[ChatService] Socket.IO conectado:', socket?.id);;
    });

    // Evento de desconexão
    socket.on('disconnect', (reason: Socket.DisconnectReason) => {
        console.log('[ChatService] Socket.IO desconectado:', reason);
    });

    // Evento de erro de conexão
    socket.on('connect_error', (err: Error) => {
        console.error('[ChatService] Erro de conexão do Socket.IO:', err.message);
        if (onError) onError(err.message);
    });

    // Evento de nova mensagem recebida do servidor
    socket.on('newMessage', (message: ChatMessage) => {
        console.log('[ChatService] Nova mensagem recebida via Socket.IO:', message);
        if (onNewMessage) onNewMessage(message);
    });

    // Evento de confirmação de mensagem visualizada
    socket.on('messageViewed', (messageId: string) => {
        console.log('[ChatService] Confirmação de mensagem visualizada via Socket.IO:', messageId);
        if (onMessageViewed) onMessageViewed(messageId);
    });

    // Evento de erro de mensagem do servidor
    socket.on('messageError', (error: string) => {
        console.error('[ChatService] Erro de mensagem do Socket.IO:', error);
        if (onError) onError(error);
    });

    return socket;
};

/**
 * Envia uma mensagem via Socket.IO.
 * @param {string} content - Conteúdo da mensagem.
 * @param {string} caseId - ID do caso.
 * @param {string} receiverClientId - ID do cliente que receberá a mensagem.
 */
export const sendChatMessage = (content: string, caseId: string, receiverClientId: string) => {
    if (socket && socket.connected) {
        const messageData: SendMessageData = { content, caseId, receiverClientId };
        console.log('[ChatService] Emitindo sendMessage:', messageData);
        socket.emit('sendMessage', messageData);
    } else {
        console.error('[ChatService] Socket.IO não conectado para enviar mensagem.');
        // Opcional: Tratar erro, talvez com um fallback para HTTP ou fila local
    }
};

/**
 * Desconecta o socket.IO.
 */
export const disconnectChatSocket = () => {
    if (socket) {
        console.log('[ChatService] Desconectando socket.IO manualmente.');
        socket.disconnect();
        socket = null;
    }
};

/**
 * Emite um evento para marcar uma mensagem como visualizada via Socket.IO.
 * @param {string} messageId - ID da mensagem a ser marcada.
 */
export const markMessageViewedBySocket = (messageId: string) => {
    if (socket && socket.connected) {
        console.log('[ChatService] Emitindo markMessageViewed para mensagem ID:', messageId);
        socket.emit('markMessageViewed', messageId);
    } else {
        console.error('[ChatService] Socket.IO não conectado para marcar mensagem como visualizada.');
    }
};
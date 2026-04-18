/**
 * REST API functions for chat feature
 */

// ─── Conversations ─────────────────────────────────────────

function createConversation(credentials, conversationData) {
    return fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        },
        body: JSON.stringify(conversationData)
    }).then(response => response.json())
      .catch(err => console.log(err));
}

function listConversations(params, credentials) {
    return fetch(`/api/chat/conversations/${params.userId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        }
    }).then(response => response.json())
      .catch(err => console.log(err));
}

function getMessages(params, credentials) {
    let url = `/api/chat/conversations/${params.conversationId}/messages?limit=${params.limit || 50}`;
    if (params.before) {
        url += `&before=${params.before}`;
    }
    return fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        }
    }).then(response => response.json())
      .catch(err => console.log(err));
}

// ─── Messages ──────────────────────────────────────────────

function sendMessage(credentials, messageData) {
    // For file/image uploads, use FormData
    if (messageData instanceof FormData) {
        return fetch('/api/chat/messages', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${credentials.t}`
            },
            body: messageData
        }).then(response => response.json())
          .catch(err => console.log(err));
    }

    return fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        },
        body: JSON.stringify(messageData)
    }).then(response => response.json())
      .catch(err => console.log(err));
}

function editMessage(params, credentials, content) {
    return fetch(`/api/chat/messages/${params.messageId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        },
        body: JSON.stringify({ content })
    }).then(response => response.json())
      .catch(err => console.log(err));
}

function deleteMessage(params, credentials) {
    return fetch(`/api/chat/messages/${params.messageId}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        }
    }).then(response => response.json())
      .catch(err => console.log(err));
}

function reactToMessage(params, credentials, emoji) {
    return fetch(`/api/chat/messages/${params.messageId}/react`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        },
        body: JSON.stringify({ emoji })
    }).then(response => response.json())
      .catch(err => console.log(err));
}

function markAsRead(params, credentials) {
    return fetch(`/api/chat/messages/read/${params.conversationId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        }
    }).then(response => response.json())
      .catch(err => console.log(err));
}

// ─── Group Management ──────────────────────────────────────

function updateGroup(params, credentials, groupData) {
    return fetch(`/api/chat/conversations/${params.conversationId}/group`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        },
        body: JSON.stringify(groupData)
    }).then(response => response.json())
      .catch(err => console.log(err));
}

function updateParticipants(params, credentials, data) {
    return fetch(`/api/chat/conversations/${params.conversationId}/participants`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${credentials.t}`
        },
        body: JSON.stringify(data)
    }).then(response => response.json())
      .catch(err => console.log(err));
}

export {
    createConversation,
    listConversations,
    getMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    reactToMessage,
    markAsRead,
    updateGroup,
    updateParticipants
};

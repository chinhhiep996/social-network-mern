import express from 'express';

import chatCtrl from '../controllers/chat.controller';
import authCtrl from '../controllers/auth.controller';

const router = express.Router();

// Conversations
router.route('/api/chat/conversations')
    .post(authCtrl.requireSignin, chatCtrl.createConversation);

router.route('/api/chat/conversations/:userId')
    .get(authCtrl.requireSignin, chatCtrl.listConversations);

router.route('/api/chat/conversations/:conversationId/messages')
    .get(authCtrl.requireSignin, chatCtrl.getMessages);

router.route('/api/chat/conversations/:conversationId/group')
    .put(authCtrl.requireSignin, chatCtrl.updateGroup);

router.route('/api/chat/conversations/:conversationId/participants')
    .put(authCtrl.requireSignin, chatCtrl.updateParticipants);

// Messages
router.route('/api/chat/messages')
    .post(authCtrl.requireSignin, chatCtrl.sendMessage);

router.route('/api/chat/messages/read/:conversationId')
    .put(authCtrl.requireSignin, chatCtrl.markAsRead);

router.route('/api/chat/messages/:messageId')
    .put(authCtrl.requireSignin, chatCtrl.editMessage)
    .delete(authCtrl.requireSignin, chatCtrl.deleteMessage);

router.route('/api/chat/messages/:messageId/react')
    .put(authCtrl.requireSignin, chatCtrl.reactToMessage);

router.route('/api/chat/messages/:messageId/media')
    .get(chatCtrl.getMessageMedia);

export default router;

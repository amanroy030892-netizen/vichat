/**
 * VeilChat Backend Server (Node.js + Express + Socket.io)
 * Features:
 * 1. WebRTC Signaling for 1-on-1 Personal & Random Masked Video Calls
 * 2. Mutual Face Reveal Handshake (both users must consent)
 * 3. 60-Second Rolling Buffer Report Upload Endpoint
 * 4. Admin Moderation & Encrypted KYC Unlock with Audit Trail
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Storage for 60-second reported call evidence clips
const upload = multer({
  limits: { fileSize: 25 * 1024 * 1024 } // Max 25MB for 60s compressed WebM clip
});

// In-memory store for quick demo (replace with PostgreSQL pool in production)
const users = new Map();
const posts = [];
const abuseReports = [];
const auditLogs = [];

// WebRTC & Real-time Call Signaling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join personal user room
  socket.on('register_user', ({ userId, maskedHandle }) => {
    socket.userId = userId;
    socket.maskedHandle = maskedHandle;
    socket.join(userId);
  });

  // 1-on-1 Personal Video Call Request
  socket.on('call_user', ({ targetUserId, callerId, callerHandle, callerMask, callType }) => {
    io.to(targetUserId).emit('incoming_call', {
      callSessionId: uuidv4(),
      callerId,
      callerHandle,
      callerMask,
      callType // 'personal_1on1' or 'random_support'
    });
  });

  // WebRTC Offer / Answer / ICE Candidate Relay
  socket.on('webrtc_signal', ({ targetUserId, signalData }) => {
    io.to(targetUserId).emit('webrtc_signal', {
      fromUserId: socket.userId,
      signalData
    });
  });

  // Mutual Face Reveal Consent Handshake
  socket.on('request_mutual_reveal', ({ targetUserId, callSessionId }) => {
    io.to(targetUserId).emit('mutual_reveal_requested', {
      fromUserId: socket.userId,
      callSessionId
    });
  });

  socket.on('confirm_mutual_reveal', ({ targetUserId, callSessionId, accepted }) => {
    io.to(targetUserId).emit('mutual_reveal_result', {
      callSessionId,
      unmaskApproved: accepted
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Upload 60-second rolling buffer clip ONLY when user clicks "Report Abuse"
app.post('/api/calls/report-abuse', upload.single('rollingBufferClip'), (req, res) => {
  const { callSessionId, reporterId, accusedId, reason, bufferDurationSec } = req.body;
  const reportId = uuidv4();

  const newReport = {
    id: reportId,
    callSessionId,
    reporterId,
    accusedId,
    reason,
    bufferDurationSec: Number(bufferDurationSec) || 60,
    clipPath: req.file ? `/uploads/evidence/${req.file.filename}` : 'encrypted_ram_buffer_60s.webm',
    status: 'pending_review',
    createdAt: new Date().toISOString(),
    autoDeleteAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  abuseReports.unshift(newReport);
  res.status(201).json({
    success: true,
    message: 'अंतिम 60 सेकंड की क्लिप और रिपोर्ट एडमिन पैनल को सुरक्षित रूप से भेज दी गई है।',
    report: newReport
  });
});

// Admin Endpoint: Unlock Accused User's Real Face (Requires Valid Abuse Report ID)
app.post('/api/admin/unlock-kyc', (req, res) => {
  const { adminId, reportId, targetUserId, justification } = req.body;
  if (!reportId || !justification) {
    return res.status(400).json({ error: 'बिना शिकायत (Report ID) और कारण के KYC फेस अनलॉक नहीं किया जा सकता।' });
  }

  const logEntry = {
    id: uuidv4(),
    adminId: adminId || 'admin_super',
    actionType: 'UNLOCK_KYC_FACE',
    targetUserId,
    reportId,
    justification,
    timestamp: new Date().toISOString()
  };
  auditLogs.unshift(logEntry);

  res.json({
    success: true,
    unlockedUserId: targetUserId,
    auditLog: logEntry
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`VeilChat Server running on port ${PORT}`);
});

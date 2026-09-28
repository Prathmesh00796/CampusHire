const { Notification, User, Student } = require("../models");
const { sendMail } = require("../services/email.service");

/**
 * GET /api/notifications
 * Get in-app notifications for the logged-in user
 */
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, message: "Marked as read." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for current user
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/notifications/outbox (Admin only)
 * View all system emails dispatched / queued with their HTML content
 */
const getOutbox = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 100,
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/notifications/test-email (Admin only)
 * Test real SMTP delivery to a specific email address
 */
const sendTestEmail = async (req, res) => {
  try {
    const { to = "prathmeshchopade96@gmail.com" } = req.body;

    const subject = `DKTE Placement Portal - Live SMTP Test (${new Date().toLocaleTimeString("en-IN")})`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="background: #1e3a8a; padding: 20px; border-radius: 8px; text-align: center; color: white;">
          <h2 style="margin: 0; font-size: 22px;">DKTE Society's Textile and Engineering Institute</h2>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Training & Placement Cell</p>
        </div>
        <div style="padding: 24px 8px;">
          <h3 style="color: #1e293b;">Live Email Verification</h3>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            This email confirms that your DKTE Placement Portal is successfully configured to deliver live email notifications directly to your inbox.
          </p>
          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 14px 18px; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 4px 0; color: #065f46;"><strong>Status:</strong> Connected and Operational</p>
            <p style="margin: 4px 0; color: #065f46;"><strong>Recipient:</strong> ${to}</p>
            <p style="margin: 4px 0; color: #065f46;"><strong>Dispatched At:</strong> ${new Date().toLocaleString("en-IN")}</p>
          </div>
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; color: #94a3b8; font-size: 12px;">
          DKTE Placement Cell, Ichalkaranji, Maharashtra · Automated Test
        </div>
      </div>
    `;

    const result = await sendMail({ to, subject, html });

    // Also record notification
    const recipientUser = await User.findOne({ where: { email: to } });
    if (recipientUser) {
      await Notification.create({
        userId: recipientUser.id,
        title: "Live SMTP Test Notification",
        message: "A test email was triggered from DKTE Placement Portal administration.",
        type: "INFO",
        emailSubject: subject,
        emailHtml: html,
        emailStatus: result.success ? "SENT" : "FAILED",
      });
    }

    res.json({
      success: result.success,
      message: result.success ? `Test email dispatched to ${to}!` : `SMTP delivery failed: ${result.error}`,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getOutbox,
  sendTestEmail,
};

const nodemailer = require("nodemailer");
const https = require("https");

// Create transporter
let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isGmail = (process.env.SMTP_SERVICE || "gmail").toLowerCase() === "gmail";
    transporter = nodemailer.createTransport({
      service: isGmail ? "gmail" : undefined,
      host: isGmail ? "smtp.gmail.com" : process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    console.log(`📧 Mail transporter configured with account: ${process.env.SMTP_USER}`);
  } else {
    // Development fallback using Ethereal or test transporter
    console.log("ℹ️ No SMTP_USER configured. Using nodemailer test account / logger for development.");
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`📧 Ethereal test mail account ready: ${testAccount.user}`);
    } catch (err) {
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  return transporter;
};

/**
 * Send via Resend REST API if RESEND_API_KEY is present
 */
const sendViaResend = (apiKey, { to, subject, html, text, from }) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      from: from || "DKTE Placement Cell <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ""),
    });

    const req = https.request(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try {
            const data = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ success: true, messageId: data.id, provider: "Resend" });
            } else {
              reject(new Error(data.message || body));
            }
          } catch (e) {
            reject(new Error(body));
          }
        });
      }
    );

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
};

/**
 * Send via Brevo REST API if BREVO_API_KEY is present
 */
const sendViaBrevo = (apiKey, { to, subject, html, fromEmail, fromName }) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      sender: {
        name: fromName || "DKTE Placement Cell",
        email: fromEmail || process.env.SMTP_USER || "placement@dkte.ac.in",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    const req = https.request(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try {
            const data = JSON.parse(body);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ success: true, messageId: data.messageId, provider: "Brevo" });
            } else {
              reject(new Error(data.message || body));
            }
          } catch (e) {
            reject(new Error(body));
          }
        });
      }
    );

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
};

/**
 * Base email sender with multiple provider support and failover
 */
const sendMail = async ({ to, subject, html, text }) => {
  // 1. Check Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await sendViaResend(process.env.RESEND_API_KEY, {
        to,
        subject,
        html,
        text,
        from: process.env.SMTP_FROM,
      });
      console.log(`📧 [Resend] Dispatched email to ${to}: ${subject}`);
      return res;
    } catch (err) {
      console.error("❌ Resend API delivery error:", err.message);
    }
  }

  // 2. Check Brevo API
  if (process.env.BREVO_API_KEY) {
    try {
      const res = await sendViaBrevo(process.env.BREVO_API_KEY, {
        to,
        subject,
        html,
        fromEmail: process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER,
        fromName: "DKTE Placement Cell",
      });
      console.log(`📧 [Brevo] Dispatched email to ${to}: ${subject}`);
      return res;
    } catch (err) {
      console.error("❌ Brevo API delivery error:", err.message);
    }
  }

  // 3. Nodemailer SMTP (Gmail or custom SMTP)
  try {
    const mailer = await getTransporter();
    const fromAddress =
      process.env.SMTP_FROM ||
      `"DKTE Training & Placement Cell" <${process.env.SMTP_USER || "placement@dkte.ac.in"}>`;

    const info = await mailer.sendMail({
      from: fromAddress,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ""),
      html,
    });

    console.log(`\n============================================================`);
    console.log(`📧 EMAIL SENT SUCCESSFULLY!`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Message ID: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`   Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    console.log(`============================================================\n`);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error("❌ Failed to send email via SMTP:", error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Record in-app notification in database for student/admin
 */
const recordNotification = async ({ student, title, message, type, subject, html, emailSuccess }) => {
  try {
    const { Notification, User } = require("../models");
    let targetUserId = student.userId;
    if (!targetUserId && student.email) {
      const u = await User.findOne({ where: { email: student.email } });
      if (u) targetUserId = u.id;
    }

    if (targetUserId) {
      await Notification.create({
        userId: targetUserId,
        title,
        message,
        type: type || "INFO",
        emailSubject: subject,
        emailHtml: html,
        emailStatus: emailSuccess ? "SENT" : "PENDING",
      });
    }
  } catch (err) {
    console.error("Notification record error:", err.message);
  }
};

/**
 * 1. Application Submitted Email
 */
const sendApplicationSubmittedEmail = async (student, job, company) => {
  const subject = `Application Confirmed: ${job.title} at ${company.name} | DKTE Placements`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="background: #1e3a8a; padding: 20px; border-radius: 8px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 22px;">DKTE Society's Textile and Engineering Institute</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Training & Placement Cell</p>
      </div>

      <div style="padding: 24px 8px;">
        <h3 style="color: #1e293b;">Dear ${student.fullName},</h3>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Your application for the position of <strong>${job.title}</strong> at <strong>${company.name}</strong> has been successfully submitted through the DKTE Placement Portal.
        </p>

        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 14px 18px; margin: 20px 0; border-radius: 6px;">
          <p style="margin: 4px 0; color: #334155;"><strong>Student PRN:</strong> ${student.studentCode}</p>
          <p style="margin: 4px 0; color: #334155;"><strong>Department:</strong> ${student.branch}</p>
          <p style="margin: 4px 0; color: #334155;"><strong>Job Role:</strong> ${job.title}</p>
          <p style="margin: 4px 0; color: #334155;"><strong>Company:</strong> ${company.name}</p>
          <p style="margin: 4px 0; color: #334155;"><strong>CTC Package:</strong> ₹${job.package} LPA</p>
          <p style="margin: 4px 0; color: #334155;"><strong>Status:</strong> <span style="background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 12px; font-weight: bold; font-size: 13px;">SUBMITTED</span></p>
        </div>

        <p style="color: #475569; font-size: 14px;">
          You will receive immediate notifications as your application progresses through shortlisting, interviews, and final offers.
        </p>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; color: #94a3b8; font-size: 12px;">
        DKTE Placement Cell, Ichalkaranji, Maharashtra · Automated Notification
      </div>
    </div>
  `;

  const emailResult = await sendMail({ to: student.email, subject, html });

  await recordNotification({
    student,
    title: `Applied: ${job.title} at ${company.name}`,
    message: `Your application for ${job.title} at ${company.name} (₹${job.package} LPA) was received successfully.`,
    type: "INFO",
    subject,
    html,
    emailSuccess: emailResult.success,
  });

  return emailResult;
};

/**
 * 2. Application Status Update Email (Accept / Shortlist / Reject)
 */
const sendApplicationStatusUpdateEmail = async (student, job, company, status, note = "") => {
  const isAccepted = status === "SHORTLISTED" || status === "INTERVIEW" || status === "SELECTED";
  const isRejected = status === "REJECTED";

  const statusTitle = isRejected ? "Application Update" : "Application Shortlisted!";
  const statusColor = isRejected ? "#ef4444" : "#10b981";
  const statusBg = isRejected ? "#fef2f2" : "#f0fdf4";

  const subject = isRejected
    ? `Update regarding your application for ${company.name} | DKTE Placements`
    : `🎉 Congratulations! Shortlisted for ${company.name} (${job.title}) | DKTE Placements`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="background: #1e3a8a; padding: 20px; border-radius: 8px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 22px;">DKTE Society's Textile and Engineering Institute</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Training & Placement Cell</p>
      </div>

      <div style="padding: 24px 8px;">
        <h3 style="color: #1e293b;">Dear ${student.fullName},</h3>

        ${
          isRejected
            ? `<p style="color: #475569; font-size: 15px; line-height: 1.6;">
                Thank you for applying for the role of <strong>${job.title}</strong> at <strong>${company.name}</strong>.
                After thorough review, we regret to inform you that the recruiting team is not moving forward with your application for this specific cycle.
              </p>`
            : `<p style="color: #475569; font-size: 15px; line-height: 1.6;">
                We are pleased to inform you that your application for <strong>${job.title}</strong> at <strong>${company.name}</strong> has been <strong>${status}</strong>!
              </p>`
        }

        <div style="background: ${statusBg}; border-left: 4px solid ${statusColor}; padding: 14px 18px; margin: 20px 0; border-radius: 6px;">
          <p style="margin: 4px 0; color: #334155;"><strong>Student PRN:</strong> ${student.studentCode}</p>
          <p style="margin: 4px 0; color: #334155;"><strong>Department:</strong> ${student.branch}</p>
          <p style="margin: 4px 0; color: #334155;"><strong>Company:</strong> ${company.name}</p>
          <p style="margin: 4px 0; color: #334155;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold; font-size: 14px;">${status}</span></p>
          ${note ? `<p style="margin: 4px 0; color: #334155;"><strong>Note:</strong> ${note}</p>` : ""}
        </div>

        ${
          !isRejected
            ? `<p style="color: #475569; font-size: 14px;">
                Please keep your placement portal active and monitor your notifications for the upcoming interview schedule details.
              </p>`
            : `<p style="color: #475569; font-size: 14px;">
                Do not be discouraged. There are multiple upcoming campus drives on the portal for which you are eligible. Keep preparing!
              </p>`
        }
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; color: #94a3b8; font-size: 12px;">
        DKTE Placement Cell, Ichalkaranji, Maharashtra · Automated Notification
      </div>
    </div>
  `;

  const emailResult = await sendMail({ to: student.email, subject, html });

  await recordNotification({
    student,
    title: isRejected ? `Application Update: ${company.name}` : `🎉 Shortlisted: ${company.name}!`,
    message: isRejected
      ? `Your application for ${job.title} at ${company.name} has concluded.`
      : `Congratulations! You have been shortlisted for ${company.name} (${job.title}). Check interview schedules.`,
    type: isRejected ? "REJECT" : "SUCCESS",
    subject,
    html,
    emailSuccess: emailResult.success,
  });

  return emailResult;
};

/**
 * 3. Interview Scheduled Email
 */
const sendInterviewScheduledEmail = async (student, job, company, interview) => {
  const subject = `Interview Call: ${company.name} - ${interview.roundType} Round | DKTE Placements`;
  const dateFormatted = new Date(interview.scheduledAt).toLocaleString("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="background: #1e3a8a; padding: 20px; border-radius: 8px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 22px;">DKTE Society's Textile and Engineering Institute</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Training & Placement Cell</p>
      </div>

      <div style="padding: 24px 8px;">
        <h3 style="color: #1e293b;">Dear ${student.fullName},</h3>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Your interview for <strong>${job.title}</strong> at <strong>${company.name}</strong> has been scheduled.
        </p>

        <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 14px 18px; margin: 20px 0; border-radius: 6px;">
          <p style="margin: 4px 0; color: #334155;"><strong>Round:</strong> ${interview.roundType} (Round ${interview.roundNumber})</p>
          <p style="margin: 4px 0; color: #334155;"><strong>Date & Time:</strong> ${dateFormatted}</p>
          <p style="margin: 4px 0; color: #334155;"><strong>Interviewer:</strong> ${interview.interviewerName || "Technical Panel"}</p>
          ${
            interview.meetingLink
              ? `<p style="margin: 6px 0;"><a href="${interview.meetingLink}" style="background: #2563eb; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-top: 6px;">Join Interview Meeting</a></p>`
              : `<p style="margin: 4px 0; color: #334155;"><strong>Venue:</strong> DKTE Placement Cell, Central Computing Lab</p>`
          }
        </div>

        <p style="color: #475569; font-size: 14px;">
          Please join 10 minutes prior to the scheduled time in formal college attire with your updated resume.
        </p>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; color: #94a3b8; font-size: 12px;">
        DKTE Placement Cell, Ichalkaranji, Maharashtra · Automated Notification
      </div>
    </div>
  `;

  const emailResult = await sendMail({ to: student.email, subject, html });

  await recordNotification({
    student,
    title: `Interview Call: ${company.name} (${interview.roundType})`,
    message: `Interview scheduled on ${dateFormatted} for ${company.name}.`,
    type: "WARNING",
    subject,
    html,
    emailSuccess: emailResult.success,
  });

  return emailResult;
};

/**
 * 4. Placement Offer Letter Email
 */
const sendPlacementEmail = async (student, job, company, placement) => {
  const subject = `🎉 Congratulations on your Placement at ${company.name}! | DKTE Placements`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #1e3a8a, #047857); padding: 24px; border-radius: 8px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 26px;">🎉 CONGRATULATIONS! 🎉</h1>
        <p style="margin: 6px 0 0 0; font-size: 15px; font-weight: bold;">DKTE Placement Cell Celebrates Your Success</p>
      </div>

      <div style="padding: 24px 8px;">
        <h3 style="color: #1e293b;">Dear ${student.fullName},</h3>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          On behalf of DKTE Society's Textile and Engineering Institute, we are thrilled to congratulate you on securing a placement offer with <strong>${company.name}</strong>!
        </p>

        <div style="background: #f0fdf4; border: 2px dashed #10b981; padding: 18px; margin: 20px 0; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #065f46; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Annual Package (CTC)</p>
          <h2 style="margin: 6px 0; color: #047857; font-size: 32px;">₹${placement.packageLPA} LPA</h2>
          <p style="margin: 0; color: #334155; font-size: 14px;"><strong>Role:</strong> ${job.title}</p>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Company: ${company.name}</p>
        </div>

        <p style="color: #475569; font-size: 14px;">
          Your offer details have been officially recorded in the DKTE Placement Portal. Best wishes for a stellar corporate career ahead!
        </p>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; color: #94a3b8; font-size: 12px;">
        DKTE Placement Cell, Ichalkaranji, Maharashtra · Official Placement Record
      </div>
    </div>
  `;

  const emailResult = await sendMail({ to: student.email, subject, html });

  await recordNotification({
    student,
    title: `🎉 PLACEMENT OFFER: ${company.name} (₹${placement.packageLPA} LPA)`,
    message: `Congratulations! You have secured a placement offer with ${company.name} for ₹${placement.packageLPA} LPA.`,
    type: "OFFER",
    subject,
    html,
    emailSuccess: emailResult.success,
  });

  return emailResult;
};

/**
 * 5. Password Reset OTP / Token Email
 */
const sendPasswordResetEmail = async (user, otp) => {
  const subject = `Your Password Reset OTP: ${otp} | DKTE Placements`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="background: #1e3a8a; padding: 20px; border-radius: 8px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 22px;">DKTE Society's Textile and Engineering Institute</h2>
        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Training & Placement Cell · Password Assistance</p>
      </div>

      <div style="padding: 24px 8px;">
        <h3 style="color: #1e293b;">Dear ${user.name},</h3>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          We received a request to reset the password for your DKTE Placement Portal account. Use the verification code below to set a new password:
        </p>

        <div style="background: #f1f5f9; border: 2px dashed #94a3b8; padding: 18px; margin: 24px 0; border-radius: 8px; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Verification Code (OTP)</p>
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #1e3a8a; font-family: monospace;">${otp}</span>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">Valid for 15 minutes · Do not share this code</p>
        </div>

        <p style="color: #475569; font-size: 14px;">
          If you did not request a password reset, you can safely ignore this email. Your current password will remain unchanged.
        </p>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; color: #94a3b8; font-size: 12px;">
        DKTE Placement Cell, Ichalkaranji, Maharashtra · Automated Security Alert
      </div>
    </div>
  `;

  return await sendMail({ to: user.email, subject, html });
};

module.exports = {
  sendMail,
  sendApplicationSubmittedEmail,
  sendApplicationStatusUpdateEmail,
  sendInterviewScheduledEmail,
  sendPlacementEmail,
  sendPasswordResetEmail,
};

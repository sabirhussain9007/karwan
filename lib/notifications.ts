import nodemailer from 'nodemailer';

export const sendEmailNotification = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Pak Karwan E Bilal" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const notifyStatusChange = async ({
  user,
  application,
  adminEmail,
}: {
  user: { name: string; email: string };
  application: any;
  adminEmail?: string;
}) => {
  const adminEmailAddress = adminEmail || process.env.ADMIN_EMAIL;
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn("Email credentials not configured in .env.local. Skipping email notifications.");
    return;
  }

  const isApproved = application.status === "Approved";
  const actionText = isApproved ? "approved" : "rejected";
  
  // 1. Notify User
  const userSubject = `Your application for ${application.serviceType} has been ${actionText}`;
  let userHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2563eb;">Hello ${user.name},</h2>
      <p style="font-size: 16px; color: #333;">Your application for <strong>${application.serviceType}</strong> has been <strong style="color: ${isApproved ? '#16a34a' : '#dc2626'}">${actionText}</strong>.</p>
  `;
  if (!isApproved && application.rejectionReason) {
    userHtml += `
      <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #991b1b;"><strong>Reason for Rejection:</strong> ${application.rejectionReason}</p>
      </div>
    `;
  }
  userHtml += `
      <p style="font-size: 14px; color: #666; margin-top: 30px;">Thank you for choosing Pak Karwan Travel App.</p>
    </div>
  `;
  
  // Do not await if you want it to happen in the background without blocking, 
  // but for reliability it's okay to await or catch errors
  sendEmailNotification(user.email, userSubject, userHtml).catch(console.error);

  // 2. Notify Admin
  if (adminEmailAddress) {
    const adminSubject = `Application ${actionText.toUpperCase()}: ${user.name} - ${application.serviceType}`;
    let adminHtml = `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color: #333;">Application Status Update</h2>
        <p>The application for <strong>${user.name} (${user.email})</strong> regarding <strong>${application.serviceType}</strong> was marked as <strong style="color: ${isApproved ? '#16a34a' : '#dc2626'}">${actionText}</strong>.</p>
      </div>
    `;
    if (!isApproved && application.rejectionReason) {
      adminHtml += `<p><strong>Rejection Reason:</strong> ${application.rejectionReason}</p>`;
    }
    
    sendEmailNotification(adminEmailAddress, adminSubject, adminHtml).catch(console.error);
  }
};

export const notifyNewBooking = async ({
  user,
  serviceType,
  adminEmail,
}: {
  user: { name: string; email: string };
  serviceType: string;
  adminEmail?: string;
}) => {
  const adminEmailAddress = adminEmail || process.env.ADMIN_EMAIL;
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn("Email credentials not configured in .env.local. Skipping email notifications.");
    return;
  }

  // 1. Notify User
  const userSubject = `Booking Received: ${serviceType}`;
  const userHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2563eb;">Hello ${user.name},</h2>
      <p style="font-size: 16px; color: #333;">We have successfully received your booking/application for <strong>${serviceType}</strong>.</p>
      <p style="font-size: 16px; color: #333;">Our team will review it and get back to you shortly.</p>
      <p style="font-size: 14px; color: #666; margin-top: 30px;">Thank you for choosing Pak Karwan Travel App.</p>
    </div>
  `;
  sendEmailNotification(user.email, userSubject, userHtml).catch(console.error);

  // 2. Notify Admin
  if (adminEmailAddress) {
    const adminSubject = `New Booking/Application: ${user.name} - ${serviceType}`;
    const adminHtml = `
      <div style="font-family: Arial, sans-serif;">
        <h2 style="color: #333;">New Booking/Application Received</h2>
        <p><strong>User:</strong> ${user.name} (${user.email})</p>
        <p><strong>Service:</strong> ${serviceType}</p>
        <p>Please log in to the admin dashboard to review and manage this request.</p>
      </div>
    `;
    sendEmailNotification(adminEmailAddress, adminSubject, adminHtml).catch(console.error);
  }
};

export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn("Email credentials not configured in .env.local. Skipping email notifications.");
    return;
  }

  const subject = "Password Reset Request";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p style="font-size: 16px; color: #333;">We received a request to reset your password for your Pak Karwan Travel App account.</p>
      <p style="font-size: 16px; color: #333;">Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #666;">If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.</p>
      <p style="font-size: 14px; color: #666; margin-top: 30px;">Thank you for choosing Pak Karwan Travel App.</p>
    </div>
  `;

  await sendEmailNotification(email, subject, html);
};

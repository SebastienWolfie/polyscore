import * as nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken'; // You might need: npm install jsonwebtoken @types/jsonwebtoken

// SECRET KEY: Put this in your .env file in production!
const JWT_SECRET = 'njjnernijerijtiojijewpoptjinweubrtweinvpwepomiecpm';

export default defineEventHandler(async (event) => {
    const origin = getHeader(event, 'origin');
    
    // Set headers for ALL requests (including preflight and main request)
    setHeaders(event, {
      "Access-Control-Allow-Origin": origin || "*", 
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    });

    // Handle the OPTIONS probe
    if (event.method === "OPTIONS") {
      setResponseStatus(event, 204); // "No Content" is the standard for OPTIONS
      return "";
    }
  try {
    const body = await readBody(event);
    const { id, email, walletAddress } = body;

    if (!id || !email || !walletAddress) {
      throw createError({ statusCode: 400, message: 'Missing id, email or wallet address' });
    }

    // 1. Generate a secure, time-limited token (expires in 24 hours)
    const token = jwt.sign(
      { id, email, walletAddress, from: 'yellowpro', type: 'email_verification' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 2. Create the Verification Link
    // CHANGE THIS to your real domain in production

    const baseUrl = 'https://morkie.web.app'; 
    // const baseUrl = 'http://localhost:3005'; 
    const verificationLink = `${baseUrl}/verify/${token}/yellowpro`;

    // 3. Configure Transporter
    let transporter = nodemailer.createTransport({
        host: "mail.privateemail.com",
        port: 465,
        secure: true,
        auth: {
            user: 'info@polywhaler.net', // Replace with your actual email
            pass: '$Wolfie@420' // Replace with env variable in prod
        }
    });

    // 4. Send Email
    const mail_configs = {
        from: '"Yellow Security"  <info@polywhaler.net>',
        to: email, 
        subject: 'Verify your Yellow Account',
        html: `
        <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Yellow Identity Verification</title>
</head>

<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;">
<tr>
<td align="center" style="padding:40px 16px;">

<table width="100%" style="max-width:600px;background-color:#ffffff;border-radius:32px;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04);border:1px solid #e5e7eb;">

<tr>
<td style="background: linear-gradient(135deg, #4a473b 0%, #2a2924 50%, #0f0f0f 100%); padding:40px 40px;">
  <div style="font-size:10px;color:#facc15;letter-spacing:3px;text-transform:uppercase;font-weight:800;margin-bottom:12px;">
    Protocol Authorization
  </div>
  <div style="font-size:32px;font-weight:800;color:#ffffff;letter-spacing:-1px;">
    Join the Waitlist.
  </div>
</td>
</tr>

<tr>
<td style="padding:48px 40px 40px 40px;">

  <h2 style="margin:0 0 16px;font-size:22px;color:#111827;font-weight:800;">
    Verify Your Identity
  </h2>

  <p style="margin:0 0 18px;font-size:15px;color:#4b5563;line-height:1.6;">
    Hello ${email || 'Trader'},
  </p>

  <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.6;">
    A request was made to link your email with a Web3 wallet on the <strong>Yellow</strong> trading platform. To finalize your early access registration and secure your spot on the waitlist, please authorize the connection below.
  </p>

  <div style="background-color:#fffbeb;border:2px solid #facc15;border-radius:16px;padding:20px;margin:32px 0;">
    <div style="font-size:11px;color:#92400e;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;font-weight:800;">
      Authorized Wallet Address
    </div>
    <div style="font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-weight:700;color:#111827;word-break:break-all;">
      ${walletAddress}
    </div>
  </div>

  <div style="margin:32px 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom:12px;">
          <div style="display:inline-block;width:12px;height:12px;background-color:#facc15;margin-right:8px;"></div>
          <span style="font-size:14px;color:#374151;">High liquidity & low latency trading</span>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:12px;">
          <div style="display:inline-block;width:12px;height:12px;background-color:#facc15;margin-right:8px;"></div>
          <span style="font-size:14px;color:#374151;">On-chain freedom with off-chain speed</span>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:12px;">
          <div style="display:inline-block;width:12px;height:12px;background-color:#facc15;margin-right:8px;"></div>
          <span style="font-size:14px;color:#374151;">Exclusive early access perks</span>
        </td>
      </tr>
    </table>
  </div>

  <div style="text-align:center;margin-top:40px;">
    <a href="${verificationLink}"
       style="display:inline-block;padding:18px 48px;border-radius:12px;background-color:#facc15;color:#000000;text-decoration:none;font-weight:800;font-size:14px;text-transform:uppercase;letter-spacing:1px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
       Complete Verification
    </a>
    <div style="margin-top:16px;font-size:12px;color:#9ca3af;">
      This secure link expires in 24 hours.
    </div>
  </div>

</td>
</tr>

<tr>
<td style="padding:32px 40px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:left;">
  
  <div style="font-size:11px;color:#6b7280;line-height:1.6;margin-bottom:16px;">
    <strong>Security Alert:</strong> Yellow will never ask for your seed phrase or private keys. If you did not initiate this request, please disregard this email.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="font-size:10px;color:#9ca3af;text-transform:uppercase;font-weight:700;letter-spacing:1px;">
        © 2026 YELLOW NETWORK
      </td>
      <td align="right">
        <a href="https://x.com/yellow" style="text-decoration:none;font-size:12px;color:#111827;font-weight:700;">@yellow</a>
      </td>
    </tr>
  </table>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>

`
    };

    await transporter.sendMail(mail_configs);

    return { success: true, message: 'Verification email sent' };

  } catch (err) {
    console.error("Email Error:", err);
    throw createError({ statusCode: 500, message: err.message });
  }
});
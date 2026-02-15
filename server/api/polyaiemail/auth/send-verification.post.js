import * as nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken'; // You might need: npm install jsonwebtoken @types/jsonwebtoken

// SECRET KEY: Put this in your .env file in production!
const JWT_SECRET = 'uybybygybgyuguvderderssresxxtcdyubbynnlumonbguvrv65r7t';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id, email, walletAddress, username } = body;

    if (!id, !email || !walletAddress) {
      throw createError({ statusCode: 400, message: 'Missing id, email or wallet address' });
    }

    // 1. Generate a secure, time-limited token (expires in 24 hours)
    const token = jwt.sign(
      { id, email, walletAddress, from: 'polyai', type: 'email_verification' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 2. Create the Verification Link
    // CHANGE THIS to your real domain in production

    const baseUrl = 'https://morkie.web.app'; 
    // const baseUrl = 'http://localhost:3005'; 
    const verificationLink = `${baseUrl}/verify/${token}/polyai`;

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
        from: '"PolyAI Security" <info@polywhaler.net>',
        to: email, 
        subject: 'Verify your PolyAI Account',
        html: `
        <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>POLY-AI Wallet Verification</title>
</head>

<body style="margin:0;padding:0;background:#020409;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#e5e7eb;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:48px 16px;">

<table width="100%" style="max-width:680px;background:#060b14;border-radius:18px;border:1px solid rgba(59,130,246,0.15);box-shadow:0 0 80px rgba(37,99,235,0.25);overflow:hidden;">

<!-- Top AI Strip -->
<tr>
<td style="background:#050a12;padding:18px 32px;border-bottom:1px solid rgba(59,130,246,0.15);">
  <div style="font-size:12px;color:#3b82f6;letter-spacing:2px;text-transform:uppercase;font-weight:700;">
    POLY-AI SECURE ACCESS NODE
  </div>
</td>
</tr>

<!-- Brand Block -->
<tr>
<td style="padding:40px 40px 24px 40px;">

  <div style="font-size:34px;font-weight:900;color:white;letter-spacing:1px;">
    POLY-AI
  </div>

  <div style="font-size:12px;color:#64748b;margin-top:6px;letter-spacing:1px;text-transform:uppercase;">
    Autonomous Polymarket Trading Intelligence
  </div>

</td>
</tr>

<!-- Main Content -->
<tr>
<td style="padding:10px 40px 40px 40px;">

  <h2 style="margin:0 0 16px;font-size:20px;color:#ffffff;font-weight:700;">
    Wallet Verification Required
  </h2>

  <p style="margin:0 0 18px;font-size:14px;color:#94a3b8;line-height:1.7;">
    Hello ${username || ''},
  </p>

  <p style="margin:0 0 22px;font-size:14px;color:#94a3b8;line-height:1.7;">
    A wallet connection attempt was made to activate the POLY-AI trading engine.
    To authorize AI deployment and enable secure signal execution, confirm your identity below.
  </p>

  <!-- Wallet Panel -->
  <div style="background:#030712;border:1px solid rgba(59,130,246,0.25);border-radius:14px;padding:18px 20px;margin:26px 0;">

    <div style="font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
      Registered Wallet Address
    </div>

    <div style="font-size:13px;font-weight:600;color:#38bdf8;word-break:break-all;">
      ${walletAddress}
    </div>

  </div>

  <!-- Feature Grid -->
  <div style="margin:28px 0 32px 0;">

    <div style="font-size:13px;color:#cbd5e1;margin-bottom:10px;font-weight:600;">
      Verification enables:
    </div>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:13px;color:#94a3b8;padding:6px 0;">• AI trade automation</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#94a3b8;padding:6px 0;">• Plan tier activation (Standard / Advanced / Pro)</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#94a3b8;padding:6px 0;">• Performance scoring & ranking</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#94a3b8;padding:6px 0;">• Secure on-chain analytics</td>
      </tr>
    </table>

  </div>

  <!-- CTA -->
  <div style="text-align:center;margin-top:36px;">

    <a href="${verificationLink}"
       style="display:inline-block;padding:16px 44px;border-radius:12px;background:#2563eb;color:white;text-decoration:none;font-weight:800;font-size:13px;letter-spacing:1px;box-shadow:0 0 30px rgba(37,99,235,0.6);">
       ACTIVATE POLY-AI
    </a>

    <div style="margin-top:14px;font-size:12px;color:#64748b;">
      Link valid for 24 hours
    </div>

  </div>

</td>
</tr>

<!-- Security Footer -->
<tr>
<td style="padding:28px 40px;background:#020617;border-top:1px solid rgba(59,130,246,0.12);">

  <div style="font-size:11px;color:#64748b;line-height:1.7;">
    Security Notice: POLY-AI will never request your private keys, seed phrase, or transaction approvals via email.
    If you did not initiate this request, you may safely ignore this message.
  </div>

  <div style="margin-top:14px;font-size:10px;color:#334155;">
    © 2026 POLY-AI · Autonomous Market Execution Engine
  </div>

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
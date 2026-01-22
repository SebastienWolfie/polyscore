import * as nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken'; // You might need: npm install jsonwebtoken @types/jsonwebtoken

// SECRET KEY: Put this in your .env file in production!
const JWT_SECRET = 'ghvbjhhbjhbjbyuybubybyytvvtvgvyvbubhubyvtuiuh78g87gyububyubbuyvtvvytvuyvyg78gy';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id, email, walletAddress, username } = body;

    if (!id, !email || !walletAddress) {
      throw createError({ statusCode: 400, message: 'Missing id, email or wallet address' });
    }

    // 1. Generate a secure, time-limited token (expires in 24 hours)
    const token = jwt.sign(
      { id, email, walletAddress, from: 'polyscore', type: 'email_verification' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 2. Create the Verification Link
    // CHANGE THIS to your real domain in production

    // const baseUrl = 'https://morkie.web.app'; 
    const baseUrl = 'http://localhost:3005'; 
    const verificationLink = `${baseUrl}/verify/${token}/polyscore`;

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
        from: '"Polyscore Security" <info@polywhaler.net>',
        to: email, 
        subject: 'Verify your Polyscore Account',
        html: `
        <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Verify Your Wallet — Polyscore</title>
</head>

<body style="margin:0;padding:0;background:#000;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#e5e7eb;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" style="max-width:640px;background:#05070c;border-radius:20px;border:1px solid rgba(255,255,255,0.08);box-shadow:0 0 60px rgba(99,102,241,0.25);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:28px 32px;background:linear-gradient(135deg,#6366f1,#a855f7);">
              <div style="font-size:26px;font-weight:900;letter-spacing:0.4px;color:white;">
                Polyscore
              </div>
              <div style="font-size:13px;color:#e0e7ff;margin-top:4px;">
                Polymarket Whale Intelligence
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="margin:0 0 12px;font-size:22px;color:white;">
                Welcome to Polyscore, ${username} 👋
              </h2>

              <p style="margin:0 0 16px;color:#9ca3af;font-size:14px;line-height:1.6;">
                You’re almost set.
              </p>

              <p style="margin:0 0 16px;color:#9ca3af;font-size:14px;line-height:1.6;">
                To activate your account and unlock full on-chain intelligence, please verify your email and connect your wallet to confirm ownership of the address below.
              </p>

              <p style="margin:0 0 16px;color:#9ca3af;font-size:14px;line-height:1.6;">
                This quick step ensures your Polyscore reflects real DeFi activity and enables accurate whale and trader analysis.
              </p>




              <!-- Wallet Card -->
              <div style="background:#000;border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:14px 16px;margin:18px 0;">
                <div style="font-size:11px;color:#6b7280;margin-bottom:6px;">
                  Wallet Address
                </div>
                <div style="font-size:13px;font-weight:700;color:#818cf8;word-break:break-all;">
                  ${walletAddress}
                </div>
              </div>


              <p style="color:#9ca3af;font-size:13px;">
                Once verified, you’ll gain access to:
              </p>

              <ul style="padding-left:18px;color:#9ca3af;font-size:13px;line-height:1.6;">
                <li>Live whale monitoring</li>
                <li>Private trader scoring</li>
                <li>Insider activity detection</li>
              </ul>


              <!-- CTA -->
              <div style="text-align:center;margin:32px 0 22px;">
                <a href="${verificationLink}"
                   style="display:inline-block;padding:15px 40px;border-radius:14px;background:linear-gradient(90deg,#6366f1,#a855f7);color:white;font-weight:800;text-decoration:none;font-size:14px;box-shadow:0 0 25px rgba(168,85,247,0.6);">
                  👉 Verify Wallet & Activate Polyscore
                </a>
              </div>

              <div style="font-size:12px;color:#6b7280;text-align:center;">
                Link expires in <strong>24 hours</strong>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.06);background:#020308;">
              <div style="font-size:11px;color:#6b7280;line-height:1.6;">
                If you did not create a Polyscore account, ignore this email.  
                We never request private keys or transaction approvals.
              </div>

              <div style="margin-top:12px;font-size:10px;color:#374151;">
                © 2025 Polyscore · Advanced Polymarket Intelligence
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
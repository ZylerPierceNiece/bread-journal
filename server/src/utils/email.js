import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(to, code) {
  const { data, error } = await resend.emails.send({
    from: 'noreply@resend.dev',
    to: [to],
    subject: 'Verify your Bread Journal account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #6B4423; text-align: center;">🍞 Bread Journal</h2>
        <p style="color: #333; text-align: center;">Here is your verification code:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #6B4423;">${code}</span>
        </div>
        <p style="color: #666; text-align: center; font-size: 14px;">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `
  });

  if (error) throw new Error('Failed to send verification email');
  return data;
}

export async function sendPasswordResetEmail(to, code) {
  const { data, error } = await resend.emails.send({
    from: 'noreply@resend.dev',
    to: [to],
    subject: 'Reset your Bread Journal password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #6B4423; text-align: center;">🍞 Bread Journal</h2>
        <p style="color: #333; text-align: center;">You requested a password reset. Here is your code:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #6B4423;">${code}</span>
        </div>
        <p style="color: #666; text-align: center; font-size: 14px;">This code expires in 10 minutes. If you did not request this, ignore this email.</p>
      </div>
    `
  });

  if (error) throw new Error('Failed to send password reset email');
  return data;
}

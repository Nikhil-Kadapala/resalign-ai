import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// CORS headers to allow requests from your frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const getEmailHTML = (name)=>{
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0f172a;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 600px; width: 100%; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%); border-radius: 16px;">
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center;">
                            <div style="width: 64px; height: 64px; margin: 0 auto; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 12px; line-height: 64px;">
                                <span style="font-size: 32px; font-weight: bold; color: #ffffff;">R</span>
                            </div>
                            <h1 style="margin: 16px 0 0; font-size: 24px; font-weight: 700; color: #ffffff;">ResAlign AI</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 40px 30px;">
                            <h2 style="margin: 0 0 16px; font-size: 36px; font-weight: 800; color: #ffffff; text-align: center;">You're on the list! 🎉</h2>
                            <p style="margin: 0 0 24px; font-size: 18px; color: #cbd5e1; text-align: center;">Hi ${name}, welcome to the future of resume analysis.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;"><div style="height: 2px; background: linear-gradient(90deg, transparent 0%, #a855f7 50%, transparent 100%);"></div></td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px;">
                            <p style="margin: 0 0 24px; font-size: 16px; color: #e2e8f0;">Thank you for joining the ResAlign AI waitlist! We're building something special, and you'll be among the first to experience it.</p>
                            <p style="margin: 0 0 32px; font-size: 16px; color: #e2e8f0;">Here's what you can expect when we launch:</p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 0 0 20px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="width: 48px; vertical-align: top; padding-top: 4px;">
                                                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 8px; text-align: center; line-height: 48px;"><span style="font-size: 24px;">🎯</span></div>
                                                </td>
                                                <td style="padding-left: 16px;">
                                                    <h3 style="margin: 0 0 6px; font-size: 18px; font-weight: 700; color: #ffffff;">AI-Powered Resume Analysis</h3>
                                                    <p style="margin: 0; font-size: 14px; color: #cbd5e1;">Instantly understand your strengths and identify skill gaps with advanced machine learning.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 0 20px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="width: 48px; vertical-align: top; padding-top: 4px;">
                                                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); border-radius: 8px; text-align: center; line-height: 48px;"><span style="font-size: 24px;">📊</span></div>
                                                </td>
                                                <td style="padding-left: 16px;">
                                                    <h3 style="margin: 0 0 6px; font-size: 18px; font-weight: 700; color: #ffffff;">Intelligent Job Matching</h3>
                                                    <p style="margin: 0; font-size: 14px; color: #cbd5e1;">Get precise fit scores and know exactly how you stack up against job requirements.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 0 0 20px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="width: 48px; vertical-align: top; padding-top: 4px;">
                                                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); border-radius: 8px; text-align: center; line-height: 48px;"><span style="font-size: 24px;">🚀</span></div>
                                                </td>
                                                <td style="padding-left: 16px;">
                                                    <h3 style="margin: 0 0 6px; font-size: 18px; font-weight: 700; color: #ffffff;">Personalized Action Plans</h3>
                                                    <p style="margin: 0; font-size: 14px; color: #cbd5e1;">Receive tailored learning paths and recommendations to bridge your skill gaps.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 32px;">
                                <tr>
                                    <td>
                                        <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 24px; text-align: center;">
                                            <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #ffffff;">We'll notify you as soon as we launch!</p>
                                            <p style="margin: 0; font-size: 14px; color: #cbd5e1;">In the meantime, follow us on social media for updates and sneak peeks.</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 40px; text-align: center;">
                            <a href="https://github.com/nikhil-kadapala/resalign-ai" style="display: inline-block; margin: 0 12px; width: 40px; height: 40px; border-radius: 8px; line-height: 40px; text-decoration: none;">
                              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect width="48" height="48" fill="white" fill-opacity="0.01"></rect> <path fill-rule="evenodd" clip-rule="evenodd" d="M24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4ZM0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24Z" fill="#000000"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M19.183 45.4715C18.9896 45.2218 18.9896 42.9972 19.183 38.798C17.1112 38.8695 15.8022 38.7257 15.256 38.3666C14.4368 37.8279 13.6166 36.1666 12.8889 34.9958C12.1612 33.825 10.546 33.6399 9.8938 33.3782C9.24158 33.1164 9.07785 32.0495 11.691 32.8564C14.3042 33.6633 14.4316 35.8606 15.256 36.3744C16.0804 36.8882 18.0512 36.6634 18.9446 36.2518C19.8379 35.8402 19.7722 34.3077 19.9315 33.7006C20.1329 33.1339 19.423 33.0082 19.4074 33.0036C18.5353 33.0036 13.9537 32.0072 12.6952 27.5705C11.4368 23.1339 13.0579 20.234 13.9227 18.9874C14.4992 18.1563 14.4482 16.3851 13.7697 13.6736C16.2333 13.3588 18.1344 14.1342 19.4732 16C19.4745 16.0107 21.2283 14.9571 24 14.9571C26.7718 14.9571 27.7551 15.8153 28.514 16C29.2728 16.1847 29.8798 12.734 34.5666 13.6736C33.5881 15.5968 32.7686 18 33.3941 18.9874C34.0195 19.9748 36.4742 23.1146 34.9664 27.5705C33.9611 30.5412 31.9851 32.3522 29.0382 33.0036C28.7002 33.1114 28.5313 33.2854 28.5313 33.5254C28.5313 33.8855 28.9881 33.9248 29.6463 35.6116C30.085 36.7361 30.1167 39.9479 29.7413 45.2469C28.7904 45.489 28.0506 45.6515 27.5219 45.7346C26.5845 45.8819 25.5667 45.9645 24.5666 45.9964C23.5666 46.0283 23.2193 46.0247 21.8368 45.896C20.9151 45.8102 20.0305 45.6687 19.183 45.4715Z" fill="#000000"></path> </g></svg>
                            </a>
                            <a href="https://www.linkedin.com/in/nikhil-kadapala/" style="display: inline-block; margin: 0 12px; width: 40px; height: 40px; border-radius: 8px; line-height: 40px; text-decoration: none;">
                              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#0A66C2" d="M12.225 12.225h-1.778V9.44c0-.664-.012-1.519-.925-1.519-.926 0-1.068.724-1.068 1.47v2.834H6.676V6.498h1.707v.783h.024c.348-.594.996-.95 1.684-.925 1.802 0 2.135 1.185 2.135 2.728l-.001 3.14zM4.67 5.715a1.037 1.037 0 01-1.032-1.031c0-.566.466-1.032 1.032-1.032.566 0 1.031.466 1.032 1.032 0 .566-.466 1.032-1.032 1.032zm.889 6.51h-1.78V6.498h1.78v5.727zM13.11 2H2.885A.88.88 0 002 2.866v10.268a.88.88 0 00.885.866h10.226a.882.882 0 00.889-.866V2.865a.88.88 0 00-.889-.864z"></path></g></svg>
                            </a>
                            <a href="https://x.com/nikhil_kadapala" style="display: inline-block; margin: 0 12px; width: 40px; height: 40px; border-radius: 8px; line-height: 40px; text-decoration: none;">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><g fill="none" fillRule="evenodd" stroke="none" stroke-width="1" transform="translate(112 112)"><path fill="#000" d="M711.111 800H88.89C39.8 800 0 760.2 0 711.111V88.89C0 39.8 39.8 0 88.889 0H711.11C760.2 0 800 39.8 800 88.889V711.11C800 760.2 760.2 800 711.111 800"/><path fill="#FFF" fillRule="nonzero" d="M628 623H484.942L174 179h143.058zm-126.012-37.651h56.96L300.013 216.65h-56.96z"/><path fill="#FFF" fillRule="nonzero" d="M219.296885 623 379 437.732409 358.114212 410 174 623z"/><path fill="#FFF" fillRule="nonzero" d="M409 348.387347 429.212986 377 603 177 558.330417 177z"/></g></svg>
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px; background-color: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(139, 92, 246, 0.2); text-align: center;">
                            <p style="margin: 0 0 8px; font-size: 12px; color: #94a3b8;">&copy; 2025 ResAlign AI. All rights reserved.</p>
                            <p style="margin: 0; font-size: 11px; color: #64748b;">You received this email because you signed up for the ResAlign AI waitlist.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  try {
    const { name, email } = await req.json();
    if (!name || !email) {
      return new Response(JSON.stringify({
        error: 'Name and email are required'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({
        error: 'Email service not configured'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'ResAlign AI <onboarding@alignai.cv>',
        to: email,
        subject: 'Welcome to the ResAlign AI Waitlist! 🎉',
        html: getEmailHTML(name)
      })
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Resend API error:', data);
      return new Response(JSON.stringify({
        error: 'Failed to send email',
        details: data
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      emailId: data.id
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Internal server error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

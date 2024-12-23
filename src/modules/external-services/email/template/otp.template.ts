export const generateOtpEmailTemplate = (
  firstName: string,
  lastName: string,
  otp: string,
) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content p {
            font-size: 16px;
            margin: 10px 0;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            margin: 20px 0;
            color: #007bff;
        }
        .footer {
            background-color: #f4f4f4;
            padding: 10px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
        .button {
            display: inline-block;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            margin-top: 20px;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verify Your Email</h1>
        </div>
        <div class="content">
            <p>Hi ${firstName} ${lastName},</p>
            <p>Thank you for registering with us!</p>
            <p>Your One-Time Password (OTP) for verification is:</p>
            <div class="otp">${otp}</div>
            <p>Please enter this OTP on the verification page to complete your registration.</p>
            <p>If you did not request this, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 sushant.dev All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
};

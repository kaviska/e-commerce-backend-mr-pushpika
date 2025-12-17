<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification - IY Mart</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }

        .email-container {
            width: 100%;
            max-width: 650px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            font-size: 16px;
            color: #333;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header img {
            width: 120px;
            margin-bottom: 10px;
        }

        .header h1 {
            font-size: 30px;
            font-weight: 600;
            color: #007bff;
            margin: 0;
        }

        .otp-section {
            background-color: #007bff;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }

        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 3px;
        }

        .body-text {
            font-size: 18px;
            color: #555;
            line-height: 1.6;
            text-align: center;
            margin: 20px 0;
        }

        .cta-button {
            display: block;
            width: 100%;
            padding: 15px;
            background-color: #28a745;
            color: white;
            text-align: center;
            border-radius: 8px;
            font-size: 18px;
            text-decoration: none;
            margin-top: 20px;
            transition: background-color 0.3s ease;
        }

        .cta-button:hover {
            background-color: #218838;
        }

        .footer {
            text-align: center;
            font-size: 14px;
            color: #777;
            margin-top: 30px;
        }

        .footer a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="header">
            {{-- <img src="https://iymart.jp/storage/images/assets/web_img/branding/logo.png" alt="IY Mart Logo"> --}}
            <!-- Replace with actual logo URL -->
            <h1>OTP Verification</h1>
        </div>
        <p class="body-text">Hello,</p>
        <p class="body-text">We’ve received a request to verify your account at IY Mart. Please use the following
            One-Time
            Password (OTP) to complete your verification:</p>

        <div class="otp-section">
            <span class="otp-code">{{ $otp }}</span> <!-- Replace with dynamic OTP -->
        </div>

        <p class="body-text">If you did not request this, please ignore this email or contact our support team.</p>

        <a href="https://iymart.jp/" class="cta-button">Contact Support</a>

        <div class="footer">
            <p>If you have any questions, please reach out to us at <a
                    href="mailto:info@iymart.com">infoiymart@gmail.com</a>
            </p>
            <p>&copy; 2025 IY Mart. All rights reserved.</p>
        </div>
    </div>
</body>

</html>

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from project root (3 levels up)
env_path = Path(__file__).resolve().parents[2] / '.env'
load_dotenv(dotenv_path=env_path)

def send_password_reset_email(email: str, reset_token: str):
    """Send password reset email to user"""
    try:        # Email configuration
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        sender_email = os.getenv("SMTP_USER")
        sender_password = os.getenv("SMTP_PASSWORD")
        
        # Create reset link
        reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
        
        # Create message
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = email
        message["Subject"] = "Password Reset Request"
        
        # HTML content
        html = f"""\
        <html>
        <body>
            <p>Hi,</p>
            <p>You requested a password reset. Click the link below to set a new password:</p>
            <p><a href="{reset_link}">Reset Password</a></p>
            <p>This link will expire in 15 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        </body>
        </html>
        """
        
        message.attach(MIMEText(html, "html"))
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, message.as_string())
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_welcome_email(email: str, name: str):
    """Send welcome email to newly registered user"""
    try:
        # Email configuration
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        sender_email = os.getenv("SMTP_USER")
        sender_password = os.getenv("SMTP_PASSWORD")
        
        # Create message
        message = MIMEMultipart()
        message["From"] = sender_email
        message["To"] = email
        message["Subject"] = "Welcome to Service Booking!"
        
        # HTML content
        html = f"""
        <html>
            <body>
                <h2>Welcome to Service Booking, {name}!</h2>
                <p>Thank you for registering with our service. We're excited to have you on board!</p>
                <p>You can now:</p>
                <ul>
                    <li>Browse available services</li>
                    <li>Book appointments</li>
                    <li>Manage your bookings</li>
                </ul>
                <p>If you have any questions, feel free to contact our support team.</p>
            </body>
        </html>
        """
        
        message.attach(MIMEText(html, "html"))
        
        # Create SMTP session and send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(message)
            
    except Exception as e:
        print(f"Failed to send welcome email: {str(e)}")
        # Don't raise the exception as this is a background task
        # and we don't want to block the registration process
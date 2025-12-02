import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import path from 'path'
import fs from 'fs'

let prisma: any = null

// Lazy load Prisma to avoid initialization issues
async function getPrisma() {
  if (!prisma) {
    const { PrismaClient } = await import('@prisma/client')
    prisma = new PrismaClient()
  }
  return prisma
}

// Email configuration from environment variables
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
}

export async function GET() {
  try {
    const prismaClient = await getPrisma()
    const submissions = await prismaClient.universityKitSubmission.findMany({
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(submissions, { status: 200 })
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, email } = body

    // Validate input
    if (!firstName || !email) {
      return NextResponse.json(
        { error: 'First name and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Get Prisma client and save to database
    const prismaClient = await getPrisma()
    console.log('Saving to database:', { firstName, email })
    
    await prismaClient.universityKitSubmission.create({
      data: {
        first_name: firstName,
        email: email,
      }
    })
    
    console.log('Database save successful')

    // Create transporter
    const transporter = nodemailer.createTransport(SMTP_CONFIG)

    // Verify connection
    await transporter.verify()

    // Path to the PDF file
    const pdfPath = path.join(process.cwd(), 'public', 'University_success_kit.pdf')

    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      console.error('PDF file not found at:', pdfPath)
      return NextResponse.json(
        { error: 'Resource file not found. Please contact support.' },
        { status: 500 }
      )
    }

    // Email content
    const mailOptions = {
      from: {
        name: process.env.SMTP_DISPLAY_NAME || 'UAPP',
        address: process.env.SMTP_USER || 'noreply@uapp.uk'
      },
      to: email,
      subject: 'Your University Success Kit is Here! 🎓',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #045B5C 0%, #034647 100%);
              color: #ffffff;
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .content {
              padding: 30px 20px;
            }
            .content h2 {
              color: #045B5C;
              font-size: 20px;
              margin-top: 0;
            }
            .content p {
              margin: 15px 0;
            }
            .highlight-box {
              background: #f8fafc;
              border-left: 4px solid #EF623C;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .cta-button {
              display: inline-block;
              background: #EF623C;
              color: #ffffff;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              background: #f8fafc;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .attachment-icon {
              font-size: 24px;
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Welcome to UAPP!</h1>
            </div>
            
            <div class="content">
              <h2>Hi ${firstName}! 👋</h2>
              
              <p>Thank you so much for requesting your <strong>University Success Kit</strong>! We're thrilled to support you on your journey to higher education.</p>
              
              <div class="highlight-box">
                <strong>What's Inside Your Success Kit:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Complete university application guide</li>
                  <li>Comprehensive scholarship database</li>
                  <li>Expert tips from successful students</li>
                  <li>Step-by-step admission process roadmap</li>
                </ul>
              </div>
              
              <p>We believe this kit will provide you with valuable insights and resources to help you achieve your academic goals.</p>
              
              <p><strong>Need more help?</strong> Visit our website for additional resources, blog articles, and expert guidance:</p>
              
              <div style="text-align: center;">
                <a href="https://uapp.uk/course" class="cta-button">Explore Our Courses</a>
              </div>
              
              <p>If you have any questions or need personalized guidance, don't hesitate to reach out to our team.</p>
              
              <p>Best wishes on your university journey!</p>
              
              <p style="margin-top: 30px;">
                <strong>The UAPP Team</strong><br>
                <em>Empowering Your Education Journey</em>
              </p>
            </div>
            
            <div class="footer">
              <p>This email was sent by UAPP because you requested the University Success Kit.</p>
              <p>© ${new Date().getFullYear()} UAPP. All rights reserved.</p>
              <p style="margin-top: 10px;">
                <a href="https://uapp.uk" style="color: #045B5C; text-decoration: none;">Visit our website</a> | 
                <a href="https://uapp.uk/contact" style="color: #045B5C; text-decoration: none;">Contact us</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hi ${firstName}!

Thank you so much for requesting your University Success Kit! We're thrilled to support you on your journey to higher education.

Your University Success Kit PDF is attached to this email.

What's Inside Your Success Kit:
- Complete university application guide
- Comprehensive scholarship database
- Expert tips from successful students
- Step-by-step admission process roadmap

We believe this kit will provide you with valuable insights and resources to help you achieve your academic goals.

Need more help? Visit our website at https://uapp.uk/blog for additional resources, blog articles, and expert guidance.

If you have any questions or need personalized guidance, don't hesitate to reach out to our team.

Best wishes on your university journey!

The UAPP Team
Empowering Your Education Journey

---
This email was sent by UAPP because you requested the University Success Kit.
© ${new Date().getFullYear()} UAPP. All rights reserved.
      `,
      attachments: [
        {
          filename: 'University-Success-Kit.pdf',
          path: pdfPath,
          contentType: 'application/pdf'
        }
      ]
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      { 
        success: true,
        message: 'Email sent successfully' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send email. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

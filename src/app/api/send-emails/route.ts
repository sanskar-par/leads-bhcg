import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { 
      leadIds, 
      emailTemplate,
      smtpConfig
    } = await request.json();

    // Validate inputs
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'No leads selected' },
        { status: 400 }
      );
    }

    if (!smtpConfig || !smtpConfig.email || !smtpConfig.password) {
      return NextResponse.json(
        { error: 'SMTP configuration is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch leads
    const { data: leads, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .in('id', leadIds);

    if (fetchError || !leads) {
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: smtpConfig.smtpServer || 'smtp.gmail.com',
      port: smtpConfig.smtpPort || 587,
      secure: false,
      auth: {
        user: smtpConfig.email,
        pass: smtpConfig.password,
      },
    });

    const results = {
      successful: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    // Send emails
    for (const lead of leads) {
      try {
        // Replace template variables
        let emailBody = emailTemplate.body
          .replace(/\{name\}/g, lead.name)
          .replace(/\{company\}/g, lead.latest_company)
          .replace(/\{roleType\}/g, lead.role_type)
          .replace(/\{industry\}/g, lead.industry);

        let emailSubject = emailTemplate.subject
          .replace(/\{name\}/g, lead.name)
          .replace(/\{company\}/g, lead.latest_company)
          .replace(/\{roleType\}/g, lead.role_type)
          .replace(/\{industry\}/g, lead.industry);

        await transporter.sendMail({
          from: `"${smtpConfig.displayName || 'BITS Hyderabad Consulting Group'}" <${smtpConfig.email}>`,
          to: lead.email,
          subject: emailSubject,
          html: emailBody,
        });

        // Update lead status to mailed
        const { data: updateData, error: updateError } = await supabase
          .from('leads')
          .update({
            status: 'mailed',
          })
          .eq('id', lead.id)
          .select();

        if (updateError) {
          console.error(`Failed to update status for lead ${lead.id}:`, updateError);
        } else {
          console.log(`Successfully updated status for lead ${lead.id}:`, updateData);
        }

        results.successful.push(lead.id);

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        console.error(`Failed to send email to ${lead.email}:`, error);
        
        // Update lead status to failed
        const { error: updateError } = await supabase
          .from('leads')
          .update({
            status: 'failed',
          })
          .eq('id', lead.id);

        if (updateError) {
          console.error(`Failed to update status for lead ${lead.id}:`, updateError);
        }

        results.failed.push({
          id: lead.id,
          error: error.message || 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Successfully sent ${results.successful.length} emails, ${results.failed.length} failed`,
    });
  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send emails' },
      { status: 500 }
    );
  }
}

# Zoho CRM Batch Email Guide

## Use Case
Send 35-50 emails at a time to leads in Zoho CRM, directing them to a landing page. Leads are already in the CRM system.

## Method 1: Using Custom Functions (Recommended for Specific Lead Lists)

### Overview
This method uses Deluge scripting to send emails to specific leads selected from a list view. Perfect for targeted campaigns where you want to hand-pick leads.

### Setup Steps

#### 1. Create the Custom Function
Go to **Setup > Customization > Modules and Fields**

1. Select the module (Leads or Contacts)
2. Click **Links and Buttons**
3. Click **+ New Button**

#### 2. Configure the Button
- **Name**: Give it a descriptive name (e.g., "Send Batch Email")
- **Description**: Optional but recommended
- **Display Location**: Choose **List View Page**
- **Action Type**: Select **Writing Function**

#### 3. Create the Function
- Provide a name for the function
- Add description (optional)
- Copy the code below
- Click **Edit Arguments**
- Add argument: `leadId` with value `Lead Id`

#### 4. The Code Template

```deluge
leadIdsList = input.leadId.toList("|||");
for each leadIdStr in leadIdsList
{
  // Get the lead record
  resp = zoho.crm.getRecordById("Leads", leadIdStr.toLong());

  // Extract email address
  email = ifnull(resp.get("Email"),"");

  // Send the email
  sendmail
  (
    To : email
    From : zoho.adminuserid
    Subject : "{your_email_subject}"
    Message : "{your_email_message_with_landing_page_link}"
  )
}
return "LeadID" + input.leadId;
```

#### 5. Configure Access
- Select which user profiles can see and use this button
- Click **Save**

### How to Use
1. Navigate to the Leads module
2. Use filters or search to find your target leads (35-50 at a time)
3. Select the checkboxes next to desired leads
4. Click your custom button
5. Emails will be sent to all selected leads

**Note**: The code above is for API V2.0 only.

---

## Method 2: Zoho Campaigns (Recommended for Bulk Campaigns)

### Overview
Use Zoho Campaigns for larger batch operations with more control over timing and delivery.

### Setup Steps

#### 1. Create Email Draft
1. Go to **Email Campaigns** section
2. Create your email with landing page link
3. Save as draft

#### 2. Enable Batch Sending
- Select your draft campaign
- Choose **'Send in batches'** option
- Configure:
  - **Number of batches**: How many groups to split into
  - **Interval between batches**: Time delay (hours/days)
  - **Batch size**: Emails per batch (e.g., 35-50)

#### 3. Target Leads
- Use filters to select your lead list
- Or import from CSV/Excel
- Map to CRM records

### Advantages
- Spread campaign over multiple days (better for deliverability)
- Detailed analytics (opens, clicks, bounces)
- Automated follow-up sequences
- Better for recurring campaigns

---

## Method 3: Workflow Automation (For Recurring Batch Sends)

### Overview
Create workflows that automatically send batch emails based on triggers (date, field change, etc.)

### Setup Steps

1. **Go to Setup > Automation > Workflows**
2. **Create New Rule**
3. **Set Trigger**:
   - Date-based (e.g., every Monday)
   - Field change (e.g., Lead Score > threshold)
   - Manual execution
4. **Add Action**: Send Email
5. **Configure email template** with landing page link
6. **Set criteria**: Which leads receive the email
7. **Save and activate**

### Best for:
- Welcome sequences
- Follow-up campaigns
- Re-engagement emails
- Automated drip campaigns

---

## Best Practices for Batch Emails

### Deliverability
1. **Limit batch size to 35-50 emails** to avoid spam filters
2. **Wait 1-2 hours between batches** if sending multiple batches per day
3. **Use consistent "From" address** (admin user is good)
4. **Include clear unsubscribe link** (Zoho adds this automatically)
5. **Monitor bounce rates** and clean your list regularly

### Content Best Practices
1. **Personalize** using merge fields: `${Lead.FirstName}`, `${Lead.LastName}`
2. **Include clear CTA** to landing page
3. **Keep subject lines under 50 characters**
4. **Test** by sending to yourself first
5. **Track performance**: open rates, click-through rates to landing page

### Landing Page Integration
1. **Use UTM parameters** in your landing page link to track source:
   ```
   https://yoursite.com/landing?utm_source=zoho_crm&utm_medium=email&utm_campaign=batch_send
   ```
2. **Set up goals** in Google Analytics to track conversions
3. **Consider using Zoho Landing Pages** for easy CRM integration

---

## Quick Reference: Which Method to Use?

| Scenario | Best Method | Why |
|----------|-------------|-----|
| Hand-picked leads (35-50) | Custom Function Button | Fast, targeted, manual control |
| Recurring campaign (100+ leads) | Zoho Campaigns | Analytics, scheduling, automation |
| Welcome/drip sequences | Workflow Automation | Trigger-based, hands-off |
| One-time large send | Zoho Campaigns (batch) | Spread delivery, better deliverability |
| Quick test send | Custom Function | No setup needed for existing list |

---

## Troubleshooting

### Common Issues

**Issue**: Emails not sending
- **Solution**: Check email limits in Zoho CRM account. Verify admin user email is configured.

**Issue**: Batch send too slow
- **Solution**: Reduce interval between batches, but stay above 30 minutes for best deliverability.

**Issue**: High bounce rate
- **Solution**: Validate email addresses before sending. Remove bounced leads from list.

**Issue**: Emails going to spam
- **Solution**: Check content quality, ensure proper DNS settings (SPF, DKIM), reduce sending frequency.

---

## Additional Resources

- **Zoho CRM Help**: https://help.zoho.com/portal/en/kb/crm/connect-with-customers/email
- **Zoho Campaigns Batch Guide**: https://zenatta.com/how-to-use-batching-for-bulk-emails-in-zoho-campaigns/
- **Zoho Community**: Forums for additional support and templates

---

*Created for: Client - Heirloom Gun Cases B2B Sales*
*Date: Feb 2, 2026*
*Purpose: Send batch emails to gun shops with landing page link*

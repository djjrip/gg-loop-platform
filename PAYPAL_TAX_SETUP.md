# PayPal Sales Tax Setup Guide

## Critical: Sales Tax Compliance for GG Loop

**DISCLAIMER: This is educational guidance only. GG Loop does not provide automated tax compliance or integration with PayPal's tax features. Businesses must manually configure all tax settings in their PayPal Business Accounts. Merchants are responsible for their own tax compliance.**

Subscription-based businesses are often required to collect sales tax in states where they have **economic nexus** (typically $100,000 in sales OR 200 transactions per year).

---

## Step 1: Research Tax Collection Options in PayPal

**Manual configuration in PayPal Business Accounts is required - GG Loop does not automate this process.**

### Option A: PayPal Tax Settings (Reference Only)

PayPal Business Accounts may include tax-related settings that businesses can research:

1. **PayPal Account Access**
   - Businesses access PayPal accounts at https://www.paypal.com/businessmanage/account/aboutBusiness

2. **Tax Settings Location**
   - Tax settings may be found under Account Settings → Business Information
   - Sales tax or calculation settings are typically located in this area

3. **Available Features**
   - PayPal may offer various tax-related features
   - Applicability depends on specific business models
   - State compliance requirements vary

4. **Considerations**
   - Many businesses research states where they may have nexus
   - Third-party tax engines require independent verification
   - Tax professional consultation is recommended before relying on any automated features

### Option B: Manual Tax Rate Configuration

Manual setup typically involves:

1. Permit registration in states where nexus exists
2. Manual tax rate entry in payment processor settings
3. **Note**: Manual rates require ongoing updates when laws change

---

## Step 2: Subscription Plan Tax Configuration Reference

### Plan Configuration Options (Basic, Pro, Elite)

1. **PayPal Dashboard Access**
   - Plan information is typically found in Products & Services → Subscriptions area
   - Subscription plan details may be accessible through account interfaces

2. **Plan Settings Overview**
   - Plan editing options may be available in account dashboards
   - Tax-related configuration sections exist in some payment processors

3. **Tax Configuration Approaches**
   - Payment processors may offer various tax application settings
   - Automatic and manual tax rate options differ in implementation
   - Business-specific compliance needs determine appropriate approaches

4. **Decision Documentation**
   - Businesses typically maintain records of configuration choices

### Current Subscription Plans:
- **Basic Plan** ($5/month) - Plan ID: Check env var `PAYPAL_BASIC_PLAN_ID`
- **Pro Plan** ($12/month) - Plan ID: Check env var `PAYPAL_PRO_PLAN_ID`
- **Elite Plan** ($25/month) - Plan ID: Check env var `PAYPAL_ELITE_PLAN_ID`

---

## Step 3: Understand Digital Subscription Taxability

### Important: Not All States Tax Digital Subscriptions

Digital memberships/SaaS products are **NOT taxable in all states**. Here's the breakdown:

### States That TAX Digital Subscriptions:
- Arizona, Connecticut, District of Columbia
- Hawaii, Idaho, Kentucky, Louisiana
- Maine, Massachusetts, Minnesota, Mississippi
- New Jersey, New Mexico, New York, North Carolina
- Ohio, Pennsylvania, Rhode Island, South Carolina
- South Dakota, Tennessee, Texas, Utah
- Vermont, Washington, West Virginia, Wisconsin

### States That DO NOT TAX Digital Subscriptions:
- Alabama, Alaska (no sales tax), Arkansas
- California, Colorado, Delaware (no sales tax)
- Florida, Georgia, Illinois, Indiana
- Iowa, Kansas, Maryland, Michigan
- Missouri, Montana (no sales tax), Nebraska
- Nevada, New Hampshire (no sales tax), North Dakota
- Oklahoma, Oregon (no sales tax), Virginia
- Wyoming

### Gray Area States (Depends on Interpretation):
- Some states have unclear rules for "gaming memberships"
- Tax professional consultation is recommended when rules are unclear

---

## Step 4: Understanding Sales Tax Permit Requirements

When businesses reach economic nexus thresholds ($100K or 200 transactions) in a state, typical compliance involves:

1. **Permit Registration Process**
   - State Department of Revenue websites offer permit applications
   - Application fees vary by state ($0-50 typical)
   - Businesses receive sales tax ID numbers upon approval

2. **Return Filing Requirements**
   - Filing frequencies vary (monthly, quarterly, or annually by state and volume)
   - Payment processors typically provide reports of taxes collected

3. **Tax Remittance Process**
   - Businesses remit collected taxes to applicable states
   - Record retention requirements vary (3-7 years by state)

---

## Step 5: Business Growth Monitoring

As businesses grow, monitoring for economic nexus thresholds becomes important:

### Economic Nexus Thresholds (Post-Wayfair 2018):
- **200 transactions per year** in a state, OR
- **$100,000 in sales per year** in a state

### Monitoring Approaches:
1. **Payment Processor Reports**:
   - Payment processors typically provide transaction reports by state
   - Businesses often download and analyze these reports monthly
   - Some businesses establish threshold monitoring systems

2. **Manual Tracking Systems**:
   - Some businesses use spreadsheets (State, Transactions, Revenue columns)
   - Data is typically updated from payment processor reports
   - Running 12-month totals help identify approaching thresholds

3. **When Thresholds Are Approached**:
   - Businesses research permit registration requirements for applicable states
   - Tax collection configuration in payment systems is investigated
   - Compliance deadline tracking becomes relevant

---

## Step 6: Alternative - Third-Party Tax Services (Reference)

When manual tax management doesn't meet business needs, third-party services exist:

### Example: TaxJar ($19-99/month+)

**Claimed Features** (research independently):
- Sales tax calculation services for multiple states
- Product taxability analysis tools
- May provide state registration assistance
- May offer filing and remittance services
- Compliance tracking and reporting

**General Information:**
1. Third-party providers like TaxJar (https://www.taxjar.com) exist for evaluation
2. Integration requirements and costs vary by provider
3. Feature evaluation before subscription is commonly recommended

**Considerations:**
- Monthly subscription costs ($19+ base plan)
- Determine if time savings justify costs
- Research accuracy and reliability before trusting for compliance

---

## Step 7: What Happens If You Don't Collect Tax?

### Financial Consequences:

1. **You pay it out of pocket**
   - State says: "You owe us $X in uncollected tax"
   - You pay from your revenue, reducing profit margins

2. **Example for GG Loop:**
   - 100 Pro subscribers ($12/month) in Texas (taxable at 6.25%)
   - Monthly revenue: $1,200
   - Tax you should collect: $75/month = $900/year
   - **If you don't collect**: You owe $900 + penalties

3. **Penalties & Interest:**
   - Late payment penalties: 5-25% of tax owed
   - Interest: Accumulates monthly
   - Audit penalties: Additional fines if discovered during audit
   - **Total cost**: 1.3-1.5x the original tax amount

4. **Back Taxes:**
   - States can audit 3-4 years of sales
   - You could owe thousands in back taxes + penalties
   - Example: $900/year × 3 years × 1.3 penalty = $3,510

---

## Tax Compliance Reference Topics

Businesses managing subscription tax compliance typically consider:

- Available tax calculation options in payment processor accounts
- Tax configuration approaches for subscription products
- Sales monitoring systems by state (via payment processor reports)
- Nexus threshold awareness (200 transactions OR $100K per state)
- State registration requirements research
- Compliance deadline tracking systems
- Third-party tax service evaluation
- Professional tax consultation for business-specific guidance

---

## Current Status Reference

**Tax research status:**
- [ ] Haven't researched PayPal Business Account tax options yet
- [ ] Researched options but haven't configured yet
- [ ] Configured tax settings and monitoring compliance

**Common Business Practices:**
1. Payment processor tax features are often reviewed during setup
2. Automatic vs manual tax calculation approaches are typically compared
3. Configuration requirements for subscription products vary by processor
4. Sales tracking by state often uses processor reports or spreadsheet systems
5. Transaction data review routines are commonly established for compliance monitoring

---

## Support Resources

- **PayPal Tax Help**: https://www.paypal.com/us/smarthelp/article/how-do-i-set-up-sales-tax-faq3799
- **TaxJar Digital Product Guide**: https://www.taxjar.com/sales-tax/digital-products
- **Avalara State Tax Matrix**: https://www.avalara.com/us/en/learn/guides/sales-tax-on-saas.html
- **Consult a Tax Professional**: Highly recommended before launch

---

## Disclaimer

This guide provides general information about sales tax compliance. Tax laws vary by state and change frequently. Consult with a qualified tax professional or CPA before making decisions about sales tax collection and remittance. GG Loop is not responsible for your tax compliance - you are the merchant of record.

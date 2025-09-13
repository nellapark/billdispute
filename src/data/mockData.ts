import { BillDispute, CallRecord } from '@/types';

const mockCallRecords: CallRecord[] = [
  {
    id: 'call-1',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    duration: 420,
    status: 'completed',
    transcript: `System: Thank you for calling Comcast Customer Service. Your call may be recorded for quality assurance. Please hold while we connect you to the next available representative.

[Hold music for 2 minutes]

Agent: Hello, thank you for calling Comcast. My name is Sarah. How can I assist you today?

Customer: Hi Sarah, I'm calling about my recent bill. I've been charged $89.99 for a premium internet package that I never requested or authorized. This charge appeared on my January bill and I need to dispute it.

Agent: I'm sorry to hear about this billing concern. I'll be happy to help you resolve this issue. Can I please get your account number or the phone number associated with your account?

Customer: Sure, my account number is 8847-2156-9903-4421.

Agent: Thank you. Let me pull up your account... Okay, I can see your account here. I'm looking at your January bill and I do see the charge you're referring to - it's listed as "Premium Internet Plus Package" for $89.99. Let me check when this was added to your account.

Customer: I never requested this upgrade. I've been happy with my basic internet service and specifically declined any upgrades when your sales team called me last month.

Agent: I understand your frustration. Let me investigate this further. I can see here that this service was added to your account on December 28th, 2023. According to our records, this was processed as a phone order. Do you recall speaking with anyone from our sales department around that time?

Customer: Yes, I did receive a call, but I specifically told them I was not interested in any upgrades. I was very clear about that. The representative was quite pushy, but I said no multiple times.

Agent: I apologize for this situation. Let me review the call notes from that interaction... I can see the notes here, and unfortunately, it appears there was a miscommunication. The notes indicate that the upgrade was processed, but based on what you're telling me, this was done in error.

Customer: Exactly. I never agreed to this upgrade. I need this charge removed from my bill and I want to make sure this doesn't happen again.

Agent: Absolutely, I completely understand. I'm going to remove this charge from your account right now. I'm also going to add a note to your account indicating that you do not want any service upgrades without explicit written confirmation.

Customer: Thank you, I appreciate that. Will I see the credit on my next bill?

Agent: Actually, I can process this as an immediate credit to your account. The $89.99 will be credited back today, and you should see it reflected in your account within 24 hours. Is there anything else I can help you with today?

Customer: That's perfect. Thank you so much for resolving this quickly. I really appreciate your help, Sarah.

Agent: You're very welcome! I'm glad I could help resolve this for you. Is there anything else I can assist you with today?

Customer: No, that covers everything. Thank you again.

Agent: Perfect! Thank you for being a Comcast customer, and have a wonderful day!

Customer: You too, goodbye.

Agent: Goodbye!

[Call ended]`,
    outcome: 'resolved',
    notes: 'Successfully disputed the charge. $89.99 credit processed immediately. Account flagged to prevent unauthorized upgrades.'
  },
  {
    id: 'call-2',
    timestamp: new Date('2024-01-14T14:15:00Z'),
    duration: 180,
    status: 'failed',
    transcript: `System: Thank you for calling Comcast Customer Service. We are currently experiencing higher than normal call volumes. Your estimated wait time is 45 minutes. Please stay on the line and a representative will be with you shortly.

[Hold music]

System: Thank you for continuing to hold. Your call is important to us. Your estimated wait time is now 38 minutes.

[Hold music continues]

System: We apologize for the extended wait time. Your estimated wait time is now 32 minutes. If you'd like, you can visit our website at xfinity.com for self-service options or to schedule a callback.

[Hold music continues]

System: Thank you for your patience. Your estimated wait time is now 25 minutes.

[Hold music continues]

System: We appreciate your patience. All of our customer service representatives are still busy helping other customers. Your estimated wait time is now 20 minutes.

[Hold music continues]

[Call disconnected after 3 minutes due to system error]`,
    outcome: 'failed',
    notes: 'Call dropped due to system error during extended hold time. No agent contact achieved.'
  }
];

const mockCallRecords2: CallRecord[] = [
  {
    id: 'call-3',
    timestamp: new Date('2024-01-16T09:00:00Z'),
    duration: 600,
    status: 'completed',
    transcript: `System: Thank you for calling Verizon Wireless. Para español, presiona dos. Your call may be monitored or recorded. Please hold for the next available representative.

[Hold music for 1 minute]

Agent: Good morning, thank you for calling Verizon Wireless. This is Marcus speaking. How can I help you today?

Customer: Hi Marcus, I'm calling about my January bill. I've been charged $45 for data overage, but I have an unlimited data plan. This doesn't make sense to me.

Agent: I understand your concern about the data overage charge. Let me take a look at your account to see what's going on. Can you please provide me with your wireless number or account PIN?

Customer: My wireless number is 555-123-4567.

Agent: Thank you. Let me pull up your account... Okay, I can see your account here. You're right that you have our Unlimited Plan, but I'm also seeing the $45 overage charge you mentioned. Let me dig deeper into this.

Customer: I specifically chose the unlimited plan to avoid overage charges. I've been a Verizon customer for over 8 years and this has never happened before.

Agent: I appreciate your loyalty as a long-time customer. Looking at your plan details, I can see you have our "Unlimited" plan, but this particular plan does have some limitations. After 22GB of usage, your data may be deprioritized during network congestion, and there's also a 10GB limit for mobile hotspot usage.

Customer: Wait, what? Nobody told me about any limits when I signed up for this plan. The sales representative said it was truly unlimited.

Agent: I understand your frustration, and I apologize for any confusion. Let me check your usage details for January... I can see that you used 8.2GB of regular data, which is well within limits, but you used 15GB of mobile hotspot data, which exceeded the 10GB limit by 5GB. That's where the $45 charge comes from - it's $9 per GB for hotspot overage.

Customer: This is ridiculous. I was never told about a hotspot limit. I use my phone's hotspot for work when I'm traveling, and I was assured this wouldn't be a problem with the unlimited plan.

Agent: I completely understand your frustration. Let me see what I can do for you. I'm going to review the sales call from when you signed up for this plan... Unfortunately, I don't have access to those recordings right now, but I can see that you've been a great customer with us for many years.

Customer: I want this charge removed. I was misled about what "unlimited" means, and I never would have agreed to this plan if I knew about these hidden limits.

Agent: I hear you, and I want to make this right. However, the overage charges are technically correct according to your plan terms. But given that you're a long-time customer and there seems to have been some miscommunication about the plan details, I'm going to escalate this to our billing department for review.

Customer: What does that mean exactly? Will the charge be removed?

Agent: The billing department will review your case and the circumstances around your plan signup. They have more authority than I do to make adjustments to your account. They'll look at your account history, usage patterns, and the nature of your complaint.

Customer: How long will this take? And what happens in the meantime?

Agent: The review typically takes 3-5 business days. In the meantime, I'm going to put a temporary credit on your account for the $45, so you won't have to pay it while the review is pending. If the billing department determines the charge should stand, they'll remove the credit. If they agree with your dispute, the credit will remain.

Customer: Okay, that sounds fair. I just want this resolved properly. Can you also make sure I understand exactly what my plan includes going forward?

Agent: Absolutely. I'm sending you a detailed breakdown of your plan features via text message right now. It will clearly show your data allowances, hotspot limits, and any other restrictions. I'm also adding detailed notes to your account about this conversation.

Customer: Thank you, Marcus. I appreciate you working with me on this. What's my reference number for this case?

Agent: Your case reference number is VZ-2024-0116-7892. The billing department will contact you within 5 business days with their decision. Is there anything else I can help you with today?

Customer: No, that covers everything. Thank you for your help.

Agent: You're very welcome. Thank you for being a valued Verizon customer, and have a great day!

[Call ended]`,
    outcome: 'escalated',
    notes: 'Case escalated to billing department for review. Temporary $45 credit applied pending decision. Reference: VZ-2024-0116-7892.'
  }
];

const mockCallRecords3: CallRecord[] = [
  {
    id: 'call-4',
    timestamp: new Date('2024-01-17T11:30:00Z'),
    duration: 0,
    status: 'in-progress',
    transcript: '',
    outcome: 'pending',
    notes: 'Currently attempting to connect...'
  }
];

export const mockBillDisputes: BillDispute[] = [
  {
    id: 'dispute-1',
    title: 'Internet Service Overcharge',
    company: 'Comcast',
    amount: 89.99,
    phoneNumber: '+1-800-COMCAST',
    status: 'resolved',
    createdAt: new Date('2024-01-15T08:00:00Z'),
    updatedAt: new Date('2024-01-15T10:50:00Z'),
    description: 'Charged for premium internet package that was never requested or activated.',
    documentUrl: '/uploads/comcast-bill-jan-2024.pdf',
    calls: mockCallRecords,
    priority: 'high'
  },
  {
    id: 'dispute-2',
    title: 'Mobile Data Overage',
    company: 'Verizon',
    amount: 45.00,
    phoneNumber: '+1-800-VERIZON',
    status: 'escalated',
    createdAt: new Date('2024-01-16T07:30:00Z'),
    updatedAt: new Date('2024-01-16T09:30:00Z'),
    description: 'Unexpected data overage charges despite having unlimited plan.',
    documentUrl: '/uploads/verizon-bill-jan-2024.pdf',
    calls: mockCallRecords2,
    priority: 'medium'
  },
  {
    id: 'dispute-3',
    title: 'Cable TV Premium Channels',
    company: 'Spectrum',
    amount: 29.99,
    phoneNumber: '+1-855-SPECTRUM',
    status: 'in-progress',
    createdAt: new Date('2024-01-17T10:00:00Z'),
    updatedAt: new Date('2024-01-17T11:30:00Z'),
    description: 'Charged for premium channels that were supposed to be part of promotional package.',
    documentUrl: '/uploads/spectrum-bill-jan-2024.pdf',
    calls: mockCallRecords3,
    priority: 'low'
  },
  {
    id: 'dispute-4',
    title: 'Electric Bill Meter Reading Error',
    company: 'ConEd',
    amount: 156.78,
    phoneNumber: '+1-800-CONED',
    status: 'pending',
    createdAt: new Date('2024-01-18T09:15:00Z'),
    updatedAt: new Date('2024-01-18T09:15:00Z'),
    description: 'Electric bill shows usage that is 3x higher than normal monthly consumption.',
    documentUrl: '/uploads/coned-bill-jan-2024.pdf',
    calls: [],
    priority: 'high'
  },
  {
    id: 'dispute-5',
    title: 'Credit Card Annual Fee',
    company: 'Chase Bank',
    amount: 95.00,
    phoneNumber: '+1-800-CHASE',
    status: 'escalated',
    createdAt: new Date('2024-01-12T16:20:00Z'),
    updatedAt: new Date('2024-01-13T10:45:00Z'),
    description: 'Annual fee charged despite being told it would be waived for first year.',
    documentUrl: '/uploads/chase-statement-jan-2024.pdf',
    calls: [
      {
        id: 'call-5',
        timestamp: new Date('2024-01-13T10:00:00Z'),
        duration: 300,
        status: 'completed',
        transcript: `System: Thank you for calling Chase Customer Service. Your call is important to us. Please hold while we connect you to the next available representative.

[Hold music for 3 minutes]

Agent: Hello, thank you for calling Chase. This is Jennifer. How can I assist you today?

Customer: Hi Jennifer, I'm calling about an annual fee that was charged to my credit card account. I was told when I opened the account that the annual fee would be waived for the first year, but I see a $95 charge on my statement.

Agent: I'm sorry to hear about this concern with your annual fee. I'll be happy to look into this for you. Can you please provide me with your credit card number or the last four digits?

Customer: The last four digits are 7834.

Agent: Thank you. Let me pull up your account... Okay, I can see your account here. I do see the $95 annual fee that was charged on January 10th. Let me check the details of your account opening and any fee waiver information.

Customer: I specifically remember the representative telling me that the annual fee would be waived for the first year when I applied for this card in February 2023. That was one of the main reasons I chose this card.

Agent: I understand, and I can see why this would be frustrating. Looking at your account, I can see that you opened the account on February 15th, 2023. Let me check for any fee waiver promotions that were active at that time... 

Customer: Yes, that's correct. The representative was very clear that there would be no annual fee for the first year.

Agent: I can see in our system that there was indeed a first-year annual fee waiver promotion running during February 2023. However, I'm also seeing that this waiver was set to expire after 12 months, which would have been February 15th, 2024. The annual fee was charged on January 10th, which is actually within the promotional period.

Customer: Wait, so you're saying the fee was charged early? That doesn't make sense.

Agent: Let me look more closely at this... Actually, I see what happened. The annual fee is charged based on your account anniversary date, but there seems to have been a system error. The fee was charged approximately 35 days before it should have been, and it appears the fee waiver wasn't properly applied.

Customer: So this was Chase's mistake?

Agent: It appears so, yes. The fee waiver should have been active until February 15th, 2024, and the annual fee shouldn't have been charged until that date anyway. This looks like a billing system error on our end.

Customer: I want this fee removed immediately. This is exactly the kind of thing that makes customers lose trust in their bank.

Agent: I completely understand your frustration, and you're absolutely right. This was our error, and I want to make it right. However, I need to let you know that I don't have the authority to reverse annual fees. I'll need to escalate this to our billing disputes department.

Customer: How long will that take? I don't want to pay interest on a charge that shouldn't be there.

Agent: I understand your concern about interest charges. What I can do right now is put a temporary dispute credit on your account for the $95 while this is being reviewed. This will prevent any interest from accruing on this charge.

Customer: Okay, but I want this resolved quickly. I shouldn't have to deal with Chase's billing errors.

Agent: You're absolutely right, and I apologize for the inconvenience. I'm escalating this to our billing disputes team with a high priority flag. They typically respond within 7-10 business days, but given that this appears to be a clear system error, it may be resolved sooner.

Customer: What if they don't resolve it in my favor?

Agent: Based on what I'm seeing in your account - the active fee waiver promotion and the early charging of the annual fee - I'm confident this will be resolved in your favor. But if for any reason it isn't, you can always call back and ask to speak with a supervisor.

Customer: Fine. What's my reference number for this dispute?

Agent: Your dispute reference number is CH-2024-0113-4456. You should receive a letter in the mail within 7-10 business days with the resolution. Is there anything else I can help you with today?

Customer: No, that's all. I just hope this gets resolved properly.

Agent: I understand, and again, I apologize for this error. Thank you for being a Chase customer, and have a good day.

Customer: Thank you.

[Call ended]`,
        outcome: 'escalated',
        notes: 'Billing system error identified. Temporary $95 credit applied. Case escalated to billing disputes team. Reference: CH-2024-0113-4456.'
      }
    ],
    priority: 'medium'
  },
  {
    id: 'dispute-6',
    title: 'Gym Membership Cancellation Fee',
    company: 'Planet Fitness',
    amount: 199.99,
    phoneNumber: '+1-844-PLANET',
    status: 'failed',
    createdAt: new Date('2024-01-10T14:20:00Z'),
    updatedAt: new Date('2024-01-11T16:45:00Z'),
    description: 'Charged cancellation fee despite following proper cancellation procedure and having email confirmation.',
    documentUrl: '/uploads/planet-fitness-cancellation-jan-2024.pdf',
    calls: [
      {
        id: 'call-10',
        timestamp: new Date('2024-01-11T15:00:00Z'),
        duration: 420,
        status: 'completed',
        transcript: `System: Thank you for calling Planet Fitness. Your call may be recorded for training purposes.

[Hold music for 2 minutes]

Agent: Hi, thank you for calling Planet Fitness. This is Jessica. How can I help you today?

Customer: Hi Jessica, I'm calling about a cancellation fee that was charged to my account. I properly cancelled my membership last month and have email confirmation, but I was still charged a $199.99 cancellation fee.

Agent: I'm sorry to hear about this billing issue. Let me look into your account. Can you please provide me with your membership number or the phone number on your account?

Customer: My phone number is 555-987-6543.

Agent: Thank you. Let me pull up your account... Okay, I can see your membership here. I do see that you cancelled your membership on December 20th, 2023, and I can see the cancellation fee that was charged on January 5th.

Customer: Right, but I followed all the proper procedures. I gave the required 30-day notice and received email confirmation. I shouldn't have been charged this fee.

Agent: I understand your frustration. Let me review your cancellation details... I can see that you did submit a cancellation request on December 20th. However, according to our records, your membership agreement includes an early termination fee clause.

Customer: What do you mean early termination? I've been a member for over two years and I gave proper notice.

Agent: Let me check your membership start date... I see you started your membership on March 15th, 2022. However, you signed up for our 3-year commitment plan, which means your contract doesn't expire until March 2025. Cancelling before then triggers the early termination fee.

Customer: That's not what I was told when I signed up. The sales representative said I could cancel anytime with 30 days notice. I never agreed to a 3-year commitment.

Agent: I understand your concern, but I'm looking at your signed membership agreement here, and it clearly shows you selected the 3-year commitment plan. This plan offers lower monthly rates in exchange for the longer commitment.

Customer: I want to see that agreement because I never signed up for a 3-year plan. Can you email me a copy?

Agent: I'm not able to email membership agreements due to privacy policies, but you can request a copy by visiting your home club or submitting a written request.

Customer: This is ridiculous. I was misled when I signed up. I want this fee removed from my account.

Agent: I understand your frustration, but the cancellation fee is valid according to your membership agreement. The fee is clearly outlined in the terms you agreed to when you signed up.

Customer: I'm telling you I never agreed to those terms. The sales person lied to me about the cancellation policy.

Agent: I'm sorry, but I can only go by what's in our system and your signed agreement. The early termination fee stands as charged. Is there anything else I can help you with today?

Customer: This is unacceptable. I want to speak to a manager.

Agent: I understand you'd like to speak with a manager, but they're going to tell you the same thing. The fee is valid according to your contract.

Customer: Transfer me to a manager right now.

Agent: Hold on, let me see if a manager is available... I'm sorry, but all managers are currently busy with other calls. You can try calling back later or visit your home club to speak with a manager in person.

Customer: This is terrible customer service. I'm disputing this charge with my credit card company.

Agent: That's your right, but the charge is legitimate according to your membership agreement. Is there anything else I can help you with?

Customer: No, this call has been completely unhelpful.

Agent: I'm sorry you feel that way. Thank you for calling Planet Fitness.

[Call ended]`,
        outcome: 'failed',
        notes: 'Agent refused to remove cancellation fee, citing 3-year commitment clause. Customer disputes signing such agreement. No resolution achieved.'
      }
    ],
    priority: 'high'
  },
  {
    id: 'dispute-7',
    title: 'Insurance Premium Increase',
    company: 'State Farm',
    amount: 89.50,
    phoneNumber: '+1-800-STATEFARM',
    status: 'failed',
    createdAt: new Date('2024-01-08T09:30:00Z'),
    updatedAt: new Date('2024-01-09T11:15:00Z'),
    description: 'Unexpected premium increase without notification or explanation. No claims filed in past 3 years.',
    documentUrl: '/uploads/statefarm-policy-jan-2024.pdf',
    calls: [
      {
        id: 'call-11',
        timestamp: new Date('2024-01-09T10:30:00Z'),
        duration: 360,
        status: 'completed',
        transcript: `System: Thank you for calling State Farm. Para español, presiona dos. Your call may be recorded for quality purposes.

[Hold music for 1 minute]

Agent: Good morning, thank you for calling State Farm. This is Robert. How can I assist you today?

Customer: Hi Robert, I'm calling about my auto insurance policy. My premium increased by $89.50 this month without any notification or explanation. I haven't had any claims in over 3 years.

Agent: I'd be happy to help you understand your premium increase. Can you please provide me with your policy number?

Customer: Yes, it's 45-B7-8821-09.

Agent: Thank you. Let me pull up your policy... Okay, I can see your policy here. I do see the premium increase you're referring to. Let me review what caused this adjustment.

Customer: I should have been notified about any rate changes. I've been a State Farm customer for 15 years and this came as a complete surprise.

Agent: I understand your concern. Looking at your policy, I can see several factors that contributed to this increase. First, there was a statewide rate adjustment due to increased claim costs in your area.

Customer: But I haven't filed any claims. Why should I pay more because of other people's claims?

Agent: I understand that seems unfair, but insurance rates are based on risk pools. When claim costs increase in your area, it affects all policyholders in that region. This is standard practice across the insurance industry.

Customer: What other factors caused the increase?

Agent: I also see that your credit score was re-evaluated during your policy renewal, and there was a slight decrease that impacted your rate.

Customer: My credit score barely changed, and I wasn't told that would affect my insurance rates.

Agent: Credit scoring is disclosed in your policy documents as one of the rating factors we use. It's been part of your policy since you started with us.

Customer: I want this increase reversed. I've been a loyal customer with no claims, and this feels like I'm being penalized for no reason.

Agent: I understand your frustration as a long-time customer. However, these rate adjustments are applied systematically based on actuarial data and state regulations. I don't have the authority to reverse rate increases that are properly calculated.

Customer: Can you transfer me to someone who does have that authority?

Agent: I can transfer you to my supervisor, but they're going to explain the same rating factors. The increase is calculated according to our approved rating methodology.

Customer: I don't care, transfer me anyway.

Agent: Hold on, let me see if my supervisor is available... I'm sorry, but my supervisor is currently on another call. You can hold for about 15 minutes, or I can have them call you back.

Customer: This is ridiculous. I'm going to shop around for other insurance companies.

Agent: That's certainly your right as a consumer. If you do decide to cancel your policy, please note that you'll need to provide 30 days written notice.

Customer: I might just do that. This is terrible customer service.

Agent: I'm sorry you feel that way. Is there anything else I can help explain about your policy today?

Customer: No, this has been a waste of time.

Agent: I understand your frustration. Thank you for calling State Farm.

[Call ended]`,
        outcome: 'failed',
        notes: 'Agent explained rate increase factors but refused to make any adjustments. Customer considering switching insurance providers.'
      }
    ],
    priority: 'medium'
  }
];

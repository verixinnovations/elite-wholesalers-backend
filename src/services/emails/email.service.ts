import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { emailSenderConfig, emailTemplateBuilder } from './config';
import { UserService } from '../../modules/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import { UserRoles } from 'src/modules/user/dto/create-user.dto';
import { EnvConfig } from 'src/common/config/env.config';

@Injectable()
export class EmailService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  sendWelcomeEmail(email: string, name: string, role: UserRoles) {
    const frontendUrl = this.configService.get<string>(EnvConfig.FRONTEND_URL);

    if (role === UserRoles.USER) {
      const mailOptions = emailTemplateBuilder(
        'welcome-user.hbs',
        email,
        'Welcome to Badge',
        'Welcome',
        {
          name,
          title: 'Welcome to Badge',
          url: `${frontendUrl}/dashboard/settings`,
        },
      );
      return emailSenderConfig(mailOptions);
    } else {
      const mailOptions = emailTemplateBuilder(
        'welcome-recruiter.hbs',
        email,
        'Welcome to Badge',
        'Welcome',
        {
          name,
          title: 'Welcome to Badge',
          url: `${frontendUrl}/dashboard/company`,
        },
      );
      return emailSenderConfig(mailOptions);
    }
  }

  async sendVerificationEmail(
    email: string,
    data: { otp: string; name: string },
  ) {
    const mailOptions = emailTemplateBuilder(
      'otp.hbs',
      email,
      `Badge OTP - ${data.otp} is your verification code`,
      'Verification',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // Email Verification
  async sendEmailVerificationEmail(
    email: string,
    data: { verificationLink: string },
  ) {
    const mailOptions = emailTemplateBuilder(
      'email-verification.hbs',
      email,
      'Verify Your Email',
      'Verify Email',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // Password Reset
  async sendPasswordResetEmail(
    email: string,
    data: { userName: string; resetLink: string },
  ) {
    const mailOptions = emailTemplateBuilder(
      'password-reset.hbs',
      email,
      'Reset Your Password',
      'Reset Password',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // Job Posted Successfully
  async sendJobPostedEmail(
    email: string,
    data: {
      employerName: string;
      jobTitle: string;
      jobLocation: string;
      postDate: string;
      jobId: string;
      jobLink: string;
    },
  ) {
    const mailOptions = emailTemplateBuilder(
      'job-posted.hbs',
      email,
      'Your Job is Live!',
      'Job Posted',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // New Application Received (Employer)
  async sendNewApplicationEmail(
    email: string,
    data: {
      employerName: string;
      jobTitle: string;
      candidateName: string;
      yearsExperience: string;
      applicationDate: string;
      candidateSummary: string;
      applicationLink: string;
    },
  ) {
    const mailOptions = emailTemplateBuilder(
      'job-accepted.hbs',
      email,
      'New Application Received',
      'New Application',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // Multiple New Candidates Alert
  async sendNewCandidatesAlertEmail(
    email: string,
    data: {
      employerName: string;
      jobTitle: string;
      newApplicationsCount: number;
      candidate1: string;
      time1: string;
      candidate2: string;
      time2: string;
      candidate3: string;
      time3: string;
      dashboardLink: string;
    },
  ) {
    const mailOptions = emailTemplateBuilder(
      'new-candidate-alert.hbs',
      email,
      'New Candidates Applied',
      'New Candidates',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // Application Submitted (Candidate)
  async sendApplicationSubmittedEmail(
    email: string,
    data: {
      candidateName: string;
      jobTitle: string;
      companyName: string;
      submissionDate: string;
      applicationStatusLink: string;
    },
  ) {
    const mailOptions = emailTemplateBuilder(
      'application-submitted.hbs',
      email,
      'Application Submitted',
      'Application Sent',
      data,
    );
    return emailSenderConfig(mailOptions);
  }
  // Application reviewded (Candidate)
  async sendApplicationReceivedEmail(
    email: string,
    data: {
      candidateName: string;
      jobTitle: string;
      companyName: string;
      dashboardLink: string;
    },
  ) {
    const mailOptions = emailTemplateBuilder(
      'application-submitted.hbs',
      email,
      'Application Reviewed',
      'Application Processing',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // Interview Invitation
  async sendInterviewInvitationEmail(
    email: string,
    data: {
      candidateName: string;
      companyName: string;
      jobTitle: string;
      interviewType: string;
      interviewDateTime: string;
      meetingLink: string;
      notes?: string;
    },
  ) {
    const mailOptions = emailTemplateBuilder(
      'interview-invitation.hbs',
      email,
      'Interview Invitation',
      'Congratulations!',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // Application Rejected
  async sendApplicationRejectedEmail(
    email: string,
    data: {
      candidateName: string;
      jobTitle: string;
      companyName: string;
      jobBoardLink: string;
      notes?: string;
    },
  ) {
    const mailOptions = emailTemplateBuilder(
      'application-rejected.hbs',
      email,
      'Application Update',
      'Application Status',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // Job Posting Deleted/Closed
  async sendJobDeletedEmail(
    email: string,
    data: {
      employerName: string;
      jobTitle: string;
      jobId: string;
      postDate: string;
      closeDate: string;
      totalApplications: number;
      postNewJobLink: string;
    },
  ) {
    const mailOptions = emailTemplateBuilder(
      'job-deleted.hbs',
      email,
      'Job Posting Deleted!',
      'Deleted Job Listing',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // Job Expiring Soon
  async sendJobExpiringEmail(
    email: string,
    data: {
      employerName: string;
      jobTitle: string;
      daysRemaining: number;
      applicationCount: number;
      viewCount: number;
      expiryDate: string;
      renewLink: string;
    },
  ) {
    const mailOptions = emailTemplateBuilder(
      'job-expiring-soon.hbs',
      email,
      'Job Posting Expiring Soon',
      'Renewal Notice',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // Offer Extended
  async sendOfferExtendedEmail(
    email: string,
    data: {
      candidateName: string;
      companyName: string;
      jobTitle: string;
      salaryRange: string;
      employmentType: string;
      locationType: string;
      offerLetterLink: string;
    },
  ) {
    const mailOptions = emailTemplateBuilder(
      'offer-extended.hbs',
      email,
      'Job Offer',
      'Congratulations!',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // Profile Viewed by Employer
  async sendProfileViewedEmail(
    email: string,
    data: {
      candidateName: string;
      companyName: string;
      jobTitle: string;
      jobLink: string;
    },
  ) {
    const mailOptions = emailTemplateBuilder(
      'profile-viewed.hbs',
      email,
      'Your Profile Was Viewed',
      'Profile Viewed',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // Interview Reminder
  async sendInterviewReminderEmail(
    email: string,
    data: {
      candidateName: string;
      companyName: string;
      jobTitle: string;
      interviewDate: string;
      interviewTime: string;
      duration: string;
      interviewFormat: string;
      meetingLink: string;
      interviewLink: string;
    },
  ) {
    const mailOptions = emailTemplateBuilder(
      'interview-reminder.hbs',
      email,
      'Interview Reminder',
      'Upcoming Interview',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // Account Verification Complete
  async sendAccountVerifiedEmail(
    email: string,
    data: { userName: string; dashboardLink: string },
  ) {
    const mailOptions = emailTemplateBuilder(
      'account-verified.hbs',
      email,
      'Account Verified',
      'Welcome to Badge',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // Job Match Alert
  async sendJobMatchAlertEmail(
    email: string,
    data: {
      candidateName: string;
      matchCount: number;
      job1Title: string;
      company1: string;
      location1: string;
      matchScore1: number;
      job2Title: string;
      company2: string;
      location2: string;
      matchScore2: number;
      job3Title: string;
      company3: string;
      location3: string;
      matchScore3: number;
      matchesLink: string;
    },
  ) {
    const mailOptions = emailTemplateBuilder(
      'job-match-alert.hbs',
      email,
      'New Job Matches For You',
      'Job Matches',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // Application Withdrawn
  async sendApplicationWithdrawnEmail(
    email: string,
    data: {
      candidateName: string;
      jobTitle: string;
      companyName: string;
      applicationDate: string;
      withdrawalDate: string;
      jobSearchLink: string;
    },
  ) {
    const mailOptions = emailTemplateBuilder(
      'application-withdrawn.hbs',
      email,
      'Application Withdrawn',
      'Withdrawal Confirmed',
      data,
    );
    return emailSenderConfig(mailOptions);
  }
}

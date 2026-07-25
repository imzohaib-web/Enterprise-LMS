import React from 'react';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import UserMetaCard from '../../components/UserProfile/UserMetaCard';
import UserInfoCard from '../../components/UserProfile/UserInfoCard';
import UserAddressCard from '../../components/UserProfile/UserAddressCard';
import BasicTableOne from '../../components/tables/BasicTables/BasicTableOne';
import DefaultInputs from '../../components/form/form-elements/DefaultInputs';
import Alert from '../../components/ui/alert/Alert';
import Avatar from '../../components/ui/avatar/Avatar';
import Badge from '../../components/ui/badge/Badge';
import Button from '../../components/ui/button/Button';
import ResponsiveImage from '../../components/ui/images/ResponsiveImage';
import AspectRatioVideo from '../../components/ui/videos/AspectRatioVideo';
import SignInForm from '../../components/auth/SignInForm';
import SignUpForm from '../../components/auth/SignUpForm';
import StatisticsChart from '../../components/ecommerce/StatisticsChart';
import MonthlySalesChart from '../../components/ecommerce/MonthlySalesChart';

export const CalendarPage: React.FC = () => (
  <>
    <PageMeta title="Calendar | Enterprise LMS" description="Calendar overview" />
    <ComponentCard title="Schedule Calendar" desc="Upcoming schedules and deadlines">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Interactive calendar for course events and assignment deadlines.
      </p>
    </ComponentCard>
  </>
);

export const ProfilePage: React.FC = () => (
  <>
    <PageMeta title="User Profile | Enterprise LMS" description="User Profile" />
    <div className="space-y-6">
      <UserMetaCard />
      <UserInfoCard />
      <UserAddressCard />
    </div>
  </>
);

export const FormElementsPage: React.FC = () => (
  <>
    <PageMeta title="Form Elements | Enterprise LMS" description="Form Elements" />
    <DefaultInputs />
  </>
);

export const BasicTablesPage: React.FC = () => (
  <>
    <PageMeta title="Basic Tables | Enterprise LMS" description="Basic Tables" />
    <BasicTableOne />
  </>
);

export const BlankPage: React.FC = () => (
  <>
    <PageMeta title="Blank Page | Enterprise LMS" description="Blank Page" />
    <ComponentCard title="Blank Page" desc="Empty container template">
      <p className="text-sm text-gray-500">This is a blank page layout.</p>
    </ComponentCard>
  </>
);

export const LineChartPage: React.FC = () => (
  <>
    <PageMeta title="Line Chart | Enterprise LMS" description="Line Chart" />
    <MonthlySalesChart />
  </>
);

export const BarChartPage: React.FC = () => (
  <>
    <PageMeta title="Bar Chart | Enterprise LMS" description="Bar Chart" />
    <StatisticsChart />
  </>
);

export const AlertsPage: React.FC = () => (
  <>
    <PageMeta title="Alerts | Enterprise LMS" description="Alerts components" />
    <ComponentCard title="Alert Variants" desc="Standard notification alerts">
      <div className="space-y-4">
        <Alert variant="success" title="Success Alert" message="Operation completed successfully." />
        <Alert variant="error" title="Error Alert" message="Something went wrong, please try again." />
      </div>
    </ComponentCard>
  </>
);

export const AvatarsPage: React.FC = () => (
  <>
    <PageMeta title="Avatars | Enterprise LMS" description="Avatar components" />
    <ComponentCard title="Avatar Displays" desc="User profile avatars">
      <div className="flex items-center gap-4">
        <Avatar src="/images/user/owner.jpg" size="xsmall" />
        <Avatar src="/images/user/owner.jpg" size="medium" />
        <Avatar src="/images/user/owner.jpg" size="large" />
      </div>
    </ComponentCard>
  </>
);

export const BadgePage: React.FC = () => (
  <>
    <PageMeta title="Badges | Enterprise LMS" description="Badge components" />
    <ComponentCard title="Badge Statuses" desc="Status labels">
      <div className="flex flex-wrap gap-2">
        <Badge variant="light" color="success">Active</Badge>
        <Badge variant="light" color="warning">Pending</Badge>
        <Badge variant="light" color="error">Closed</Badge>
      </div>
    </ComponentCard>
  </>
);

export const ButtonsPage: React.FC = () => (
  <>
    <PageMeta title="Buttons | Enterprise LMS" description="Button components" />
    <ComponentCard title="Button Styles" desc="Interactive buttons">
      <div className="flex flex-wrap gap-3">
        <Button size="sm" variant="primary">Primary Button</Button>
        <Button size="sm" variant="outline">Outline Button</Button>
      </div>
    </ComponentCard>
  </>
);

export const ImagesPage: React.FC = () => (
  <>
    <PageMeta title="Images | Enterprise LMS" description="Image components" />
    <ComponentCard title="Responsive Image" desc="Optimized media loading">
      <ResponsiveImage src="/images/cover/cover-01.jpg" alt="Cover Image" />
    </ComponentCard>
  </>
);

export const VideosPage: React.FC = () => (
  <>
    <PageMeta title="Videos | Enterprise LMS" description="Video player components" />
    <ComponentCard title="Aspect Ratio Video" desc="Video player preview">
      <AspectRatioVideo />
    </ComponentCard>
  </>
);

export const SignInPage: React.FC = () => (
  <>
    <PageMeta title="Sign In | Enterprise LMS" description="Sign in to your account" />
    <SignInForm />
  </>
);

export const SignUpPage: React.FC = () => (
  <>
    <PageMeta title="Sign Up | Enterprise LMS" description="Register for an account" />
    <SignUpForm />
  </>
);

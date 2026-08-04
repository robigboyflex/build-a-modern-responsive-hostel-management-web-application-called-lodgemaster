# Build a modern, responsive hostel management web application called LodgeMaster

Build a modern, responsive hostel management web application called LodgeMaster.

The application should have three user roles:

1. Student

2. NSS Personnel

3. Hostel Manager

The design should be clean, modern and minimal using Tailwind CSS.

Primary colors:

- Blue (#2563EB)

- White

- Light Gray

The application should have:

- Landing Page

- Authentication

- Student Dashboard

- Manager Dashboard

- Booking Module

- Room Management

- Registration Module

- Profile Management

Use Supabase for authentication and database.

The UI should look like a premium SaaS product with smooth animations, rounded cards, responsive layouts and modern dashboards.
Build a complete authentication system.

Users should be able to:

- Register

- Login

- Logout

- Reset Password

During registration the first step is selecting account type.

Options:

• Student

• NSS Personnel

After selecting the account type, display the registration form.

Common fields:

- Full Name

- Email

- Phone Number

- Password

- Confirm Password

If Student is selected:

- Institution

- Student ID

- Programme

- Level

If NSS Personnel is selected:

- Institution Graduated

- NSS Number

- Service Year

- Place of Posting

Store user role in Supabase.

After successful registration redirect users to the Student Dashboard.

The Hostel Manager account will only be created by the System Administrator.

Create a premium landing page.

Sections:

Hero

Large headline:

"Find and Book Your Hostel Room Easily"

Subheading:

Book your hostel room, upload payment proof and complete your accommodation registration online.

CTA Buttons:

Book a Room

Login

Second Section

Features

• Easy Registration

• Room Booking

• Upload Payment Receipt

• Choose Your Room

• Registration Tracking

Third Section

How It Works

Step 1

Create Account

Step 2

Choose Room Type

Step 3

Make Payment

Step 4

Upload Receipt

Step 5

Choose Room

Step 6

Manager Approval

Footer

Contact

Privacy

Terms

Build the Student Dashboard.

Sidebar:

Dashboard

Book Accommodation

My Registration

Documents

Announcements

Profile

Dashboard cards

Registration Status

Room Selected

Payment Status

Booking Status

Notifications

Latest Announcement

The dashboard should have a professional university portal design.

Create a professional Hostel Manager Dashboard.

Sidebar:

Dashboard

Applications

Students

Rooms

Room Types

Blocks

Floors

Announcements

Settings

Dashboard Statistics

Total Applications

Pending Applications

Approved Applications

Rejected Applications

Available Rooms

Occupied Rooms

Pending Payments

Recent Applications Table

Recent Activities
Create a Room Management module.

Manager can create:

Room Types

Examples

One in a Room

Two in a Room

Three in a Room

Four in a Room

Manager can create:

Blocks

Example

Block A

Block B

Block C

Manager can create Floors

Ground Floor

First Floor

Second Floor

Third Floor

Manager can create Rooms

Room Number

Room Type

Block

Floor

Capacity

Status

Available

Occupied

Maintenance

Hidden

Display rooms in a searchable table with edit and delete actions.

Build the accommodation booking workflow.

Step 1

Display hostel information.

Step 2

Display only room types that are currently available.

Step 3

After selecting room type display available blocks.

Step 4

After selecting block display available floors.

Step 5

Display accommodation summary.

Hostel

Room Type

Block

Floor

Accommodation Fee

Proceed Button

Save booking as Draft.

Booking Status

Pending Payment

After booking is submitted show the hostel payment page.

Display

Account Name

Bank

Account Number

Mobile Money Number

Reference Number

Amount to Pay

Payment Deadline

Important Notice

Please complete payment before uploading your documents.

Button

I Have Made Payment

This redirects to Upload Documents.

Create the document upload page.

Student uploads:

Passport Photograph

Payment Receipt

Student ID or NSS Posting Letter

Ghana Card or Passport

Display upload progress.

Allow PDF

PNG

JPEG

Maximum file size 10 MB.

After upload the student clicks Continue.
Build the room selection page.

Display only rooms matching:

Selected Room Type

Selected Block

Selected Floor

Each room card displays:

Room Number

Capacity

Occupied Beds

Available Beds

Status

Available

Only available rooms can be selected.

Student selects one room.

Save selection.

Status becomes

Pending Verification.

Manager should see all submitted applications.

Each application includes:

Student Information

Uploaded Passport

Payment Receipt

Selected Room

Payment Status

Booking Status

Manager actions:

Approve

Reject

Request Changes

Assign Different Room

Add Notes

After approval the student's registration status changes to:

Registration Confirmed.

Build a profile page.

Student can update:

Phone Number

Emergency Contact

Address

Passport Photo

Change Password

Read-only fields:

Name

Email

Institution

Student ID

Account Type

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/12ee4b28-42e4-4e3b-9cbc-61cdbe47583b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

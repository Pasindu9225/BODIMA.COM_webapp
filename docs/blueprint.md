# **App Name**: Bordima

## Core Features:

- Student Registration & Login: Allows students to register and log in to the platform using email and password.
- Provider Registration & Approval Workflow: Enables boarding providers to register, submit their information for admin approval, and be redirected to a pending approval page. The system tracks provider status (pending, approved, rejected) in MongoDB.
- Admin Dashboard for User & Listing Approval: Provides an admin interface to approve or reject boarding providers and listings, controlling what appears on the student-facing map. Admin uses MongoDB to perform CRUD.
- Provider Dashboard & Listing Management: Allows approved boarding providers to add and manage their listings, view their status, and edit/delete listings. The system tracks listing status (pending, approved, rejected) in MongoDB.
- Map-Based Accommodation Search: Enables students to search for accommodations using an interactive map interface powered by Google Maps API. Only listings with 'approved' status are displayed.
- Generative AI powered Recommendation: LLM tool to provide personalized recommendations of suitable boarding places to students. LLM decides to use information such as a student's course and budget when creating the suggestions.

## Style Guidelines:

- Primary color: Deep blue to convey trust, reliability, and the warmth of Sri Lanka.
- Background color: Very light yellow (#FFF8E1) to create a soft, inviting feel.
- Accent color: Orange (#FF9800) to add vibrancy and highlight important calls to action.
- Body font: 'PT Sans' (sans-serif) for readability and a modern, yet friendly feel.
- Headline font: 'Playfair' (serif) for elegant titles.
- Use simple, clear icons sourced from Google's Material Design icon set.
- Mobile-first design, ensuring a fast and responsive experience on all devices.
- Subtle transitions and animations to enhance user interaction without sacrificing performance.
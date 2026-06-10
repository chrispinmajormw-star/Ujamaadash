# Requirements Document

## 1. Application Overview

**Application Name**: Ujamaadash ETT Malawi Dashboard

**Description**: A web-based dashboard system built with React + Vite + TypeScript for managing training programs and district coordination in Malawi. This update addresses 4 specific enhancement tasks: cluster map responsiveness, training deletion permissions, district assignment visibility, and login/password reset improvements.

## 2. Modification Scope

This PRD covers modifications to the existing Ujamaadash ETT Malawi Dashboard. Changes are limited to the following 4 tasks:

### Task 1: Cluster Map Page Redesign
- Redesign CartographerPage (Cluster Map) for full responsiveness and mobile optimization
- Ensure all map elements (clusters, pins, data overlays) are clearly visible and interactive across all screen sizes
- Improve UI/UX for easier navigation and data visualization

### Task 2: Training Deletion Permission Fix
- Fix permission errors preventing System Admins and District Coordinators from deleting trainings
- Current issue: users receive \"Insufficient Permissions\" or \"Please Fix Form Errors\" messages
- Grant full delete and update permissions for trainings to System Admins and District Coordinators

### Task 3: Admin District Page – Assignment Visibility
- Improve district assignment status visibility on Admin District Page
- Current issue: unclear which districts have assigned District Coordinators (DCs)
- Display assignment status per district: \"Assigned\" (with DC name) or \"Unassigned\"
- Enforce one DC per district rule and prevent duplicate assignments

### Task 4: Login Page Redesign and Password Reset Fix
- Redesign Login Page with modern, clean, responsive design
- Fix broken \"Reset Password\" feature (currently does not read or process input)
- Fix reset link sending, token validation, and password update functionality
- Provide clear user feedback with success/error messages

## 3. Page Structure and Functional Requirements

```
Ujamaadash ETT Malawi Dashboard
├── Login Page (Modified)
├── CartographerPage - Cluster Map (Modified)
├── Admin District Page (Modified)
└── Training Management (Permission Modified)
```

### 3.1 Login Page (Task 4)

#### 3.1.1 Page Redesign
- Modern, clean visual design
- Fully responsive layout for desktop, tablet, and mobile devices
- Clear input fields for username/email and password
- Prominent login button
- Visible \"Reset Password\" link

#### 3.1.2 Password Reset Functionality
- User clicks \"Reset Password\" link
- System displays password reset form with email input field
- User enters email address
- System validates email input and sends reset link to provided email
- Reset link contains secure token
- User clicks reset link and is directed to password reset page
- User enters new password (with confirmation field)
- System validates token and updates password
- System displays success message upon successful password update
- System displays error message if token is invalid or expired

#### 3.1.3 User Feedback
- Display clear success messages for successful login and password reset
- Display clear error messages for:
  - Invalid credentials
  - Email not found
  - Invalid or expired reset token
  - Password validation failures
  - Network errors

### 3.2 CartographerPage - Cluster Map (Task 1)

#### 3.2.1 Responsive Design
- Map container adapts to screen width (desktop, tablet, mobile)
- Map controls (zoom, pan, layer toggles) remain accessible on all screen sizes
- Map legend and data overlays scale appropriately

#### 3.2.2 Map Elements
- Clusters: clearly visible markers representing grouped data points
- Pins: individual location markers with distinct visual styling
- Data overlays: information layers displaying relevant metrics
- All elements maintain interactivity (click, hover, tap) across devices

#### 3.2.3 UI/UX Improvements
- Simplified navigation controls
- Improved visual hierarchy for data visualization
- Touch-friendly controls for mobile devices
- Optimized loading and rendering performance

### 3.3 Training Management - Deletion Permissions (Task 2)

#### 3.3.1 Permission Rules
- System Admins: full delete and update permissions for all trainings
- District Coordinators: full delete and update permissions for trainings within their assigned districts
- Remove permission errors blocking these roles

#### 3.3.2 Delete Training Flow
- User (System Admin or District Coordinator) navigates to training record
- User clicks delete button
- System validates user role and permissions
- System displays confirmation dialog
- User confirms deletion
- System deletes training record
- System displays success message

### 3.4 Admin District Page - Assignment Visibility (Task 3)

#### 3.4.1 District Assignment Status Display
- Each district row displays assignment status:
  - \"Assigned\" with District Coordinator name (if DC is assigned)
  - \"Unassigned\" (if no DC is assigned)
- Status is clearly visible and distinguishable

#### 3.4.2 Assignment Rules
- One District Coordinator per district (enforced)
- System prevents duplicate DC assignments to same district
- When assigning DC to district, system checks for existing assignment
- If district already has DC, system displays error message with current DC name

#### 3.4.3 Assignment Management
- Admin can view all districts with their assignment status
- Admin can assign DC to unassigned district
- Admin can reassign DC (remove current DC and assign new DC)
- System displays assigned DC name for each district

## 4. Business Rules and Logic

### 4.1 Permission System (Task 2)
- System Admin role has unrestricted delete and update permissions for trainings
- District Coordinator role has delete and update permissions for trainings within assigned district
- Permission validation occurs before delete/update operations
- Permission errors are removed for System Admins and District Coordinators

### 4.2 District Assignment Rules (Task 3)
- One-to-one relationship: one district can have only one District Coordinator
- District Coordinator can be assigned to multiple districts (if business rules allow)
- Assignment status must be clearly visible before making new assignments
- Duplicate assignment attempts are blocked with clear error message

### 4.3 Password Reset Security (Task 4)
- Reset tokens are securely generated and time-limited
- Tokens expire after defined period (e.g., 1 hour, 24 hours)
- Tokens are single-use (invalidated after successful password reset)
- Password validation rules are enforced (minimum length, complexity requirements)

### 4.4 Data Integrity Constraints
- All modifications maintain backward compatibility with existing data
- No data loss during permission updates or UI redesigns
- Existing training records, district assignments, and user accounts remain intact

## 5. Exception and Boundary Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User without System Admin or DC role attempts to delete training | Display \"Insufficient Permissions\" error |
| District Coordinator attempts to delete training outside assigned district | Display \"Insufficient Permissions\" error |
| Admin attempts to assign DC to district that already has DC | Display error message with current DC name, prevent assignment |
| User enters invalid email for password reset | Display \"Email not found\" error |
| User clicks expired password reset link | Display \"Token expired\" error, prompt to request new reset link |
| User enters mismatched passwords during reset | Display \"Passwords do not match\" error |
| Map fails to load on mobile device | Display error message, provide retry option |
| Network error during training deletion | Display error message, do not delete record |

## 6. Acceptance Criteria

1. System Admin logs in, navigates to training record, clicks delete, confirms deletion, and training is successfully deleted without permission errors
2. District Coordinator logs in, navigates to training within assigned district, clicks delete, confirms deletion, and training is successfully deleted without permission errors
3. Admin navigates to Admin District Page, views all districts with clear \"Assigned\" (with DC name) or \"Unassigned\" status for each district
4. Admin attempts to assign DC to district that already has DC, system displays error message with current DC name and prevents duplicate assignment
5. User navigates to Login Page on mobile device, page displays responsively with all elements clearly visible and functional
6. User clicks \"Reset Password\" link, enters email, receives reset link, clicks link, enters new password, and password is successfully updated with success message displayed
7. User navigates to CartographerPage on mobile device, map displays responsively with all clusters, pins, and data overlays clearly visible and interactive
8. User zooms and pans map on tablet device, all map controls remain accessible and functional

## 7. Out of Scope for This Release

- New user roles or permission levels beyond System Admin and District Coordinator
- Multi-factor authentication for login
- Training creation or editing workflows (only deletion permissions are modified)
- District creation or deletion functionality
- Bulk assignment of District Coordinators to multiple districts
- Email notification system for password resets (only reset link sending is fixed)
- Map data source changes or new data layers
- Performance monitoring or analytics dashboard
- Internationalization or multi-language support
- Dark mode or theme customization
- Export functionality for district assignments or training data
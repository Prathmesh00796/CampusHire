# CampusHire REST API Documentation

Base URL: `http://localhost:5000/api` (or proxied via frontend at `http://localhost/api`)

All protected routes require an `Authorization` header formatted as:
```http
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication Routes (`/auth`)

### 1.1 Register
- **URL**: `POST /auth/register`
- **Access**: Public
- **Body**:
```json
{
  "email": "student@college.edu",
  "password": "password123",
  "role": "STUDENT",
  "name": "Jane Doe",
  "usn": "1MS21CS099",
  "branch": "CSE",
  "cgpa": 8.75,
  "graduation_year": 2025,
  "active_backlogs": 0,
  "skills": ["JavaScript", "React", "Node.js"]
}
```
- **Success Response** (`201 Created`):
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "email": "student@college.edu",
    "role": "STUDENT"
  }
}
```

### 1.2 Login
- **URL**: `POST /auth/login`
- **Access**: Public
- **Body**:
```json
{
  "email": "admin@campushire.edu",
  "password": "AdminPassword123!"
}
```
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "email": "admin@campushire.edu",
    "role": "ADMIN"
  }
}
```

### 1.3 Get Current User Profile
- **URL**: `GET /auth/me`
- **Access**: Protected (Bearer Token)
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "student@college.edu",
    "role": "STUDENT",
    "studentProfile": {
      "id": 1,
      "name": "Jane Doe",
      "usn": "1MS21CS099",
      "branch": "CSE",
      "cgpa": 8.75,
      "graduation_year": 2025,
      "active_backlogs": 0,
      "skills": ["JavaScript", "React", "Node.js"]
    }
  }
}
```

---

## 2. Job Routes (`/jobs`)

### 2.1 List All Jobs
- **URL**: `GET /jobs`
- **Access**: Public / Authenticated
- **Query Params**:
  - `status` (e.g. `OPEN`, `CLOSED`)
  - `company_id` (numeric)
  - `search` (keyword)
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "jobs": [
    {
      "id": 1,
      "title": "Full Stack Developer",
      "company_id": 1,
      "location": "Bangalore",
      "package_lpa": 12.5,
      "min_cgpa": 7.5,
      "max_backlogs": 0,
      "eligible_branches": ["CSE", "ISE", "ECE"],
      "required_skills": ["React", "Node.js", "SQL"],
      "status": "OPEN",
      "deadline": "2026-10-15T23:59:59.000Z",
      "company": {
        "id": 1,
        "name": "Tech Corp",
        "logo_url": "https://example.com/logo.png"
      }
    }
  ]
}
```

### 2.2 Get Job Details
- **URL**: `GET /jobs/:id`
- **Access**: Public / Authenticated

### 2.3 Create Job
- **URL**: `POST /jobs`
- **Access**: Admin / Recruiter
- **Body**:
```json
{
  "title": "Cloud Engineer",
  "company_id": 1,
  "description": "Designing and deploying cloud-native architectures.",
  "location": "Hyderabad / Remote",
  "package_lpa": 14.0,
  "min_cgpa": 7.0,
  "max_backlogs": 0,
  "eligible_branches": ["CSE", "ISE", "ECE", "EEE"],
  "required_skills": ["AWS", "Docker", "Kubernetes"],
  "graduation_year": 2025,
  "deadline": "2026-11-01T23:59:59.000Z"
}
```

### 2.4 Check Job Eligibility
- **URL**: `POST /jobs/:id/check-eligibility`
- **Access**: Student
- **Success Response** (`200 OK`):
```json
{
  "success": true,
  "eligible": true,
  "score": 100,
  "checks": [
    { "criteria": "CGPA", "required": ">= 7.5", "actual": 8.75, "passed": true },
    { "criteria": "Backlogs", "required": "<= 0", "actual": 0, "passed": true },
    { "criteria": "Branch", "required": "CSE, ISE, ECE", "actual": "CSE", "passed": true },
    { "criteria": "Skills", "required": "React, Node.js, SQL", "actual": "React, Node.js, SQL", "passed": true },
    { "criteria": "Graduation Year", "required": 2025, "actual": 2025, "passed": true }
  ]
}
```

---

## 3. Application Routes (`/applications`)

### 3.1 Apply for a Job
- **URL**: `POST /applications`
- **Access**: Student
- **Body**:
```json
{
  "job_id": 1,
  "cover_letter": "I have extensive experience with Node.js and React."
}
```

### 3.2 List Student's Applications
- **URL**: `GET /applications/my-applications`
- **Access**: Student

### 3.3 List Applications (Admin / Recruiter)
- **URL**: `GET /applications`
- **Access**: Admin / Recruiter
- **Query Params**: `job_id`, `status`

### 3.4 Update Application Status
- **URL**: `PATCH /applications/:id/status`
- **Access**: Admin / Recruiter
- **Body**:
```json
{
  "status": "SHORTLISTED"
}
```
*Valid Statuses*: `APPLIED`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `SELECTED`, `REJECTED`.

---

## 4. Interview Routes (`/interviews`)

### 4.1 Schedule Interview
- **URL**: `POST /interviews`
- **Access**: Admin / Recruiter
- **Body**:
```json
{
  "application_id": 1,
  "round_type": "TECHNICAL",
  "scheduled_at": "2026-10-05T10:00:00Z",
  "meeting_link": "https://meet.google.com/abc-defg-hij",
  "interviewer_name": "Dr. Alan Turing"
}
```

### 4.2 Update Interview Result / Feedback
- **URL**: `PATCH /interviews/:id/result`
- **Access**: Admin / Recruiter
- **Body**:
```json
{
  "status": "COMPLETED",
  "result": "PASSED",
  "feedback": "Strong algorithmic and problem-solving fundamentals."
}
```

### 4.3 Get Student's Interviews
- **URL**: `GET /interviews/my-interviews`
- **Access**: Student

---

## 5. Placement Routes (`/placements`)

### 5.1 Confirm Placement
- **URL**: `POST /placements`
- **Access**: Admin
- **Body**:
```json
{
  "student_id": 1,
  "job_id": 1,
  "package_lpa": 12.5,
  "joining_date": "2025-07-01",
  "offer_letter_url": "https://campushire.edu/offers/jane_doe.pdf"
}
```

### 5.2 List All Placements
- **URL**: `GET /placements`
- **Access**: Admin / Recruiter

### 5.3 Get Student's Placement Details
- **URL**: `GET /placements/my-placement`
- **Access**: Student

---

## 6. Dashboard & Analytics (`/dashboard`)

### 6.1 Admin Placement Analytics
- **URL**: `GET /dashboard/admin`
- **Access**: Admin
- **Response**:
```json
{
  "success": true,
  "stats": {
    "totalStudents": 150,
    "placedStudents": 98,
    "placementRate": 65.3,
    "averagePackageLPA": 9.4,
    "highestPackageLPA": 44.0,
    "activeJobs": 14,
    "totalCompanies": 28
  },
  "branchWisePlacements": [
    { "branch": "CSE", "placed": 50, "total": 60 },
    { "branch": "ECE", "placed": 28, "total": 40 }
  ]
}
```

### 6.2 Student Dashboard Summary
- **URL**: `GET /dashboard/student`
- **Access**: Student
- **Response**:
```json
{
  "success": true,
  "appliedCount": 4,
  "shortlistedCount": 2,
  "interviewCount": 1,
  "placementStatus": "PLACED"
}
```

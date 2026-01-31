---
name: managing-members
description: Authority on Member Lifecycle, Validation logic, and MCO/FM4 bridging. Use this skill when the user asks to manage users, validate sign-ups, configure EmailJS notifications, or modify 'assets/js/modules/cms-members.js'.
---

# Managing Members Skill (Business Logic)

> **Fuente de Verdad**: [standard-module-guide.md](file:///Users/lucianopieve/Documents/FormulaMid%204/docs/architecture/standard-module-guide.md)  
> **Tabla DB**: `public.members`

---

## 🧠 Role & Responsibility

1.  **Gatekeeper**: Sole authority on validating new member requests from the public web (MCO).
2.  **Bridge**: Manages data flow between **Midnight Club Online** (Client-side) and **FormulaMid 4** (Admin-side).
3.  **Security**: Enforces unique constraints (DNI, Email) and manages access passwords.

## 💾 Source of Truth

*   **Status Enum**:
    *   `pendiente`: Registered via MCO form. No Dashboard access.
    *   `activo`: Approved by Admin. Has `member_id` (e.g., MC-1234). Access granted.
    *   `rechazado`: Denied. No access.
    *   `banned`: Revoked access.

---

## 📐 Validation Rules

*   **Instagram**: MUST start with `@` (e.g., `@usuario`). If URL is provided, strip domain.
*   **Age**: **Strict 18+**. Compare `nacimiento` date vs `Current Date`.
*   **Phone**: E.164 format preferred.
*   **Uniqueness**: Email and DNI must be unique in the database.

---

## 📧 EmailJS Protocols (Strict Configuration)

All email operations **MUST** use these exact credentials.

*   **Service ID**: `service_j7h80jk`
*   **Public Key**: `FaYbPCI_5oJSsC9g4`

### Templates Map

| Action | Template ID | Required Variables |
| :--- | :--- | :--- |
| **Member Approved** | `template_l425bfo` | `to_name`, `to_email`, `member_id`, `access_password`, `login_url` |
| **Password Recovery**| `template_kuhhdwl` | `to_name`, `to_email`, `recovery_code` |
| **Birthday Greeting**| `template_rmkp7zo` | `to_name`, `to_email`, `discount_code` |

---

## 💻 Implementation Standards

### 1. Approval Logic (Backend/JS)

When approving a member, you must generate a password and ID *before* updating the DB.

```javascript
async function approveMember(dbId, memberData) {
    // 1. Generate Credentials
    const memberId = window.Utils.generateNextMemberId(); // Format: MC-XXXX
    const tempPass = window.Utils.generateRandomPass(6);  // Uppercase 6 chars
    
    // 2. Update DB using window.sb
    const { error } = await window.sb
        .from('members')
        .update({ 
            status: 'activo', 
            member_id: memberId, 
            access_password: tempPass 
        })
        .eq('id', dbId);

    if (error) throw error;

    // 3. Send Email (Non-blocking)
    sendApprovalEmail(memberData, memberId, tempPass);
}
```

### 2. UI Constraints (CMS Module)

*   **File**: `assets/js/modules/cms-members.js`
*   **Visuals**: Must use standard UI classes.
*   **Feedback**: Use `window.Toast` for "Aprobado correctamente", never `alert()`.

---

## ✅ Quality Checklist (DoD)

Before finishing a members-related task:

- [ ] **Validation**: Did I ensure Instagram handles have the `@` prefix?
- [ ] **Security**: Is the `access_password` generated securely?
- [ ] **Notification**: Is `emailjs.send()` called with the correct Template ID (`template_l425bfo`)?
- [ ] **State**: Does the status transition strictly follow `pendiente` -> `activo`?
- [ ] **Globals**: Used `window.sb` and `window.Utils`?

---

## 🔗 Referencias

- [Guía de Módulos](file:///Users/lucianopieve/Documents/FormulaMid%204/docs/architecture/standard-module-guide.md)
- [Tokens CSS](file:///Users/lucianopieve/Documents/FormulaMid%204/assets/css/tokens.css)
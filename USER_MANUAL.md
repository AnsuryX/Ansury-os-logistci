# Ansury Logistics OS — Enterprise Operations Manual & User Guide

Welcome to the **Ansury Logistics OS** (Ansury Cargo Financial OS) comprehensive user manual. This guide is designed for Company Owners, Chief Financial Officers, Operations Controllers, Fleet Dispatchers, and Corridor Prime Mover Drivers operating across the East African Northern Corridor (*Mombasa – Nairobi – Malaba – Kampala – Kigali – Juba*).

---

## 1. System Overview & Architecture

Ansury Logistics OS is an enterprise-grade ERP and financial intelligence platform purpose-built for cross-border haulage and logistics. It directly bridges the gap between raw transport operations (GPS telematics, CANBUS fuel meters, electronic cargo seals, weighbridge slips) and audit-grade financial accounting (I&M Bank & M-Pesa B2C automated reconciliation, AR aging, KRA Section 23 tax schedules, and statutory financial statements).

### Key System Specifications
* **Operating Currency**: Multi-currency engine operating in **KES** and **USD** (Default Peg: `1 USD = 132.50 KES`).
* **Active Banking Partner**: **I&M Bank Kenya** (Corporate Account: `01306297851250`, BBAN: `IMBLKENA01306297851250`).
* **Mobile Disbursements**: **Safaricom M-Pesa B2C** (Paybill: `809214`, Account: `DISPATCH-FLOAT`).
* **Wire Settlements**: **SWIFT pacs.008 MT103** international wires for cross-border dollar receivables.
* **Corridor Scope**: Northern Corridor (Mombasa Port $\to$ Nairobi ICD $\to$ Nakuru $\to$ Eldoret $\to$ Malaba OSBP $\to$ Jinja $\to$ Kampala $\to$ Kigali $\to$ Juba).

---

## 2. Institutional User Roles & Permissions (Policy SEC-01)

The system enforces strict institutional segregation of duties. Each operator is assigned one of five formal roles:

| Role Title | Access Scope | Write Authority | Approval Authority |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | Full platform access across all modules, settings, and user provisioning. | Complete write access across all entities. | High-level system overrides, user role reassignments. |
| **Senior Financial Controller** | Finance, Reconciliation, Invoices & AR, Statements, Audit Logs. | Invoices, Payments, Classifications, Tax schedules. | Expense vouchers (SEC-04 dual-signoff), bank matches, refund authorizations. |
| **Fleet Operations Manager** | Fleet, Vehicles, Drivers, Dispatches, CANBUS Telemetry, Anomalies. | Vehicle specs, dispatches, driver allocations. | Telemetry debrief sign-offs, anomaly resolutions. |
| **Dispatcher / Operations Clerk** | Dispatches, Trips, Shippers, Expense submissions. | Trip manifests, waybills, shipper delivery notes. | Operational routing updates only. |
| **Corridor Prime Mover Driver** | Driver Workstation (Read-only observability across fleet & trips). | Submitting fuel/toll expense vouchers for assigned truck, daily vehicle inspection sign-off, SOS delay reports. | Zero financial approval rights; all adjustments locked. |

---

## 3. Administrator Guide: User & Security Management

### 3.1 Provisioning a New Operator
1. Navigate to **System $\to$ User Management** in the left sidebar (available only to Super Administrators).
2. Click **"+ Invite New Operator"** in the top right.
3. Fill in:
   * **Full Legal Name** (e.g. `Samuel Kiprono`)
   * **Corporate Email** (e.g. `samuel@ansury.com`)
   * **Institutional Role** (`Super Administrator`, `Senior Financial Controller`, `Fleet Operations Manager`, `Dispatcher / Clerk`, or `Corridor Prime Mover Driver`).
   * **M-Pesa Connected Phone** (e.g. `+254 712 345 678`)
   * **Assigned Prime Mover** (If role is *Driver*, specify vehicle registration, e.g. `KDA 542T`).
4. Click **"Confirm & Provision Operator"**. The user is immediately provisioned, and an immutable entry is written to the cryptographic audit trail.

### 3.2 Resetting an Operator's Password or Issuing an Emergency PIN
1. Locate the operator in the **User & Role Management** table.
2. Click the **"Reset Credential"** button.
3. The system generates a high-entropy temporary credential (e.g. `Ansury-W8K2#7419`). You can click **"Regenerate"** to cycle codes or type a custom credential.
4. Click **"Copy"** to copy the credential to your clipboard.
5. Provide mandatory **Audit Rationale (SEC-01)** (e.g., `Driver lost mobile device at Malaba OSBP, temporary dispatch clearance issued`).
6. Optionally check **"Require operator to create new password upon next login"**.
7. Click **"Issue Credential & Log Audit"**.

### 3.3 Reassigning an Operator Role
1. Click **"Change Role"** on the target user's row.
2. Select the **New Target Role**.
3. Input mandatory **Audit Justification** explaining the promotion, reassignment, or operational need.
4. Click **"Apply Role Change"**. Privileges update immediately in real time.

### 3.4 Deactivating & Reactivating Operators (Zero Silent Deletion)
In compliance with international financial compliance and forensic auditing standards, operator records are **never permanently deleted**:
* To suspend access, click **"Deactivate"**, enter an operational reason (e.g., `Annual leave / Contract suspension`), and confirm. The operator is soft-disabled with immediate token invalidation.
* To restore access, click **"Reactivate"**, enter an audit justification, and confirm.

---

## 4. Corridor Driver Guide: Driver Portal & Workstation

When logged in with the **Driver** role, the interface automatically transforms into a mobile-optimized, distraction-free **Driver Workstation** tailored for in-cab operation on mobile tablets or smartphones.

### 4.1 Shift & Location Status Switcher
At the top of the Driver Portal:
1. **Shift Status**: Toggle between **"Driving (On-Duty)"**, **"Border Queue"**, and **"Mandatory Break"**. This syncs with fleet telemetry to prevent unauthorized night driving.
2. **Corridor Location**: Select your current milestone from the dropdown (e.g. *Mombasa Port Gate 2*, *Mtito Andei Rest Stop*, *Nairobi ICD*, *Eldoret Bypass Shell*, *Malaba OSBP Border*, *Kampala Bweyogerere*).
3. **Odometer Reading**: Click the **Odometer** pill (e.g. `148,290 KM`) to update your truck's mileage.

### 4.2 Pre-Trip Safety & ECTS Cargo Inspection
Before departing or upon shift handover, complete the 6-point statutory inspection:
* [x] **Tyres & Wheel Nut Torque**: Dual drive tyres, pressure & lug nuts.
* [x] **Dual 600L Fuel Tanks**: Aluminum tanks, drain plugs tight, anti-siphon mesh intact.
* [x] **Engine Oil & Coolant**: Normal range, zero hose seepage.
* [x] **Air Brake Dual Pressure**: Tanks charged $> 8.0$ Bar, zero audible leak.
* [x] **ECTS Electronic Cargo Seal**: Armed, green antenna pulse verified.
* [x] **Safety Gear & 9kg Extinguisher**: Triangles, high-vis jacket, valid dry powder.
Tap **"Sign & Submit Inspection"** to digitally stamp and transmit the clearance to the Fleet Operations Controller.

### 4.3 30-Second Snap & Submit Fuel Receipt
When refuelling at Shell, TotalEnergies, or Rubis, or paying bridge tolls:
1. Tap the bright blue **"Snap & Submit Fuel Receipt (30-Sec)"** button.
2. Enter the **Amount in KES** and select the category (*Corridor Fuel Advance*, *Weighbridge Toll*, *Border Clearance Duty*).
3. Enter the **M-Pesa Ref** or POS receipt number.
4. Upload or snap the paper receipt. The OCR engine reads the fiscalized text, verifying KRA TIMS compliance.
5. Tap **"Submit Expense Claim"**. The claim appears on the controller's desk under pending review.

### 4.4 Corridor SOS & Delay Reporting
If you experience a roadside emergency:
1. Tap **"Corridor SOS / Report Delay"**.
2. Select the category:
   * *Malaba / Busia Border Customs Queue (> 4 hrs)*
   * *KeNHA Weighbridge Congestion / Calibration Hold*
   * *Mechanical Breakdown / Tyre Puncture / Towing*
   * *Fuel Card POS Terminal Declined / Float Required*
3. Provide your exact milestone and a brief note.
4. Tap **"Broadcast SOS to Dispatch"** to trigger high-priority alerts to Central Dispatch. Direct breakdown hotline: `+254 711 002 918`.

### 4.5 Digital Transit Waybills & Dockets
Tap **"View Waybill Docket"** on your active dispatch to view and print the electronic carrier transit waybill with consignor, consignee, cargo weight, and electronic seal dockets.

---

## 5. Financial Controller Guide: Reconciliation & Treasury

### 5.1 3-Way Automated Match Engine
Ansury OS automatically matches bank feeds against ERP haulage ledgers:
1. Navigate to **Finance $\to$ Bank & MPESA Reconcile**.
2. Review the four transaction queues:
   * **Auto-Matched**: High-confidence algorithmic matches (e.g. M-Pesa B2C Paybill settlements matching corridor expense vouchers).
   * **Review Required**: Transactions with minor date or amount variances requiring manual controller sign-off.
   * **Unmatched Statement**: Inbound wires or POS debits not yet tied to a waybill.
   * **ERP Open Sub-Ledger**: Uncollected freight invoices or unvouched driver advances.
3. For items requiring review:
   * Click **"Confirm Match"** to lock the pairing.
   * Click **"Classify"** to assign an unmapped transaction to a specific vehicle asset, corridor, and sub-ledger expense code.
   * Click **"Reject"** to soft-delete an erroneous transaction with mandatory audit rationale.

### 5.2 Policy SEC-04: Dual-Authorization on Expenses
To prevent internal fraud and self-dealing:
* **The submitter of an expense voucher can NEVER approve their own voucher.**
* If an operator attempts self-approval, the system blocks the action with: `Policy SEC-04 Violation: Submitter cannot approve their own claim. Independent Controller required.`
* Controllers click **"Approve"**, **"Hold"**, or **"Disallow"** (with Section 23 KRA tax disallowance tracking).

### 5.3 Accounts Receivable (AR) & Invoice Lifecycle
1. Navigate to **Finance $\to$ Invoices & AR**.
2. View accounts receivable aging across standard credit buckets: `Current (0-30d)`, `31-60d`, `61-90d`, and `90d+ Overdue`.
3. To generate an invoice:
   * Click **"+ New Invoice"**.
   * Select the Customer (e.g., *Bolloré Transport*, *TotalEnergies Marketing*, *Nile Breweries*).
   * Select Vehicle, Waybill number, and Corridor.
   * Enter Agreed Freight Rate in USD or KES.
   * Click **"Issue Invoice"**.
4. **Recording Partial Payments**: Click **"Record Payment"** on any invoice. Enter the incoming wire amount (e.g. USD $5,000 partial on a $12,500 invoice). The system decrements the outstanding AR balance without double-counting revenue.
5. **Print Tax Invoice**: Click the printer icon on any invoice to generate a KRA-compliant PDF tax invoice complete with PIN, QR code, corridor route, and bank wire instructions.

### 5.4 Exporting Financial Statements & KRA Tax Schedules
* **Full Financial Statement Export**: On **Financial Statements**, click **"Export Statements (CSV/Excel)"** to download the consolidated Income Statement, Balance Sheet, and Direct Cash Flow Statement.
* **KRA Section 23 Fuel Schedule**: On **Expenses & Vouchers**, click **"Export KRA Section 23 Schedule (CSV)"** to generate an auditor-ready schedule of all fuel deductions with TIMS/ETR fiscal numbers.
* **AR Sub-Ledger**: On **Invoices & AR**, click **"Export AR Aging Ledger (CSV)"**.

---

## 6. Fleet Operations Manager Guide: Telemetry & Dispatches

### 6.1 CANBUS Fuel Telemetry & Anomaly Engine
1. Navigate to **Fleet & Fuel $\to$ Anomalies & Engine**.
2. The anomaly engine continuously monitors fuel flow sensors against historical corridor terrain models:
   * **Fuel Spike Alerts**: Sudden drops in fuel volume while moving or excessive L/100km consumption on uphill climbs (e.g. Mai Mahiu escarpment).
   * **Geofence Siphoning Alerts**: Fuel level decrements occurring outside approved fueling depots.
   * **Idle Stop Alerts**: Auxiliary engine running in excess of 45 minutes during unapproved halts.
3. Investigate the incident, conduct driver debriefs, and tap **"Debrief Driver & Resolve Anomaly"** to clear the alert.

### 6.2 Waybill Dispatch & Trip Turnaround
1. Navigate to **Operations $\to$ Trips & Dispatches**.
2. Click **"+ Create New Dispatch Manifest"**.
3. Select Corridor, Origin, Destination, Shipper, Cargo type, Agreed Rate, and assign a Prime Mover and qualified Driver.
4. Track real-time milestone progress (*Dispatched* $\to$ *Mombasa Port Departure* $\to$ *In Transit* $\to$ *Malaba OSBP Border Queue* $\to$ *Customs Clearance* $\to$ *Delivered* $\to$ *Completed*).

---

## 7. Data Management & Factory Reset

Under **Settings & Company $\to$ Data Management**:
* **Purge Demo Data**: Allows operations teams to cleanly wipe initial mock transactions, sample invoices, and test vouchers when preparing to launch live production data.
* **Restore Sample Demo Data**: Allows training instructors, auditors, or executives to instantly restore a rich sample dataset of East African cross-border operations for scenario training and demonstrations.

---

## 8. Quick Shortcut Keys & Command Palette

Press **`Ctrl + K`** (or **`Cmd + K`** on macOS) anywhere in the application to summon the **Command Palette**:
* Type any truck registration (e.g. `KDA 542T`, `KCJ 312L`) to jump directly to its telemetry.
* Type a customer name (e.g. `Bolloré`, `TotalEnergies`) to view their credit ledger.
* Type quick actions like `New Invoice`, `Snap Receipt`, `Export Financials`, or `Launch QC`.

---
*Ansury Logistics OS — Engineered for East African Haulage Excellence.*

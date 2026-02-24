# OpenRides Masterplan

## Vision

OpenRides is a donation-based, bid-driven ride-hailing and delivery platform designed to give fair pricing control back to passengers and fair earnings back to riders.

Unlike traditional ride-hailing platforms that take large commissions, OpenRides allows passengers to set their own bids and riders to negotiate directly. The platform operates as an open-source system where drivers keep their earnings and the platform is sustained through donations and optional ads.

The long-term vision is to create a community-owned mobility network that is transparent, fair, and accessible.

---

# Product Scope

## Core Concept

OpenRides is a:

- Ride-hailing platform
- Delivery platform
- Bid-based negotiation system
- Donation-supported system
- Open-source platform

Passengers propose a price.
Riders accept or negotiate.
Both agree before the trip begins.

---

## User Types

OpenRides supports four user types:

### Passenger

Passengers can:

- Request rides
- Request deliveries
- Set bid prices
- Accept rider offers
- Track trips
- View trip history
- Leave feedback
- Donate to platform

---

### Rider

Riders can:

- Offer rides
- Offer deliveries
- Offer both services
- Accept bids
- Counter-offer bids
- Reject requests
- Track earnings
- Set availability
- Choose service areas

---

### Both (Dual Role)

Some users may be both passengers and riders.

Dual-role users can:

- Switch roles anytime
- Accept rides as riders
- Request rides as passengers
- Maintain one account
- Maintain one identity

Restrictions:

- Cannot switch roles during active trip
- Cannot accept own requests

---

### System Admin

Admins manage platform safety and operations.

Admins can:

- Verify riders
- Approve documents
- Suspend accounts
- Monitor trips
- Resolve disputes
- Moderate reports
- View analytics

---

# Technology Stack

## Frontend

- Expo React Native
- NativeWind
- TypeScript
- TanStack
- OpenStreetMap

## Backend

- Convex
- Better Auth
- Node.js
- pnpm workspace

## Maps

- OpenStreetMap
- OSRM / Valhalla (future routing)

---

# UX Rules

## Design System

All UI must follow these rules:

### Styling

- NativeWind only
- Utility-based styling
- No inline styles

### Buttons

- Fully rounded
- Large tap targets
- Clear primary action

Example:

```
rounded-full px-6 py-3
```

### Inputs

- Fully rounded
- Clear borders
- Accessible labels

Example:

```
rounded-full px-4 py-3
```

### Bottom Sheets

Bottom sheets must:

- Span full device width
- Slide from bottom
- Handle major interactions

Used for:

- Bid submission
- Counter offers
- Ride details
- Driver verification
- Disputes
- Trip completion

---

# Role Entry Flow

## Landing Page

First screen users see.

Options:

- Continue as Passenger
- Continue as Rider
- Continue as Both

Explains:

- What passengers do
- What riders do
- What both means

---

# Authentication Flow

## Signup

User enters:

- Name
- Phone or Email
- Password

Then selects role:

- Passenger
- Rider
- Both

---

# Rider Onboarding Flow

Riders must complete additional steps.

## Step 1: Basic Info

- Name
- Phone
- Address

## Step 2: Vehicle Info

- Vehicle Type
- Plate Number
- Model

Vehicle Types:

- Tricycle
- Motorcycle
- Car
- Taxi

---

## Step 3: Service Selection Page

This page is REQUIRED.

Driver must choose:

```
[ ] Ride Services
[ ] Delivery Services
```

Options:

- Ride Only
- Delivery Only
- Both

This determines:

- What requests they see
- What jobs they can accept

Riders can change this later in Settings.

---

## Step 4: Document Upload

Required:

- License
- ID
- Vehicle Registration

Admin must approve before activation.

---

# Passenger Flow

## Step 1: Open Dashboard

Passenger sees:

- Map
- Request button
- Active requests
- History

---

## Step 2: Create Request

Passenger selects:

Service Type:

- Ride
- Delivery

Vehicle Type:

- Tricycle
- Motorcycle
- Car
- Taxi

Pickup Location
Dropoff Location

Bid Amount

---

## Step 3: Submit Bid

System:

- Sends request to nearby riders
- Filters by service type
- Filters by vehicle type

---

## Step 4: Negotiation

Riders can:

- Accept
- Counter
- Reject

Passenger can:

- Accept
- Counter
- Cancel

---

## Step 5: Ride Active

Passenger sees:

- Rider location
- Rider info
- ETA
- Contact

---

## Step 6: Completion

Passenger can:

- Confirm completion
- Leave feedback
- Donate

---

# Rider Flow

## Step 1: Rider Dashboard

Shows:

- Online status
- Available requests
- Earnings
- History

---

## Step 2: Set Availability

Rider toggles:

- Online
- Offline

---

## Step 3: Request Feed

Only shows requests that match:

- Service type
- Vehicle type
- Distance

---

## Step 4: Negotiation

Rider can:

- Accept
- Counter
- Reject

---

## Step 5: Navigation

Rider sees:

- Pickup
- Dropoff
- Map

---

## Step 6: Completion

Rider marks:

- Completed

System records:

- Earnings
- Distance
- Time

---

# Admin Flow

## Admin Dashboard

Shows:

- Pending Riders
- Active Trips
- Reports
- Analytics

---

## Rider Verification

Admin can:

- Approve
- Reject
- Request resubmission

---

## Trip Monitoring

Admin sees:

- Active rides
- Locations
- Status

---

## Moderation

Admin handles:

- Reports
- Disputes
- Suspensions

---

# Multi Role Flow

Users can switch roles.

Passenger Mode:

- Can request

Rider Mode:

- Can accept

Switching blocked if:

- Active trip exists

---

# Edge Policies

## Low Bid

System:

- Warns passenger
- Allows request

---

## No Riders

System:

- Expires request in 3 minutes
- Suggests:
  - Higher bid
  - Wider radius

---

## Cancellation

Before match:

- Free cancel

After match:

- Flag recorded

---

## Service Eligibility

Hard filters:

- Service type
- Vehicle type

---

## Role Switching

Blocked during:

- Active ride
- Active delivery

---

# MVP Acceptance Criteria

System must support:

- Passenger requests
- Rider acceptance
- Admin verification
- Role switching
- Negotiation
- Tracking

---

## Bottom Sheet Usage

Required for:

- Bidding
- Counter offers
- Ride details
- Ride completion
- Verification
- Disputes

---

# Milestones

## Milestone 1 (MVP)

Includes:

- Authentication
- Roles
- Requests
- Bidding
- Matching
- Tracking
- Verification

---

## Milestone 2 (Future)

Includes:

- SOS
- Trip sharing
- Offline mode
- Smart matching
- Ratings
- Ads
- Donations

---

# Dependency Baseline

| Package     | Version |
| ----------- | ------- |
| typescript  | ^5.9.3  |
| convex      | ^1.28.2 |
| better-auth | ^1.3.34 |
| zod         | ^4.1.12 |

---

# Compatibility Guardrails

Rules:

- Single convex version
- Single auth version
- Single typescript version
- Root overrides enforced

---

# Future Vision

Future goals:

- Open source ecosystem
- Community drivers
- City deployments
- Cooperative model
- Driver unions
- Local governance

---

# Long Term Goal

OpenRides aims to become:

A community-owned alternative to commission-based ride-hailing platforms.

Passengers get fair prices.
Riders keep earnings.
Community owns the system.

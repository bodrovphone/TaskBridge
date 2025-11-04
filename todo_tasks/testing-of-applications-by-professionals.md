Applications Feature - Testing Scenarios

  1. Submitting Applications

  - Apply to a task as a professional (normal flow)
  - Try applying with price = 0 (volunteering - should work)
  - Try applying with negative price (should show validation error)
  - Test different timeline options (Today, 3 days, Week, Flexible)
  - Test message character counter (0→500)
  - Try submitting with empty message (should fail validation)
  - Try submitting with phone number in message (should be blocked)
  - Try submitting with URL in message (should be blocked)
  - Verify success dialog shows after submission
  - Click "View My Application" from success dialog

  2. My Applications Page - Display

  - View applications page with 0 applications (empty state)
  - View applications page with 1+ applications
  - Verify customer name displays correctly (not "Unknown")
  - Verify customer avatar displays if available
  - Verify orange bordered card styling
  - Verify "View Task" button is green and visible
  - Verify blue "Your Proposal" section shows correctly

  3. My Applications Page - Filtering

  - Check "All" tab shows all applications
  - Check "Pending" tab shows only pending
  - Check "Accepted" tab shows only accepted
  - Check "Rejected" tab shows only rejected
  - Check "Withdrawn" tab shows only withdrawn
  - Verify badge counts update correctly for each filter

  4. Application Actions

  - Pending application shows "Withdraw" button (red, bordered)
  - Click "Withdraw" button (mock function for now)
  - Accepted applications don't show withdraw button
  - Rejected applications don't show withdraw button
  - Withdrawn applications don't show withdraw button
  - Click "View Task" button → navigates to task detail page

  5. Localization Testing (EN / BG / RU)

  - Switch to English - verify timeline shows "24h"
  - Switch to Bulgarian - verify timeline shows "24ч"
  - Switch to Russian - verify timeline shows "24ч"
  - Verify submitted date formats correctly in each locale
  - Verify all UI text translates correctly
  - Verify "Flexible" translates (Гъвкав / Гибкий)

  6. Error Cases & Edge Cases

  - Try applying to your own task (should show error: "Cannot apply to your own task")
  - Try applying to same task twice (should show error: "Already applied")
  - Try applying to closed/completed task (should show error: "Not accepting applications")
  - Refresh page while on applications page (should reload correctly)
  - Check with slow network (loading state should show)

  7. Mock Data Verification

  - Verify orange separator shows above mock applications
  - Verify "Mock Applications (For UI Reference)" label displays
  - Verify mock cards have orange-200 border styling
  - Mock applications should match real application card layout

  8. Cross-Browser & Mobile

  - Test on Chrome (primary)
  - Test on Safari (if on Mac)
  - Test on mobile viewport (responsive)
  - Test orange card backgrounds don't flicker

  9. Database Integration

  - Verify applications appear immediately after submission
  - Verify application count increments on task
  - Verify customer data loads from database (RLS bypass working)
  - Check browser console for any errors

  10. Navigation Flow

  - Browse tasks → Apply → View My Applications
  - My Applications → View Task → Back to Applications
  - Profile dropdown → My Applications link works
  - Header navigation works correctly
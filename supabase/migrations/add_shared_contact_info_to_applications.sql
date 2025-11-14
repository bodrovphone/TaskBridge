-- Add shared_contact_info field to applications table
-- This stores the contact information that the customer chose to share when accepting the application

ALTER TABLE applications
ADD COLUMN shared_contact_info JSONB DEFAULT NULL;

COMMENT ON COLUMN applications.shared_contact_info IS 'Contact information shared by customer when accepting application (method, phone, email, or customContact)';

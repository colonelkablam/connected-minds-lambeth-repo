export const ACTIVITY_SELECT_FIELDS = `
    a.id,
    a.website,
    a.participating_schools,
    a.provider_name, 
    a.title,
    a.description, 
    a.day,
    TO_CHAR(a.start_date, 'YYYY-MM-DD') AS start_date,  -- Format start_date
    TO_CHAR(a.stop_date, 'YYYY-MM-DD') AS stop_date,    -- Format stop_date 
    a.start_time,
    a.stop_time,
    a.address_id,
    addr.street_1,
    addr.street_2,
    addr.city,
    addr.postcode, -- Use this for mapping
    a.total_spaces, 
    a.spaces_remaining, 
    a.cost, 
    a.contact_email,
    a.target_group,
    a.age_lower,
    a.age_upper
`;

// TO_CHAR(a.start_date, 'DD/MM/YY') AS start_date,  -- Format start_date
// TO_CHAR(a.stop_date, 'DD/MM/YY') AS stop_date,    -- Format stop_date


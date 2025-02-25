// utils/formatData.js

export function formatActivityData(data) {
    return {
        // Strings
        title: data.title?.trim() === "" ? null : data.title,
        provider_name: data.provider_name?.trim() === "" ? null : data.provider_name,
        description: data.description?.trim() === "" ? null : data.description,
        website: data.website?.trim() === "" ? null : data.website,
        contact_email: data.contact_email?.trim() === "" ? null : data.contact_email,
        participating_schools: data.participating_schools?.trim() === "" ? null : data.participating_schools,
        target_group: data.target_group.trim(), // should be string category

        // Time Formatting
        day: data.day.trim(), // should be a string day of the week
        start_date: !data.start_date || data.start_date === "" ? null : data.start_date,
        stop_date: !data.stop_date || data.stop_date === "" ? null : data.stop_date,
        start_time: data.start_time ? `${data.start_time}:00` : null,
        stop_time: data.stop_time ? `${data.stop_time}:00` : null,

        // Numbers (Ensure NaN is converted to null)
        total_spaces: data.total_spaces?.trim() === "" || isNaN(data.total_spaces) ? null : parseInt(data.total_spaces, 10),
        spaces_remaining: data.spaces_remaining?.trim() === "" || isNaN(data.spaces_remaining) ? null : parseInt(data.spaces_remaining, 10),
        age_lower: data.age_lower?.trim() === "" || isNaN(data.age_lower) ? null : parseInt(data.age_lower, 10),
        age_upper: data.age_upper?.trim() === "" || isNaN(data.age_upper) ? null : parseInt(data.age_upper, 10),
        cost: data.cost?.trim() === "" || isNaN(data.cost) ? null : parseFloat(parseFloat(data.cost).toFixed(2)),

        // Address
        street_1: data.street_1?.trim() === "" ? null : data.street_1,
        street_2: data.street_2?.trim() === "" ? null : data.street_2,
        city: data.city?.trim() === "" ? null : data.city,
        postcode: data.postcode?.trim() === "" ? null : data.postcode,
    };
}
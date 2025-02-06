function formatDate(isoDate) {
    const date = new Date(isoDate);
    return {
        day: date.toLocaleDateString('en-GB', { weekday: 'long' }),
        date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    };
}

export default formatDate();
